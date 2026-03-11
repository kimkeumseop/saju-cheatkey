import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 1. Edge 런타임 적용 (Vercel 10초 제한 회피)
export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Saju] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text) throw new Error('AI 응답이 비어있습니다.');
      return text;
    } catch (error: any) {
      console.error(`[Gemini/Saju] Error (Attempt ${i + 1}):`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillarsText = sajuData.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const elementDist = `목:${sajuData.elementsCount['木']}, 화:${sajuData.elementsCount['火']}, 토:${sajuData.elementsCount['土']}, 금:${sajuData.elementsCount['金']}, 수:${sajuData.elementsCount['水']}`;

    if (!apiKey) return NextResponse.json({ success: false, error: 'API 키 누락' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192, // 충분한 토큰 확보
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 대한민국에서 가장 신비롭고 다정한 '마성의 명리학 가이드'야.
      오직 사주 원국의 데이터(오행, 십신, 물상론)만 사용하여 유저의 영혼을 어루만지는 '운명의 속삭임 리포트'를 작성해줘.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: "~해요", "~군요" 같은 우아하고 다정한 경어체. 신비로운 분위기 유지.
      2. 금기: 한자(漢字) 절대 금지. 100% 한글만 사용.
      3. 소제목: 각 섹션마다 유저의 사주 특징에 맞는 시적인 소제목(이모지 포함)을 직접 지어줘.
      4. 분량: 각 섹션은 최소 300자 내외로 정성스럽게 작성해줘.
      5. 형식: 반드시 아래 JSON 구조만 응답해. 설명이나 마크다운은 생략해.

      {
        "section1": { "title": "타이틀", "content": "내용" },
        "section2": { "title": "타이틀", "content": "내용" },
        "section3": { "title": "타이틀", "content": "내용" },
        "section4": { "title": "타이틀", "content": "내용" },
        "section5": { "title": "타이틀", "content": "내용" },
        "section6": { "title": "타이틀", "content": "내용" },
        "section7": { "title": "타이틀", "content": "내용" }
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    
    // JSON 추출 정규식 (마크다운 무시하고 가장 바깥쪽 {} 만 추출)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 응답에서 JSON 형식을 찾을 수 없습니다.');
    
    const jsonString = jsonMatch[0];
    
    try {
      const analysis = JSON.parse(jsonString);
      return NextResponse.json({ success: true, saju: sajuData, analysis });
    } catch (e) {
      console.error('[API/Saju] JSON Parse Failed:', e);
      // 만약 파싱 실패 시, 원본 텍스트를 정리해서라도 반환 시도 (비상 로직)
      throw new Error('AI 응답 구조가 올바르지 않습니다.');
    }

  } catch (error: any) {
    console.error('[API/Saju] Final Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '분석 중 오류 발생',
      debug: responseText.substring(0, 500)
    }, { status: 500 });
  }
}
