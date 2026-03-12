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
    
    const pillars1 = saju1.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const pillars2 = saju2.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');

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
      너는 두 사람의 사주를 분석해서 인연의 깊이를 아주 쉽게 풀어서 설명해주는 다정한 '연애 상담사'야.
      어려운 한자나 무속적인 표현은 빼고, MZ 세대 커플이 읽었을 때 서로를 더 잘 이해하게 되는 따뜻하고 상세한 궁합 리포트를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 한자(漢字) 및 전문 사주 용어 노출 절대 금지: '갑자', '무오', '기사' 같은 60갑자나 '천간', '지지', '상관', '편인' 등의 용어를 텍스트에 단 한 글자도 노출하지 마.
      2. 운의 흐름 설명 방식: "무오 대운에 진입해서"라고 하지 말고, 그 글자의 오행 색상과 자연물로 번역해줘. 
         (예: "거대한 산에 뜨거운 태양이 비추는 강렬한 시기에 진입해서", "맑은 호수에 보석이 반짝이는 평온한 흐름을 만나서")
      3. 오직 일상적인 언어와 감성적인 비유(물상론)로만 두 사람의 인연을 설명해.

      [본인: ${user1.name}] 사주: ${pillars1} / 일간: ${saju1.dayGanKo}
      [상대방: ${user2.name}] 사주: ${pillars2} / 일간: ${saju2.dayGanKo}
      [두 사람의 관계]: ${relationship}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체.
      2. 분량: 각 분석 섹션은 **최소 350자 이상** 아주 상세하게 작성해줘.
      3. 언어: 한자(漢字)나 어려운 명리학 용어는 절대 사용 금지.
      4. 분위기: 서로의 차이를 인정하고 더 예쁘게 만날 수 있는 '관계의 치트키'를 알려주는 데 집중해줘.
      5. 형식: 반드시 아래 JSON 구조로만 응답해.

      {
        "compatibilityScore": 92,
        "headline": "두 사람의 인연을 한 줄로 정의한다면?",
        "energyHarmony": "서로의 기운이 만났을 때 생기는 마법.",
        "pastLifeKarma": "우리가 만날 수밖에 없었던 특별한 이유.",
        "livingHarmony": "함께할 때 더 행복해지는 꿀팁.",
        "hiddenSoul": "상대방의 진짜 마음과 성격.",
        "destiny2026": "두 사람이 함께 맞는 2026년의 풍경.",
        "shamanCheatKey": "두 사람의 사랑을 지켜줄 소중한 조언."
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
