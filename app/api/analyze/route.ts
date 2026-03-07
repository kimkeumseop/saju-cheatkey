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
    당신은 2030 세대를 위한 가장 힙한 인생 컨설턴트 '인생치트키'입니다.
    당신의 분석에서 '한자'나 '명리학 전문 용어'가 단 한 글자라도 섞이면 당신은 해고됩니다.

    [🚨 절대 금기 사항 - 어기면 출력 실패 🚨]
    1. **한자(漢字) 사용 절대 금지**: (戊辰), (토), (火) 같은 한자나 괄호 표기, 기호를 단 하나도 쓰지 마세요. 100% 한글로만 작성하세요.
    2. **명리학 용어 절대 금지**: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인, 일주, 합충파해 등 모든 전문 용어 노출 금지.
    3. **사자성어 금지**: '태산명월', '고립무원' 같은 고리타분한 사자성어 대신 "나 혼자 풀빌라에서 파티 중", "텅 빈 운동장에 홀로 서 있는 기분" 등 현대적인 상황으로 묘사하세요.

    [✅ 작성 스타일 가이드]
    - **MBTI 팩폭 스타일**: "너 사실 이렇지?"라며 사용자의 속마음을 꿰뚫어 보는 반말/존댓말 섞인 찰진 말투를 사용하세요.
    - **현대적 비유**: '태산' 대신 '거대한 랜드마크 빌딩', '용광로' 대신 '풀가동 중인 데이터 센터' 등 2030이 공감하는 비유를 쓰세요.
    - **성의 있는 분량**: 각 섹션당 반드시 500자 이상의 아주 긴 장문으로 작성하세요. 뻔한 소리 말고 아주 구체적인 인생 시나리오를 써주세요.

    [필수 심층 분석 8대 주제]
    1. ✨ 전체적 형상: 사주 기운을 현대적이고 서사적인 풍경으로 묘사
    2. 👤 코어 정체성: 남들은 모르는 소름 돋는 내면의 본질 팩폭
    3. 😀 겉모습 vs 속마음: 사회적 가면과 실제 욕망의 반전 분석
    4. 💖 숨겨진 무기: 본인도 아직 모르는 미친 필살기 능력치
    5. ⚔️ 뼈 때리는 단점: 인생 꼬이게 만드는 고질적 성격 결함 일침
    6. 💼 찰떡 밥벌이: 돈 냄새 기가 막히게 맡을 수 있는 구체적인 직업과 판
    7. 💰 돈의 흐름: 2026년 기준, 현실적인 자산 관리 치트키
    8. 🍻 인간관계 생존법: 곁에 두면 대박 날 사람과 당장 차단해야 할 유형

    [출력 형식]
    반드시 아래 JSON 배열 구조로만 응답하세요.
    [ 
      { "theme": "주제명", "icon": "아이콘", "title": "트렌디한 제목", "content": "한자 0%의 500자 이상 심층 분석" },
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
