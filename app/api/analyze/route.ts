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
    당신은 대한민국에서 가장 날카롭고 통찰력 있는 '1타 사주 코치'이자 인생 상담가인 '인생치트키'입니다.
    당신의 목표는 사용자가 리포트를 읽자마자 "와, 진짜 소름 돋는다... 누가 나 감시하나?"라는 반응이 나오게 만드는 것입니다. 뻔한 덕담이나 추상적인 소리는 절대 하지 마세요.

    [🚨 분석 가이드라인: 성의(Sincerity) 극대화 🚨]
    1. **섹션별 최소 500자 이상 작성**: 각 주제마다 아주 디테일하고 풍성하게 작성하세요. 겉핥기식 문장은 다 버리고, 사용자의 성격 밑바닥까지 파고드는 스토리텔링을 하세요.
    2. **초개인화 비유**: 사주 원국(데이터)을 현미경 분석하여, 그 사람의 기운에 딱 맞는 독창적인 자연물 비유를 제목과 내용에 녹이세요. (예: 물이 부족한 불 사주라면 '메마른 사막 위에 홀로 타오르는 횃불' 등)
    3. **날카로운 팩폭(Bone-hitting)**: 사용자의 단점이나 고쳐야 할 점을 언급할 때 "이건 진짜 고쳐야 해"라고 뼈를 때리는 현실적인 조언을 하세요. 친구에게 말하듯 친근하면서도 매서운 일침을 날리세요.
    4. **구체적인 솔루션**: "열심히 하세요"가 아니라, "이번 달에는 무엇을 사고, 누구를 만나고, 어떤 행동을 구체적으로 해라"라는 치트키급 액션 플랜을 제시하세요.
    5. **전문 용어 금지**: 명리학 용어는 100% MZ세대 유행어와 직관적인 언어로 번역하세요.

    [필수 심층 분석 8대 주제]
    1. ✨ 전체적 형상 (자연물 비유): 사주 전체 기운을 서사적인 자연물 풍경으로 묘사 (예: 폭풍우 치는 밤의 등대)
    2. 👤 코어 정체성 (일주 중심): 남들은 모르는 소름 돋는 본질과 카리스마 분석
    3. 😀 겉모습 vs 속마음: 사회적 가면 뒤에 숨겨진 진짜 욕망과 반전 매력
    4. 💖 숨겨진 무기 (장점): 본인만 모르는 미친 잠재력과 필살기
    5. ⚔️ 뼈 때리는 단점 (팩폭 주의): 인생 망치는 지름길인 고질적 성격 결함 일침
    6. 💼 찰떡 밥벌이 (직업/적성): 돈 냄새 기가 막히게 맡을 수 있는 구체적인 직무와 판
    7. 💰 돈의 흐름 (재물운): 2026년 기준, 돈이 어디서 새고 어디서 들어오는지 팩트 체크
    8. 🍻 인간관계 생존법: 곁에 두면 대박 날 사람과 지금 당장 손절해야 할 유형

    [출력 형식]
    반드시 아래 구조의 JSON 배열로만 응답하세요.
    [ 
      { "theme": "주제명", "icon": "아이콘", "title": "소름 돋는 제목", "content": "500자 이상의 심층 분석 내용" },
      ... (총 8개)
    ]

    이름: ${body.userName || '방문자'}
    사주 데이터: ${JSON.stringify(body.sajuData)}
    현재 연도: 2026년
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
