import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { buildMbtiFallbackProfile, getDefaultScoresForType, type MbtiAiProfile } from '@/lib/mbti';
import { MBTI_TYPES, type MbtiTypeCode } from '@/src/data/mbtiTypes';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;
const AI_TIMEOUT_MS = 12000;
const MBTI_CODES = Object.keys(MBTI_TYPES) as MbtiTypeCode[];
const MBTI_CODE_SET = new Set(MBTI_CODES);

function normalizeMbtiList(value: unknown, fallback: string[]) {
  const items = Array.isArray(value)
    ? value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean).slice(0, 3)
    : [];

  return items.length === 3 ? items : fallback;
}

function normalizeMbtiCode(value: unknown, fallback: string) {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return MBTI_CODE_SET.has(code as MbtiTypeCode) ? code : fallback;
}

function normalizeMbtiProfile(profile: unknown, fallback: MbtiAiProfile): MbtiAiProfile {
  if (!profile || typeof profile !== 'object') {
    return fallback;
  }

  const candidate = profile as Partial<MbtiAiProfile>;
  const summary = typeof candidate.summary === 'string' && candidate.summary.trim()
    ? candidate.summary.trim()
    : fallback.summary;

  return {
    summary,
    strengths: normalizeMbtiList(candidate.strengths, fallback.strengths),
    weaknesses: normalizeMbtiList(candidate.weaknesses, fallback.weaknesses),
    goodMatch: normalizeMbtiCode(candidate.goodMatch, fallback.goodMatch),
    cautionMatch: normalizeMbtiCode(candidate.cautionMatch, fallback.cautionMatch),
  };
}

export async function POST(req: Request) {
  let type = 'INTJ';

  try {
    const body = await req.json();
    type = String(body?.type || '').toUpperCase();
    const scores = body?.scores || getDefaultScoresForType(type);
    const typeInfo = MBTI_TYPES[type as keyof typeof MBTI_TYPES];

    if (!typeInfo) {
      return NextResponse.json({ success: false, error: 'Invalid MBTI type' }, { status: 400 });
    }

    const fallbackProfile = buildMbtiFallbackProfile(type);

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        profile: fallbackProfile,
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

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let text = '';

    try {
      text = await Promise.race([
        model.generateContent(prompt).then(async (result) => {
          const response = await result.response;
          return response.text().trim();
        }),
        new Promise<string>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('MBTI AI timeout')), AI_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({
        success: true,
        profile: normalizeMbtiProfile(parsed, fallbackProfile),
      });
    } catch {
      return NextResponse.json({
        success: true,
        profile: fallbackProfile,
      });
    }
  } catch (error: any) {
    const fallbackType = MBTI_CODE_SET.has(type as MbtiTypeCode) ? type : 'INTJ';
    return NextResponse.json({
      success: true,
      profile: buildMbtiFallbackProfile(fallbackType),
      error: error?.message,
    });
  }
}
