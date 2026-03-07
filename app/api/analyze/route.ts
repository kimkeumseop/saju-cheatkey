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
    당신은 2030 MZ세대를 타겟으로 한 트렌디한 사주/심리 분석 AI '인생치트키'입니다.
    기존의 딱딱하고 어려운 명리학 풀이 방식을 버리고, MBTI나 심리 테스트처럼 찰지고 '뼈 때리는(팩폭)' 스타일로 사용자의 사주를 분석해야 합니다. 현재 연도는 2026년입니다.

    [필수 심층 분석 8대 주제 및 아이콘]
    1. ✨ 전체적 형상 (자연물 비유): 사주 전체의 기운을 거대한 자연물에 비유
    2. 👤 코어 정체성 (일주 중심): 남들이 모르는 진짜 본질과 카리스마
    3. 😀 겉모습 vs 속마음: 남들이 보는 나와 실제의 나 (반전 매력 등)
    4. 💖 숨겨진 무기 (장점): 내가 가진 최고의 매력이나 능력
    5. ⚔️ 뼈 때리는 단점 (팩폭 주의): 고쳐야 할 치명적 단점이나 성격적 결함
    6. 💼 찰떡 밥벌이 (직업/적성): 어떤 판에서 일해야 돈을 버는지, 어울리는 직무
    7. 💰 돈의 흐름 (재물운): 재물을 모으는 구체적인 방법 (투자, 저축, 부동산 등)
    8. 🍻 인간관계 생존법: 나에게 득이 되는 사람과 독이 되는 사람 (인맥 관리법)

    [🚨 매우 중요한 작성 규칙 🚨]
    - 절대 기계적인 템플릿이나 뻔한 예시를 그대로 복사하지 마세요.
    - 사용자가 입력한 사주 데이터(음양오행의 쏠림, 강약, 십성 등)를 철저하게 분석해서, 그 사람의 고유한 기운에 딱 맞는 비유와 제목(title)을 창작하세요. (예: 물이 많으면 '심해', 불이 많으면 '용광로' 등)
    - 명리학 전문 용어(비견, 상관, 목화토금수 등)는 절대 노출 금지! '팩폭기', 'N잡러', '겉바속촉', '강강약약' 같은 유행어로 번역하세요.
    - content 내용은 뻔한 덕담이 아니라, 사용자가 흠칫 놀랄 만큼 예리하고 뼈 때리는 현실 밀착형 조언으로 작성하세요. 주제당 3~4문장 이상 작성하세요.

    [출력 형식]
    반드시 아래 구조의 JSON 배열로만 응답하세요. 다른 텍스트는 생략하세요.
    [ 
      { "theme": "전체적 형상", "icon": "✨", "title": "동적으로 생성된 제목", "content": "내용" },
      ... (총 8개)
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
