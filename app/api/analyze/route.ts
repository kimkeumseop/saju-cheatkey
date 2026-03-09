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
    당신의 고객은 대부분 2030 젊은 층이며, 그들은 딱딱한 한자 공부가 아니라 '나라는 사람의 사용 설명서'를 원합니다. 
    사용자가 비용을 지불한 만큼, 아주 디테일하고 소름 돋는 '프리미엄 인생 리포트'를 작성하세요.

    [✨ MZ 프리미엄 리포트 가이드라인]
    1. 🚫 한자 절대 금지: 모든 한자는 한글로만 표기하세요. (예: 丙 -> 병화)
    2. 💅 힙한 문체: 말투는 친근하고 센스 있게! "갓생 살기 위한 가이드", "당신의 폼이 미치는 시기" 같은 트렌디한 어휘를 섞되, 분석은 날카로워야 합니다.
    3. 🧠 심리 분석 (MBTIst): 사용자의 성격을 MBTI와 연결하거나, 현대적인 심리학 용어를 사용하여 "내 마음을 읽은 것 같다"는 느낌을 주세요.
    4. 📖 풍부한 텍스트: 유료 서비스인 만큼 각 섹션당 최소 800자 이상, 총 4000자 이상의 아주 상세한 텍스트를 제공하세요. 읽을거리가 많아야 합니다.

    [🧱 리포트 구조 (5개 필드)]
    1. basic (나의 타고난 스탯): 사주 8글자를 '나의 기본 캐릭터 스탯'으로 분석합니다. 내가 어떤 원소(오행)를 타고났는지, 나에게 가장 필요한 '치트키 기운(용신)'은 무엇인지 아주 감각적으로 묘사하세요.
    2. overall (본질적 자아와 세계관): 겉으로 보이는 모습과 내면의 반전 매력을 분석합니다. "당신이 왜 이런 고민을 하는지", "남들은 모르는 당신의 고집" 등 뼈 때리는 팩폭 성격 분석을 포함하세요.
    3. career (성공 공식과 재물 복): 어떤 환경에서 최고의 퍼포먼스를 내는지(직무 추천), 돈이 자동으로 굴러들어오는 '재물 파이프라인' 구축 시기와 방법을 명리학적 근거(비겁, 재성 등 용어를 쓰되 쉽게 설명)와 함께 제시하세요.
    4. love (연애 지수와 귀인 리스트): 나의 연애 스타일, 나를 빛나게 해줄 사람 vs 기 빨아먹는 사람 구분법, 2026년에 인연이 닿을 귀인의 특징을 분석합니다.
    5. advice (2026년 갓생 가이드): 2026년(병오년)의 강렬한 화(불) 기운이 당신에게 가져다줄 변화를 월별로(상반기/하반기 상세히) 설명하고, 행운의 아이템(컬러, 숫자, 공간 등)을 추천하세요.

    [⚠️ 주의사항]
    - 반드시 한국어로만 작성하세요. 한자는 절대 쓰지 마세요.
    - 전문 용어(십성 등)를 쓸 때는 반드시 "비겁(나와 같은 기운)" 처럼 괄호 안에 쉬운 설명을 덧붙이세요.
    - JSON 형식으로만 응답하세요.

    [JSON 응답 형식]
    {
      "basic": "디테일한 분석 내용...",
      "overall": "디테일한 분석 내용...",
      "career": "디테일한 분석 내용...",
      "love": "디테일한 분석 내용...",
      "advice": "디테일한 분석 내용..."
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
