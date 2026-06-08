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

function getCurrentYear() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(new Date()));
}

function buildDaYunText(daYun: any[]) {
  if (!Array.isArray(daYun) || daYun.length === 0) return '대운 정보 없음';
  return daYun
    .map((dy, index) => {
      const nextAge = daYun[index + 1]?.age ?? dy.age + 10;
      return `${dy.age}세~${nextAge - 1}세: ${dy.ganKo}${dy.zhiKo}(${dy.ganElement}/${dy.zhiElement})`;
    })
    .join(' / ');
}

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
    const currentYear = getCurrentYear();
    
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
        maxOutputTokens: 8192,
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
      - 분석 기준 연도: ${currentYear}년
      - 본인의 10년 주기 흐름: ${buildDaYunText(saju1.daYun)}
      - 상대방의 10년 주기 흐름: ${buildDaYunText(saju2.daYun)}

      [💎 유료 궁합 리포트 깊이 규칙 - 돈 주고 보는 느낌]
      1. 좋은 말만 하지 마라. 잘 맞는 지점, 부딪히는 지점, 오래 가려면 반드시 고쳐야 할 지점을 함께 써라.
      2. 각 섹션은 반드시 **근거**, **현실 장면**, **좋게 쓰는 법**, **조심할 함정**을 포함해라.
      3. 관계 점수는 무조건 높게 주지 마라. 실제로 애매한 조합이면 60점대 또는 70점대도 가능하다.
      4. 두 사람의 관계 유형이 친구/가족/직장/사업이면 연애 표현을 쓰지 말고, 해당 관계의 언어로 설명해라.
      5. 향후 타이밍은 ${currentYear}년만 말하지 말고, 두 사람의 10년 주기 흐름을 함께 보고 **가까워지는 시기**, **멀어지기 쉬운 시기**, **관계를 결정해야 하는 시기**로 나누어라.
      6. 뻔한 조언을 금지한다. "대화를 많이 하세요" 대신 "돈, 일정, 감정 중 무엇을 먼저 확인해야 하는지"처럼 구체적으로 말해라.
      7. 같은 표현을 반복하지 마라. "찰떡", "운명", "빛나요", "따뜻해요"를 과하게 반복하지 마라.
      8. 미래를 100% 단정하지 말고, 선택에 따라 좋아질 수 있는 지점과 방치하면 나빠지는 지점을 함께 보여줘라.

      [필수 지시사항 - 구조와 형식]
      1. 첫 줄은 두 사람의 관계를 한 문장으로 요약하는 부드러운 문장으로 작성해.
      2. 둘째 줄은 반드시 "궁합 점수: NN점" 형식으로만 작성해.
      3. 반드시 아래 7개의 주제를 모두 포함하여 7개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 두 사람의 관계 핵심 브리핑 (점수보다 중요한 진짜 결론)
         ② 끌림과 시너지 포인트 (왜 서로에게 반응하는지)
         ③ 갈등 포인트와 상대방의 진짜 마음 (반복되는 오해)
         ④ 향후 10년 관계 타이밍 (가까워지는 시기와 조심할 시기)
         ⑤ 관계를 지키는 실전 행동 5가지 (말, 돈, 일정, 감정, 거리감)
         ⑥ 이 관계에서 피해야 할 선택 (방치하면 틀어지는 패턴)
         ⑦ 인스타 스토리 요약 (SNS 공유용 초핵심 요약)
      4. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 7번 등장해야 함)**
         - 소제목(##) 후킹 최적화: 단순히 '갈등 포인트'가 아니라, "비가 내릴 때, 우리가 우산을 나누는 법 ☔️" 처럼 유저의 호기심을 자극하고 공감할 수 있는 대화형 문장으로 작성해라.

      [🔥 4번 섹션: 향후 10년 관계 타이밍 작성 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 🕰️ 향후 10년 관계 타이밍" 으로 작성해.
      - 반드시 아래 4개 블록 라벨을 글자 그대로 포함해라.
        1) **가까워지는 구간 2개**
        2) **멀어지기 쉬운 구간 2개**
        3) **관계를 결정해야 하는 포인트 3개**
        4) **그 시기에 하면 좋은 행동**
      - 각 구간은 나이대 또는 연도 범위를 함께 써라.
      - 모든 구간을 좋게 쓰지 말고, 주의 구간도 반드시 2개를 골라라.

      [🔥 인스타 스토리 요약 (7번 섹션) 작성 특별 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 📸 인스타 스토리 요약" 으로 작성해.
      - 후킹 제목: 두 사람의 관계를 다정하고 직관적인 '한 문장 비유'로 표현해. (예: "두 분은 조용하던 숲에 불어오는 따뜻한 봄바람 같아요.")
      - 핵심 특징 3가지: 전체 분석에서 가장 듣기 좋은 궁합 특징 3가지만 글머리 기호(💡, ✅ 등)를 사용해 초단문으로 요약해.
      - 바이럴 포인트: "우리 관계, 가까워지는 때와 조심할 때가 보인다 💖"처럼 좋고 나쁨이 함께 보이는 문구 한 줄을 반드시 마지막에 포함해.

      [필수 지시사항 - AI 글쓰기 절대 규칙 (가독성 최우선, 스낵 컬처 스타일)]
      1. AI가 줄글(수필) 형태로 길게 쓰는 것을 엄격히 금지한다. 대신 짧은 문장 여러 개로 깊이를 만들어라.
      2. 1문장 = 1줄: 절대 한 문단에 문장을 2개 이상 이어 쓰지 마라. 한 문장이 끝나면 무조건 줄바꿈(\\n\\n)을 해라.
      3. 초단문 사용: 접속사(그리고, 그래서, 하지만)를 남발하지 말고, 문장을 최대한 짧고 명쾌하게 끊어 쳐라. 단, 내용은 얕게 줄이지 마라.
      4. 여백 극대화: 유저가 스크롤을 내리며 휙휙 읽을 수 있도록 여백을 과하다 싶을 정도로 많이 줘라.
      5. 핵심 요약 리스트(Bullet points) 강제: 섹션마다 줄글만 쓰지 말고, 두 사람의 특징이나 조언을 글머리 기호(💡, ✅, 📌 등)를 사용해 4~6줄로 명확하게 요약해 주는 구간을 반드시 넣어라.
      6. 따뜻한 에세이 톤: 감성적인 웹소설이나 에세이를 읽는 듯한 아주 다정하고 부드러운 경어체("~해요", "~요")를 사용해라.
      7. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.

      [예시 포맷 - 이 구조를 반드시 따를 것]
      ## 🌸 두 사람의 시너지 (우리가 함께할 때 생기는 마법)
      ${user1.name}님과 ${user2.name}님이 만나면 조용하던 숲에 따뜻한 봄바람이 불어오는 것 같아요.

      서로가 가진 부족한 점을 너무나도 자연스럽게 채워줍니다.

      **💡 우리가 함께할 때 좋은 점 3가지**
      ✅ **안정감:** 서로의 존재만으로도 큰 위로가 돼요.
      ✅ **대화의 티키타카:** 끊임없이 즐거운 대화가 이어집니다.
      ✅ **목표 달성:** 함께하면 어떤 어려운 일도 쉽게 해낼 수 있어요.

      두 분의 인연은 시간이 지날수록 더욱 단단해질 거예요.
      \\n\\n
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
