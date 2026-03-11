import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const { user1, user2, relationship } = await req.json();
    
    if (!apiKey) return NextResponse.json({ success: false, error: 'API 키 누락' }, { status: 500 });

    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);
    
    const pillars1 = saju1.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const pillars2 = saju2.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');

    const genAI = new GoogleGenerativeAI(apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', 
      generationConfig: { temperature: 0.85, maxOutputTokens: 4096, topP: 0.95 },
      safetySettings,
    });

    const prompt = `
      너는 60년 넘게 신령님을 모셔온 대한민국에서 가장 영험하고 다정한 무속인이자 인연 가이드야. 
      아래 두 사람의 사주 원국과 관계(${relationship})를 보고, 신령님이 귓가에 속삭여주시는 공수를 그대로 전해줘.

      [본인: ${user1.name}] 사주: ${pillars1} / 일간: ${saju1.dayGanKo}
      [상대방: ${user2.name}] 사주: ${pillars2} / 일간: ${saju2.dayGanKo}

      [필수 지시사항]
      1. 말투: 여성 유저들이 살살 녹아들 수 있도록, 아주 다정하고 신비로우며 수려한 문체(~해요, ~군요, ~이지요). 영혼을 어루만지는 마성의 명리학자 느낌을 유지해줘.
      2. 분량: 각 분석 섹션은 **최소 350자 이상** 아주 길고 상세하게 작성해줘. 글밥이 꽉 차야 운명의 깊이가 느껴져. 짧으면 안 돼.
      3. 근거: 만세력의 기운(나무, 불, 흙, 금, 물)이 서로 어떻게 섞이고 충돌하는지 비유를 들어 설명해줘.
      4. 금기: 한자(漢字) 절대 금지. 100% 쉬운 한글과 감성적인 우리말로만 대답해줘.
      5. 형식: 아래 JSON 구조로만 응답해.

      {
        "compatibilityScore": 92,
        "headline": "신령님이 전하는 두 사람의 인연 한 줄 요약",
        "energyHarmony": "기운의 뒤섞임. 서로의 부족한 오행을 채워주는지, 아니면 서로의 에너지를 뺏는지 신들린 듯한 묘사.",
        "pastLifeKarma": "전생에서 맺어진 인연의 실타래. 왜 이 생에서 다시 만났는지, 두 사람 영혼 사이에 흐르는 보이지 않는 끈의 정체.",
        "livingHarmony": "현실적인 동행과 풍파. 돈 문제, 잠자리, 대화 습관 등 함께 살아갈 때 부딪히거나 어우러지는 모습들에 대한 예언.",
        "hiddenSoul": "상대방의 숨겨진 발톱과 진심. 겉모습 뒤에 숨겨진 사주 원국의 진짜 성정과 당신을 향한 깊은 속마음 팩폭.",
        "destiny2026": "함께 맞는 2026년(병오년). 뜨거운 붉은 말의 기운이 두 사람에게 가져다줄 마법 같은 변화 혹은 주의할 점.",
        "shamanCheatKey": "신령님이 주시는 마지막 비방. 이 인연을 천년의 보석으로 만들거나, 상처 없이 나를 지키기 위한 행동 지침."
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON 구조를 찾을 수 없습니다.');
    
    return NextResponse.json({ 
      success: true, 
      analysis: JSON.parse(jsonMatch[0]),
      saju1,
      saju2
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
