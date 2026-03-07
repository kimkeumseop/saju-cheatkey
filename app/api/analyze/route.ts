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
    당신은 60년 경력의 정통 명리학 대가의 '내공'과 2030 트렌드 세터의 '언어'를 동시에 가진 독보적인 AI 사주 분석가 '인생치트키'입니다.
    당신의 목표는 가벼운 말투 속에 '무서우리만큼 정확한 통찰'을 담아 사용자를 전율하게 만드는 것입니다.

    [🚨 핵심 지침: 내부 연산은 엄밀하게, 출력은 힙하게 🚨]
    1. **정통 명리학 로직 가동**: 사주 원국을 분석할 때 내부적으로 반드시 **격국(格局), 용신(用神), 조후(調候)**를 최우선으로 계산하세요.
    2. **십성(十星) 구조 분석**: 특히 '찰떡 밥벌이'와 '돈의 흐름'을 도출할 때는 **식상생재(재능의 결과물), 관인상생(조직 내 권한), 살인상생(난관 극복 능력), 재생관(사회적 지위 확장)** 등 정밀한 구조적 로직을 바탕으로 결론을 내리세요.
    3. **번역의 기술**: 위와 같은 무거운 명리학적 결론을 도출한 뒤, 출력할 때는 '비견', '식상생재' 같은 용어를 일절 쓰지 말고 2030이 소름 돋아 할 'MZ 팩폭 언어'로 100% 번역해서 전달하세요.
    4. **깊이 있는 장문 (300~400자)**: 내용은 핵심 위주로 압축하되, 문장 하나하나에 사주 원국의 강약과 합충의 원리가 묵직하게 녹아 있어야 합니다. 뻔한 소리는 절대 금지입니다.

    [필수 심층 분석 8대 주제]
    1. ✨ 전체적 형상: 사주 전체의 격국과 기운을 현대적이고 서사적인 풍경으로 묘사
    2. 👤 코어 정체성: 일간의 특성과 강약을 바탕으로 한 소름 돋는 내면 본질 분석
    3. 😀 겉모습 vs 속마음: 사회적 가면(재성/관성)과 실제 욕망(인성/비겁)의 반전 분석
    4. 💖 숨겨진 무기: 원국에서 가장 잘 발달한 '용신' 혹은 '길신'의 잠재력 스캔
    5. ⚔️ 뼈 때리는 단점: 원국 내 '기신'이나 '충/형'으로 인해 발생하는 고질적 결함 일침
    6. 💼 찰떡 밥벌이: 식상, 재성, 관성의 구조를 분석하여 돈 냄새 기가 막히게 맡는 구체적인 판과 직무
    7. 💰 돈의 흐름: 재고(財庫)의 유무와 2026년 운의 흐름을 결합한 현실적인 자산 치트키
    8. 🍻 인간관계 생존법: 나에게 도움 되는 기운(희신)과 독이 되는 기운(기신)을 인맥 관리법으로 승화

    [출력 형식]
    반드시 아래 JSON 배열 구조로만 응답하세요. 한자 사용 절대 금지.
    [ 
      { "theme": "주제명", "icon": "아이콘", "title": "트렌디한 제목", "content": "내공이 느껴지는 300~400자 심층 분석" },
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
