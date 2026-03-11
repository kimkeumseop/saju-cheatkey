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

    // 1. 각각의 사주 데이터 독립적 계산 (버그 방지)
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
      너는 대한민국 최고의 MZ 명리학자이자 팩폭 궁합 전문가 '치트키'야.
      아래 두 사람의 사주 데이터를 보고, 두 사람의 인연을 소름 돋게 분석해줘.

      [본인: ${user1.name} (${user1.gender})]
      - 사주: ${pillars1} / 일간: ${saju1.dayGanKo}
      
      [상대방: ${user2.name} (${user2.gender})]
      - 사주: ${pillars2} / 일간: ${saju2.dayGanKo}

      [필수 지시사항]
      1. 점수 산출: 오행의 조화, 일지 합/충, 조후 등을 종합하여 0~100점 사이의 정수 점수(compatibilityScore)를 매겨줘.
      2. 말투: 다정하면서도 뼈를 때리는 신비로운 말투. 한자 절대 금지.
      3. 형식: 아래 JSON 구조로만 응답해. 마크다운 제외.

      {
        "compatibilityScore": 85,
        "headline": "관계를 정의하는 강렬한 한 줄",
        "deepAnalysis": "서로의 성격이 어떻게 충돌하거나 보완되는지 분석",
        "secretThought": "서로를 속으로 어떻게 생각하고 있을지 팩폭",
        "cheatKey": "관계를 위해 꼭 필요한 행동 지침"
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
