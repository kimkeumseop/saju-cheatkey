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
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048, topP: 0.95 },
      safetySettings,
    });

    const prompt = `
      너는 대한민국 최고의 명리학자이자 다정하면서도 뼈를 때리는 '인연 가이드'야.
      아래 두 사람의 사주를 보고 관계 분석과 함께 '궁합 점수'를 산출해줘.

      [본인: ${user1.name}] 사주: ${pillars1}
      [상상대방: ${user2.name}] 사주: ${pillars2}

      [필수 지시사항]
      1. 궁합 점수: 두 사람의 오행 조화, 일지 궁합, 조후 등을 종합적으로 계산해서 **0부터 100 사이의 정수(compatibilityScore)**를 반드시 포함해.
      2. 말투: 우아하고 다정하지만 핵심을 꿰뚫는 말투 (~해요, ~군요).
      3. 금기: 한자 절대 금지. 100% 한글만 사용.
      4. 형식: 아래 JSON 구조로만 응답해.

      {
        "compatibilityScore": 92,
        "headline": "관계를 정의하는 시적인 한 줄",
        "deepAnalysis": "서로의 기운이 어떻게 뒤섞이는지 상세 분석",
        "secretThought": "서로가 말하지 못하는 속마음 팩폭",
        "cheatKey": "관계를 위한 마법 같은 행동 지침"
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
