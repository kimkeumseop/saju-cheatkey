import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

const relationLabels: Record<string, string> = {
  friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자', 'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
  family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료', partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
};

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const { user1, user2, relationship } = await req.json();
    const relationLabel = relationLabels[relationship] || '인연';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);
    
    const pillars1 = saju1.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const pillars2 = saju2.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');

    const genAI = new GoogleGenerativeAI(apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 4096,
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 두 사람의 사주 오행을 분석해서 인연의 깊이를 아주 쉽게 풀어서 설명해주는 다정한 '인생 가이드'야.
      MZ 세대가 읽었을 때 서로를 더 잘 이해하게 되는 따뜻하고 트렌디한 에세이 톤으로 궁합 리포트를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 명리학 용어 노출 절대 금지: '비견', '식상', '편관', '갑자', '무오', '기사' 같은 60갑자나 한자(漢字) 등 어려운 전문 용어는 유저 화면에 단 한 글자도 노출하지 마라.
      2. 금지 단어(Blacklist): '현실적 풍파', '신령님 비방', '기운의 조화', '공수', '살(煞)', '풍파', '액운' 등 무속적이거나 올드한 단어는 절대 사용하지 마.
      3. 자연물 비유: 오직 일상적인 언어와 감성적인 비유(물상론)로만 두 사람의 인연을 설명해. '햇살, 큰 산, 잔잔한 호수, 겨울의 나무' 같은 다정하고 시각적인 자연물 비유를 적극 활용해라.
      4. 관계 동기화: 현재 관계인 [${relationLabel}]에 완벽히 집중해. '직장/사업' 관계라면 '사랑', '설렘' 같은 단어를 피하고 '시너지', '워크플로우', '성장' 같은 비즈니스 키워드를 사용해.

      [유저 정보]
      - 본인: ${user1.name} (사주: ${pillars1} / 일간: ${saju1.dayGanKo})
      - 상대방: ${user2.name} (사주: ${pillars2} / 일간: ${saju2.dayGanKo})
      - 두 사람의 관계: ${relationLabel}

      [필수 지시사항 - 구조와 형식]
      1. 첫 줄은 두 사람의 관계를 한 문장으로 요약하는 부드러운 문장으로 작성해.
      2. 둘째 줄은 반드시 "궁합 점수: NN점" 형식으로만 작성해.
      3. 반드시 아래 6개의 주제를 모두 포함하여 6개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 서로의 기운이 만났을 때 생기는 마법 (총평)
         ② 우리가 만날 수밖에 없었던 특별한 이유 (인연의 끈)
         ③ 함께할 때 더 행복해지는 생활 속 꿀팁 (시너지 포인트)
         ④ 주의해야 할 갈등 포인트와 상대방의 진짜 마음
         ⑤ 두 사람이 함께 맞는 2026년의 풍경 (올해의 운세)
         ⑥ 두 사람의 인연을 예쁘게 지켜줄 다정한 조언
      4. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 6번 등장해야 함)**
         - 소제목(##) 후킹 최적화: 단순히 '갈등 포인트'가 아니라, "비가 내릴 때, 우리가 우산을 나누는 법 ☔️" 처럼 유저의 호기심을 자극하고 공감할 수 있는 대화형 문장으로 작성해라.
      5. 각 섹션의 내용은 **350자 이상** 아주 상세하고 정성스럽게 작성해.

      [필수 지시사항 - AI 글쓰기 절대 규칙 (가독성 최우선)]
      1. 시각적 숨통 틔우기 (초단문 & 줄바꿈): 스마트폰으로 읽는 유저를 위해, 한 문단은 절대 3문장을 넘지 않게 작성해라.
      2. 문단과 문단 사이에는 반드시 명확한 빈 줄(\\n\\n)을 넣어 시각적인 여백을 충분히 만들어라. 절대 글씨가 빽빽한 벽돌(Wall of text)처럼 보이게 하지 마라.
      3. 핵심 문장 볼드체(Bold) 강조: 각 섹션에서 유저가 가장 듣고 싶어 하는 핵심 결론이나 위로의 문장은 마크다운 볼드체(**내용**)를 사용하여 시각적으로 눈에 띄게 하이라이트 해라. (예: "**두 사람은 서로의 빈자리를 채워주는 완벽한 퍼즐 조각 같은 인연이에요.**")
      4. 따뜻한 에세이 톤: 감성적인 웹소설이나 에세이를 읽는 듯한 아주 다정하고 부드러운 경어체("~해요", "~요")를 사용해라.
      5. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.
    `;

    responseText = await generateWithRetry(model, prompt);
    return NextResponse.json({
      success: true,
      analysis: responseText.trim(),
      saju1,
      saju2
    });

  } catch (error: any) {
    console.error('Gunghap API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
