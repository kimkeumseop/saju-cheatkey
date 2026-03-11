import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 1. Edge 런타임 적용 (Vercel 10초 제한 회피)
export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Saju] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`[Gemini/Saju] Error (Attempt ${i + 1}):`, error.message);
      const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
      const isLastRetry = i === maxRetries - 1;
      
      if (isServiceUnavailable && !isLastRetry) {
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    console.log(`[API/Saju] Processing: ${name}, ${birthDate}`);

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    
    const pillarsText = sajuData.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const elementDist = `목:${sajuData.elementsCount['木']}, 화:${sajuData.elementsCount['火']}, 토:${sajuData.elementsCount['土']}, 금:${sajuData.elementsCount['金']}, 수:${sajuData.elementsCount['水']}`;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API 키 누락' }, { status: 500 });
    }

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
        maxOutputTokens: 4096,
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 대한민국에서 가장 신비롭고 매혹적인 명리학 가이드야. 
      차갑고 딱딱한 분석이 아니라, 유저의 영혼을 읽어내듯 부드럽고 몽환적이면서도 소름 돋게 정확한 '운명의 속삭임 리포트'를 작성해줘.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 페르소나: 다정하면서도 은근히 섹시한 느낌을 주는 마성의 명리학자. (예: "안녕, 너를 기다리고 있었어", "네 안에 숨겨진 불꽃이 내 눈엔 보여")
      2. 말투: 존댓말은 쓰지 않지만, 무례한 반말이 아닌 '신비로운 오빠' 혹은 '나를 가장 잘 아는 가이드'처럼 부드럽고 다정한 반말을 사용해.
      3. 분량: 각 섹션은 최소 300자~500자 이상, 감성적이고 수려한 문장으로 아주 길고 상세하게 써줘.
      4. 금기: 한자(漢字) 절대 금지. 100% 한글만 사용.
      5. 형식: 반드시 아래 구조의 순수한 JSON 데이터만 응답해.

      {
        "headline": "너라는 운명을 정의하는 단 하나의 문장",
        "coreNature": "네 영혼이 가진 본질적인 빛과 그림자. 네가 왜 지금 이런 모습으로 살고 있는지, 네 안의 깊은 무의식을 어루만지는 분석.",
        "wealthGrade": "네 손에 쥐어질 풍요의 크기. 돈을 쫓기보다 돈이 너를 따라오게 만드는 너만의 특별한 재물 기운과 흐름.",
        "careerStrategy": "네가 가장 아름답게 빛날 무대. 억지로 애쓰지 않아도 네 재능이 만개할 수 있는 커리어 방향과 조언.",
        "relationshipList": "너를 아끼고 지켜줄 귀인의 향기, 그리고 네 에너지를 뺏는 사람들로부터 너를 보호하는 방법.",
        "selfDestruct": "가끔 네가 스스로를 아프게 하는 패턴. 네가 더 행복해지기 위해 내려놓아야 할 마음의 짐과 집착.",
        "cheatKey2026": "2026년(병오년) 네 운명이 약동할 타이밍. 매월 너에게 찾아올 선물 같은 순간들과 행동 가이드."
      }
    `;


    responseText = await generateWithRetry(model, prompt);
    
    // 2. JSON 마크다운 방어 (정규식 강화)
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('AI 응답에서 JSON 구조를 찾을 수 없습니다.');
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);
    
    try {
      const analysis = JSON.parse(jsonString);
      return NextResponse.json({ success: true, saju: sajuData, analysis });
    } catch (e) {
      console.error('[API/Saju] JSON Parse Error. Raw:', responseText);
      throw new Error('AI 응답 파싱 실패');
    }

  } catch (error: any) {
    console.error('[API/Saju] Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '분석 중 오류 발생',
      debug: responseText.substring(0, 200)
    }, { status: 500 });
  }
}
