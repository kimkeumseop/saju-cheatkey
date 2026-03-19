import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { buildMbtiFallbackProfile, getDefaultScoresForType } from '@/lib/mbti';
import { MBTI_TYPES } from '@/src/data/mbtiTypes';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = String(body?.type || '').toUpperCase();
    const scores = body?.scores || getDefaultScoresForType(type);
    const typeInfo = MBTI_TYPES[type as keyof typeof MBTI_TYPES];

    if (!typeInfo) {
      return NextResponse.json({ success: false, error: 'Invalid MBTI type' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        profile: buildMbtiFallbackProfile(type),
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `
너는 한국어 MBTI 결과 페이지용 카피라이터다.
대상 유형은 ${type} (${typeInfo.name}, ${typeInfo.emoji}) 이다.
점수는 E ${scores.E}, I ${scores.I}, S ${scores.S}, N ${scores.N}, T ${scores.T}, F ${scores.F}, J ${scores.J}, P ${scores.P} 이다.

다음 JSON만 반환해라.
{
  "summary": "2~3문장, 180자 내외, 과장 없이 따뜻하고 구체적으로",
  "strengths": ["12~28자", "12~28자", "12~28자"],
  "weaknesses": ["12~28자", "12~28자", "12~28자"],
  "goodMatch": "MBTI 1개",
  "cautionMatch": "MBTI 1개"
}

규칙:
- 문장은 자연스러운 한국어로 작성
- 의료, 법률, 운명 단정 금지
- strengths와 weaknesses는 반드시 3개씩
- goodMatch와 cautionMatch는 실제 MBTI 코드 4글자
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ success: true, profile: parsed });
    } catch {
      return NextResponse.json({
        success: true,
        profile: buildMbtiFallbackProfile(type),
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      profile: buildMbtiFallbackProfile('INTJ'),
      error: error?.message,
    });
  }
}
