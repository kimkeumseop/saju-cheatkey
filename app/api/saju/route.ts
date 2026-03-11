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
    
    // 명리학 데이터 추출
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
        temperature: 0.85,
        maxOutputTokens: 4096,
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 대한민국에서 가장 신비롭고 다정한, 그리고 유저의 영혼을 깊이 이해해주는 '마성의 명리학 가이드'야.
      MBTI 같은 대중적인 지표는 완전히 잊어버려. 오직 사주 원국의 데이터(오행, 십신, 물상론)만 사용하여 유저가 자신의 운명에 살살 녹아들게 만드는 '운명의 속삭임 리포트'를 작성해줘.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: "~해요", "~군요", "~할 거예요" 같은 우아하고 다정한 경어체를 사용해. 영혼을 위로하고 미래를 속삭여주는 따뜻한 톤을 유지해줘.
      2. 금기: 한자(漢字) 절대 금지. 모든 명리학 용어는 쉬운 한글과 감성적인 비유(물상론)로 풀어써줘.
      3. 동적 소제목: 각 섹션마다 고정된 제목 대신, 유저의 사주 특징(물상론)에 맞춰 매번 **다르고 시적인 소제목(이모지 포함)**을 네가 직접 지어내야 해.
      4. 분량: 각 섹션은 최소 300~400자 이상, 수려하고 감성적인 문장으로 깊이 있게 작성해줘.
      5. 형식: 반드시 아래 구조의 순수한 JSON 데이터만 응답해.

      {
        "section1": {
          "title": "영혼의 풍경화 (시적인 소제목)",
          "content": "유저의 일주와 오행을 한 폭의 그림이나 자연물에 비유하여 영혼의 모습을 아름답게 묘사."
        },
        "section2": {
          "title": "타고난 기질과 내면의 거울 (시적인 소제목)",
          "content": "겉모습과 내면의 차이를 다정하게 분석. 숨겨진 진짜 성향을 어루만지는 내용."
        },
        "section3": {
          "title": "당신이 꽃피울 무대 (시적인 소제목)",
          "content": "재물 그릇과 재능 분석. 어떤 환경에서 재능이 빛나고 돈이 자연스럽게 끌려오는지 가이드."
        },
        "section4": {
          "title": "인연의 실타래 (시적인 소제목)",
          "content": "관계를 정돈하는 법과 영혼을 성장시켜줄 '진짜 인연(귀인)'의 모습을 로맨틱하게 묘사."
        },
        "section5": {
          "title": "남몰래 삼킨 눈물 (시적인 소제목)",
          "content": "자꾸 상처받거나 실수하는 패턴을 공감해주고 부드러운 해결책을 속삭여주는 위로."
        },
        "section6": {
          "title": "2026년 운명의 나침반 (시적인 소제목)",
          "content": "2026년(병오년)의 기운이 가져다줄 변화와 용기를 내야 할 타이밍에 대한 조언."
        },
        "section7": {
          "title": "당신을 위한 행운의 부적 (시적인 소제목)",
          "content": "행운의 색상, 장소, 시간대, 마음가짐 등을 선물처럼 정성스럽게 추천."
        }
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    
    // JSON 마크다운 방어 로직
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
