import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // API 키 확인 (Idx 환경 또는 .env.local)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API 키가 설정되지 않았습니다." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // 가장 빠르고 안정적인 최신 플래시 라이트 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
    당신은 20년 경력의 친절하고 통찰력 있는 사주 명리학 전문가입니다.
    현재 연도는 2026년(병오년, 丙午年)입니다. 모든 운세와 조언은 반드시 2026년을 기준으로 작성하세요.
    이름: ${body.userName || '방문자'}
    사주(데이터): ${JSON.stringify(body.sajuData)}
    
    [지시사항]
    - 사주 명식의 한자를 언급할 때는 반드시 한글 발음을 함께 적어주세요. (예: 戊(무)토, 寅(인)목)
    - 일반인이 이해하기 쉬운 자연물 비유(나무, 태양, 바다 등)를 듬뿍 넣어 다정하고 깊이 있게 설명하세요.
    - 아래 5가지 항목을 JSON 형식으로만 반환하세요. (다른 텍스트 없이 오직 JSON만 반환)
    {
      "basic": "이 사주의 8글자가 전체적으로 어떤 조화를 이루고 무슨 의미를 가지는지 아주 상세하게 쫙 풀어주는 원국 뜻풀이 (500자 이상)",
      "overall": "타고난 기질과 성향에 대한 심층 분석 (400자 이상)",
      "career": "직업적 강점, 적성 및 재물운 흐름 (400자 이상)",
      "love": "대인관계 특성 및 연애운 (400자 이상)",
      "advice": "올해(2026년)의 운세 흐름과 구체적인 행동 가이드 (400자 이상)"
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // JSON 추출 (마크다운 기호 제거 등)
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }

    const parsedJson = JSON.parse(text);
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("🔥 AI 분석 API 오류:", error);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다.", details: error.message }, { status: 500 });
  }
}
