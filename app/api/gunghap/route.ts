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
      너는 두 사람의 사주를 분석해서 인연의 깊이를 아주 쉽게 풀어서 설명해주는 다정한 '연애 상담사'야.
      어려운 한자나 무속적인 표현은 빼고, MZ 세대 커플이 읽었을 때 서로를 더 잘 이해하게 되는 따뜻하고 상세한 궁합 리포트를 작성해줘.

      [본인: ${user1.name}] 사주: ${pillars1} / 일간: ${saju1.dayGanKo}
      [상대방: ${user2.name}] 사주: ${pillars2} / 일간: ${saju2.dayGanKo}
      [두 사람의 관계]: ${relationship}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체. (친한 언니/형이 두 사람의 연애를 응원하며 조언해주는 느낌)
      2. 분량: 각 분석 섹션은 **최소 350자 이상** 아주 상세하게 작성해줘. 내용이 풍성해야 두 사람의 인연이 얼마나 소중한지 와닿을 수 있어.
      3. 언어: 한자(漢字)나 어려운 명리학 용어(충, 합, 상생 등)는 절대 사용 금지. 대신 "서로 끌리는 자석 같은 기운", "서로의 빈틈을 채워주는 퍼즐"처럼 쉬운 말로 풀어서 설명해.
      4. 분위기: 무조건적인 팩폭보다는, 서로의 차이를 인정하고 더 예쁘게 만날 수 있는 '관계의 치트키'를 알려주는 데 집중해줘.
      5. 형식: 아래 JSON 구조로만 응답해.

      {
        "compatibilityScore": 92,
        "headline": "두 사람의 인연을 한 줄로 정의한다면?",
        "energyHarmony": "서로의 기운이 만났을 때 생기는 마법. (서로를 편안하게 해주는지, 아니면 열정을 깨우는지 아주 상세하게)",
        "pastLifeKarma": "우리가 만날 수밖에 없었던 특별한 이유. (운명적인 끌림이나 서로에게 배우게 될 점들)",
        "livingHarmony": "함께할 때 더 행복해지는 꿀팁. (대화 방식, 돈 관리, 일상적인 습관 등 현실적으로 잘 맞춰가는 법)",
        "hiddenSoul": "상대방의 진짜 마음과 성격. (사주 원국에 숨겨진 상대방의 다정함이나 유저를 향한 진심 엿보기)",
        "destiny2026": "두 사람이 함께 맞는 2026년의 풍경. (내년에 두 사람에게 찾아올 좋은 기회나 함께 조심할 점)",
        "shamanCheatKey": "두 사람의 사랑을 지켜줄 소중한 조언. (이 인연을 더 단단하게 만들기 위해 지금 당장 하면 좋은 행동)"
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
