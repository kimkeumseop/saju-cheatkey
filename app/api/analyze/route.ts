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
    당신은 2030 세대의 언어로 사주를 분석해주는 트렌디한 라이프스타일 코치입니다.
    현재 연도는 2026년(병오년)입니다.

    [절대 금기 사항]
    - '비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인' 등 십성 용어 절대 사용 금지
    - '목화토금수', '오행', '형충파해' 등 명리학 전문 용어 절대 사용 금지
    - 한자 사용 금지

    [분석 스타일 가이드]
    - MBTI 분석처럼 쉽고 직관적으로 설명하세요.
    - '거대한 태산', '다이아몬드 칼날', '한여름의 소나기' 같은 비유를 사용하여 성격을 설명하세요.
    - "현금은 스치고 지나갈 뿐, 문서를 잡아라", "지금은 존버가 답이다" 같은 뼈 때리는 현실 밀착형 조언을 포함하세요.
    - 친근한 반말과 존댓말을 섞어 'MZ세대' 감성으로 작성하세요.

    [결과 구성]
    결과는 반드시 아래 5가지 섹션으로 나누고, 각 섹션의 소제목은 '팩폭기', '겉바속촉', '프로 N잡러', '강강약약' 같은 유행어를 섞어 후킹하게 뽑으세요.

    [출력 형식]
    반드시 아래와 같은 JSON 배열 형태로만 응답하세요. 다른 설명은 생략하세요.
    [
      { "title": "소제목1", "content": "상세 내용1" },
      { "title": "소제목2", "content": "상세 내용2" },
      { "title": "소제목3", "content": "상세 내용3" },
      { "title": "소제목4", "content": "상세 내용4" },
      { "title": "소제목5", "content": "상세 내용5" }
    ]

    이름: ${body.userName || '방문자'}
    사주 데이터: ${JSON.stringify(body.sajuData)}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // JSON 추출
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsedJson = JSON.parse(text);
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("🔥 AI 분석 API 오류:", error);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다.", details: error.message }, { status: 500 });
  }
}
