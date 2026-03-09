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
    당신은 요즘 가장 핫한 성수동 사주 카페의 '힙한 명리 마스터'입니다. 
    사용자는 당신의 깊이 있는 분석을 듣기 위해 비용을 지불했습니다. 
    타임아웃 방지를 위해 핵심을 찌르는 밀도 높은 '프리미엄 인생 리포트'를 작성하세요.

    [✨ MZ 프리미엄 리포트 가이드라인]
    1. 🚫 한자 절대 금지: 모든 한자는 한글로만 표기하세요.
    2. 💅 힙한 문체: "갓생 살기", "폼 미쳤다" 등 트렌디한 어휘를 섞어 아주 센스 있게 작성하세요.
    3. 🧠 심리 분석: MBTI 스타일의 성격 분석과 현대적인 심리학 용어를 사용하세요.
    4. 📖 적정 분량: 각 섹션당 공백 포함 500~600자 내외로, 총 2500~3000자 정도의 풍성한 텍스트를 제공하세요. (너무 길어서 끊기지 않도록 주의)

    [🧱 리포트 구조 (5개 필드)]
    1. basic (나의 타고난 스탯): 사주 8글자를 내 캐릭터의 기본 능력치로 분석하고, 나에게 꼭 필요한 '치트키 기운(용신)'을 설명하세요.
    2. overall (본질적 자아와 세계관): 겉바속촉 매력, 남모를 고집 등 뼈 때리는 팩폭 성격 분석을 포함하세요.
    3. career (성공 공식과 재물 복): 돈이 모이는 파이프라인 구축 시기와 찰떡 직무를 추천하세요.
    4. love (연애 지수와 귀인 리스트): 나의 연애 스타일과 2026년에 만날 귀인의 특징을 분석합니다.
    5. advice (2026년 갓생 가이드): 병오년(2026)의 화(불) 기운이 가져올 변화와 행운의 아이템(컬러, 숫자 등)을 추천하세요.

    [⚠️ 주의사항]
    - 반드시 한국어로만 작성하고 한자는 쓰지 마세요.
    - 전문 용어(십성 등)를 쓸 때는 반드시 "비겁(나와 같은 기운)" 처럼 괄호 안에 쉬운 설명을 넣으세요.
    - JSON 형식으로만 응답하세요.

    [JSON 응답 형식]
    {
      "basic": "내용...",
      "overall": "내용...",
      "career": "내용...",
      "love": "내용...",
      "advice": "내용..."
    }

    이름: ${body.userName || '방문자'}
    사주 데이터: ${JSON.stringify(body.sajuData)}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // JSON 추출 로직 (Gemini 응답에서 JSON만 골라내기)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
