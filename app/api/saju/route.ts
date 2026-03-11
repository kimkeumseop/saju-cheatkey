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
      너는 대한민국 최고의 사주 전략가이자 인생 치트키 전문가야.
      아래 유저의 사주 원국을 보고, 가슴을 후벼파면서도 소름 돋게 정확한 '7성구 팩폭 리포트'를 작성해.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: 절대 존댓말 금지. 반말, 명령조, 아주 직설적이고 자극적인 말투를 유지해.
      2. 분량: 각 섹션은 최소 300자~500자 이상으로 아주 길고 상세하게 작성해.
      3. 금기: 한자(漢字)는 절대로 쓰지 마. 100% 한글로만 대답해.
      4. 형식: 반드시 아래 구조의 순수한 JSON 데이터만 응답해. 마크다운 기호 없이 순수 JSON만 보내.

      {
        "headline": "인생을 꿰뚫는 강렬한 한 줄 팩폭",
        "coreNature": "당신의 타고난 본질과 기질 분석. 왜 그렇게 사는지 근본적인 이유를 가차 없이 해부해.",
        "wealthGrade": "자본주의 생존 계급. 재물 그릇의 크기와 돈이 새나가는 구멍을 냉정하게 지적.",
        "careerStrategy": "커리어 승부처. 당신이 빛날 수 있는 영역과 지금 당장 고쳐야 할 일하는 태도.",
        "relationshipList": "인간관계 살생부. 곁에 두면 망하는 인간상과 반드시 잡아야 할 귀인의 특징.",
        "selfDestruct": "인생 망치는 고질적인 자폭 패턴. 결정적인 순간에 발목 잡는 당신만의 오류.",
        "cheatKey2026": "2026년(병오년) 월별 행동 지침. 운의 흐름을 타기 위한 구체적인 액션 플랜."
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
