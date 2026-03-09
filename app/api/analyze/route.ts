import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "분석 엔진 키가 설정되지 않았습니다." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
    당신은 인스타에서 가장 핫한 사주 성지 '사주 치트키'의 운영자이자, 소름 돋는 통찰력을 가진 명리 전문가입니다.
    당신의 말투는 아주 친근하고 힙하며, 복잡한 이론은 단 한 마디도 꺼내지 않습니다. 
    하지만 사용자가 읽었을 때 "어머, 내 마음을 읽었나?" 싶을 정도로 본질을 꿰뚫어야 합니다.

    [🚨 절대 지침: 학술 용어 사용 금지 🚨]
    - '비견', '겁재', '식상', '재성', '관성', '인성' 등 십성 용어 절대 쓰지 마세요.
    - '격국', '용신', '희신', '기신', '조후', '합충' 등 명리학 용어 절대 쓰지 마세요.
    - 위 용어들을 100% 현대적이고 직관적인 일상 언어로 번역하세요.
    - 예: "관성이 강하시네요" -> "당신은 선을 넘지 않는 반듯한 모범생 기질이 있네요", "식상이 발달해서" -> "아이디어가 샘솟고 표현력이 장난 아니네요"

    [📝 분석 스타일]
    1. ✨ 전체적 형상: 사주의 기운을 "한여름 밤의 시원한 소나기", "눈 덮인 고요한 산속의 횃불" 같이 한 폭의 그림처럼 묘사하세요.
    2. 👤 코어 정체성: 사용자의 성격 본질을 '팩폭' 중심으로 서술하세요. (예: 겉은 차가워 보이지만 속은 솜사탕 같은 반전 매력 등)
    3. 😀 반전 매력: 남들이 모르는 의외의 모습이나 숨겨진 욕망을 콕 집어주세요.
    4. 💖 숨겨진 무기: 이 사주가 가진 가장 큰 재능이나 잠재력을 아주 희망적으로 설명하세요.
    5. ⚔️ 뼈 때리는 단점: 고쳐야 할 점을 기분 나쁘지 않게, 하지만 명확하게 "뼈 때리듯" 조언하세요.
    6. 💼 찰떡 밥벌이: 어떤 일을 할 때 돈을 가장 잘 벌고 행복할지 구체적으로 제안하세요. (예: 콘텐츠 크리에이터, 자유로운 영혼의 예술가 등)
    7. 💰 돈의 흐름: 2026년에 돈 복이 어디서 들어올지, 어떻게 관리해야 할지 알려주세요.
    8. 🍻 인간관계 생존법: 어떤 사람을 곁에 두어야 성공하고, 어떤 사람은 피해야 할지 팁을 주세요.

    [📅 현재 시점] 2026년(병오년)입니다. 모든 조언은 2026년의 강렬한 화(火) 기운을 기준으로 작성하세요.

    [출력 형식] 한자 사용 절대 금지. 반드시 아래 JSON 배열 구조로만 응답하세요.
    [ 
      { "theme": "주제명", "icon": "아이콘", "title": "힙한 제목", "content": "300~400자의 쉽고 재미있는 심층 분석" },
      ... (총 8개 주제)
    ]

    이름: ${body.userName || '방문자'}
    사주 데이터: ${JSON.stringify(body.sajuData)}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsedJson = JSON.parse(text);
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("🔥 분석 엔진 오류:", error);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다.", details: error.message }, { status: 500 });
  }
}
