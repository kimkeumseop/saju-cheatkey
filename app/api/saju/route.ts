import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { Solar } from 'lunar-javascript';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

const ELEMENT_NATURE: Record<string, string> = {
  '木': '새싹처럼 커지는 성장의 기운',
  '火': '불빛처럼 주목받는 확장의 기운',
  '土': '땅처럼 쌓고 지키는 안정의 기운',
  '金': '보석처럼 결실을 거두는 정리의 기운',
  '水': '물길처럼 흐름을 읽는 지혜의 기운',
};

function getElement(char: string) {
  if ('甲乙寅卯'.includes(char)) return '木';
  if ('丙丁巳午'.includes(char)) return '火';
  if ('戊己辰戌丑未'.includes(char)) return '土';
  if ('庚辛申酉'.includes(char)) return '金';
  if ('壬癸亥子'.includes(char)) return '水';
  return '土';
}

function formatGanZhiContext(gz: string) {
  const [gan, zhi] = gz.split('');
  const ganElement = getElement(gan);
  const zhiElement = getElement(zhi);
  return `${HANJA_TO_KO[gan] || gan}${HANJA_TO_KO[zhi] || zhi}: ${ELEMENT_NATURE[ganElement]} + ${ELEMENT_NATURE[zhiElement]}`;
}

function getKoreanDateParts() {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const yearFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  });

  return {
    todayText: formatter.format(new Date()),
    currentYear: Number(yearFormatter.format(new Date())),
  };
}

function buildYearlyFlowText(currentYear: number) {
  return Array.from({ length: 3 }, (_, index) => currentYear + index)
    .map((year) => {
      const yearGz = Solar.fromYmd(year, 6, 15).getLunar().getYearInGanZhiExact();
      return `${year}년(${formatGanZhiContext(yearGz)})`;
    })
    .join(' / ');
}

function buildMonthlyFlowText(currentYear: number) {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1;
    const monthGz = Solar.fromYmd(currentYear, month, 15).getLunar().getMonthInGanZhiExact();
    return `${month}월(${formatGanZhiContext(monthGz)})`;
  }).join(' / ');
}

function buildDaYunText(daYun: any[]) {
  if (!Array.isArray(daYun) || daYun.length === 0) return '대운 정보 없음';
  return daYun
    .map((dy) => `${dy.age}세~: ${dy.ganKo}${dy.zhiKo}(${ELEMENT_NATURE[dy.ganElement]} + ${ELEMENT_NATURE[dy.zhiElement]})`)
    .join(' / ');
}

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Saju] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text) throw new Error('AI 응답이 비어있습니다.');
      return text;
    } catch (error: any) {
      console.error(`[Gemini/Saju] Error (Attempt ${i + 1}):`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillarsText = sajuData.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const elementDist = `목:${sajuData.elementsCount['목']}, 화:${sajuData.elementsCount['화']}, 토:${sajuData.elementsCount['토']}, 금:${sajuData.elementsCount['금']}, 수:${sajuData.elementsCount['수']}`;
    const { todayText, currentYear } = getKoreanDateParts();
    const yearlyFlowText = buildYearlyFlowText(currentYear);
    const monthlyFlowText = buildMonthlyFlowText(currentYear);
    const daYunText = buildDaYunText(sajuData.daYun);

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

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
      너는 사주를 아주 쉽게 풀어서 설명해주는 다정하고 스마트한 '인생 가이드'야.
      MZ 세대가 읽었을 때 막힘없이 술술 읽히면서도, 내용이 깊고 풍성해서 감동을 줄 수 있는 '사주 치트키 리포트'를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 명리학 용어 노출 절대 금지: '비견', '식상', '편관', '갑자', '무오', '기사' 같은 60갑자나 한자(漢字) 등 어려운 전문 용어는 유저 화면에 단 한 글자도 노출하지 마라.
      2. 대운/세운 설명 방식: "무오 대운에 진입해서"라고 하지 말고, 그 글자의 오행 색상과 자연물로 번역해줘. 
      3. 오직 일상적인 언어와 감성적인 비유(물상론)로만 유저의 운명을 설명해. '햇살, 큰 산, 잔잔한 호수, 겨울의 나무' 같은 다정하고 시각적인 자연물 비유를 적극 활용해라.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 분석 기준일: ${todayText}
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}
      - 10년 주기 흐름: ${daYunText}
      - ${currentYear}년 월별 흐름 참고값: ${monthlyFlowText}
      - 향후 3년 흐름 참고값: ${yearlyFlowText}

      [🔥 반복 방지 및 개인화 규칙 - 절대 준수]
      1. 다른 사용자에게도 그대로 붙여 넣을 수 있는 뻔한 문장을 금지한다.
      2. 각 섹션마다 반드시 위 유저 정보 중 최소 2개(오행 분포, 일간, 10년 주기 흐름, 월별 흐름, 향후 3년 흐름)를 근거로 삼아 유저별로 다른 판단을 내려라.
      3. 같은 표현을 반복하지 마라. 특히 "빛나요", "같아요", "흐름", "기회"를 과하게 반복하지 말고 섹션마다 다른 어휘를 써라.
      4. 돈, 대박, 주의 시점은 단정적 예언처럼 말하지 말고 "기회가 커지는 구간", "지출이 새기 쉬운 구간", "준비하면 터질 수 있는 구간"처럼 현실적 행동과 함께 말해라.
      5. 근거는 화면에 전문 용어로 노출하지 말고, 자연물과 생활 언어로 번역해서 설명해라.

      [💎 유료 리포트 깊이 규칙 - 돈 주고 보는 느낌]
      1. 각 섹션은 얕은 칭찬으로 끝내지 말고 반드시 아래 4단계를 포함해라.
         - **왜 이렇게 보는지:** 유저 정보에서 나온 근거를 쉬운 말로 설명
         - **현실에서 어떻게 나타나는지:** 일, 돈, 관계, 감정, 선택 습관 중 실제 장면으로 번역
         - **좋게 쓰는 법:** 강점이 돈/성과/관계로 바뀌는 행동 지침
         - **조심할 함정:** 과해질 때 손해 보는 패턴과 피하는 방법
      2. 섹션마다 최소 7문장 이상 작성해라. 단, 한 문장은 짧게 유지하고 문장마다 줄바꿈해라.
      3. 뭉뚱그린 조언을 금지한다. "열심히 하세요", "긍정적으로 생각하세요", "기회를 잡으세요"처럼 누구에게나 맞는 말은 쓰지 마라.
      4. 사용자가 "나를 실제로 보고 쓴 것 같다"고 느끼도록 관찰 문장을 넣어라. 예: "돈을 벌 때보다 돈이 새는 이유를 뒤늦게 발견하는 패턴이 있어요."
      5. 재물/직업/올해운 섹션은 반드시 **좋은 시기**, **주의 시기**, **추천 행동**, **피해야 할 행동**을 모두 담아라.
      6. 연애/관계 섹션은 반드시 **끌리는 사람**, **반복 갈등**, **좋은 궁합의 태도**, **관계에서 돈/일과 충돌하는 지점**을 담아라.
      7. 위로 섹션은 감성만 쓰지 말고, 유저가 지치는 이유와 회복 루틴을 3가지로 제시해라.
      8. 전체 톤은 고급 상담 리포트처럼 확신 있게 말하되, 미래를 100% 단정하지 말고 선택 가능성을 열어둬라.

      [필수 지시사항 - 구조와 형식]
      1. 반드시 아래 8개의 주제를 모두 포함하여 8개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 타고난 기질과 본성 (나도 몰랐던 나의 진짜 모습)
         ② 재물운 (나에게 맞는 돈의 그릇과 수입 방식)
         ③ 돈 들어오는 시기 & 조심할 시기 (월/분기/나이대 기반 타이밍)
         ④ 직업운 (내가 가장 빛날 수 있는 커리어 무대와 성공 전략)
         ⑤ 연애운 & 인간관계 (나의 인연이 머무는 곳과 관계의 비결)
         ⑥ 숨겨진 아픔과 다정한 위로 (지친 영혼을 위한 따뜻한 응원)
         ⑦ ${currentYear}년 운세 흐름 & 럭키 포인트 (올해 꼭 잡아야 할 기회)
         ⑧ 인스타 스토리 요약 (SNS 공유용 초핵심 요약)
      2. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 8번 등장해야 함)**
         - 소제목(##) 후킹 최적화: 단순히 '재물운'이 아니라, "내 지갑은 언제쯤 두둑해질까? 💰" 처럼 유저의 호기심을 자극하고 공감할 수 있는 대화형 문장으로 작성해라.

      [🔥 3번 섹션: 돈 들어오는 시기 & 조심할 시기 작성 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 💸 돈이 움직이는 시기표" 로 작성해.
      - 반드시 아래 4개 블록 라벨을 글자 그대로 포함해라. 이 라벨은 프론트엔드 요약 카드의 추출 기준이므로 바꾸지 마라.
        1) **돈이 들어오기 쉬운 구간 3개**
        2) **대박을 노려볼 만한 방식 2개**
        3) **지출과 손실을 조심할 구간 3개**
        4) **바로 할 일 3개**
      - "돈이 들어오기 쉬운 구간 3개"에는 ${currentYear}년 월/분기 또는 나이대 기준으로 3개를 골라라.
      - 각 구간은 "왜 그 시기가 좋은지/위험한지", "무엇을 하면 돈으로 연결되는지", "무엇을 피해야 하는지"를 한 줄씩 붙여라.
      - "대박을 노려볼 만한 방식 2개"에는 투자 종목을 찍지 말고, 부업/협상/성과급/콘텐츠/영업/이직/계약 같은 행동 방식으로 말해라.
      - "지출과 손실을 조심할 구간 3개"에는 충동구매, 계약, 인간관계 돈거래, 과로, 세금/정산처럼 현실적인 위험으로 말해라.
      - "바로 할 일 3개"에는 캘린더에 적을 수 있을 만큼 구체적인 행동으로 말해라.
      - "무조건 돈이 들어온다", "반드시 대박난다", "로또", "주식 종목", "코인 종목"처럼 확정적이거나 고위험 투자를 부추기는 표현은 금지한다.
      - 그래도 사용자가 설레야 하므로, 가장 좋은 구간 하나는 "승부 구간"으로 짚어줘라.

      [🔥 인스타 스토리 요약 (8번 섹션) 작성 특별 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 📸 인스타 스토리 요약" 으로 작성해.
      - 후킹 제목: 유저의 타고난 기질을 다정하고 직관적인 '한 문장 비유'로 표현해. (예: "${name}님은 웅장한 산봉우리 같은 든든한 존재예요.")
      - 핵심 특징 3가지: 전체 분석에서 가장 듣기 좋은 특징 3가지만 글머리 기호(💡, ✅ 등)를 사용해 초단문으로 요약해.
      - 바이럴 포인트: "${currentYear}년 재물운 대폭발 💸"처럼 유저가 자랑하고 싶은 '특별한 혜택' 문구 한 줄을 반드시 마지막에 포함해.

      [필수 지시사항 - AI 글쓰기 절대 규칙 (가독성 최우선, 스낵 컬처 스타일)]
      1. AI가 줄글(수필) 형태로 길게 쓰는 것을 엄격히 금지한다. 대신 짧은 문장 여러 개로 깊이를 만들어라.
      2. 1문장 = 1줄: 절대 한 문단에 문장을 2개 이상 이어 쓰지 마라. 한 문장이 끝나면 무조건 줄바꿈(\\n\\n)을 해라.
      3. 초단문 사용: 접속사(그리고, 그래서, 하지만)를 남발하지 말고, 문장을 최대한 짧고 명쾌하게 끊어 쳐라. 단, 내용은 얕게 줄이지 마라.
      4. 여백 극대화: 유저가 스크롤을 내리며 휙휙 읽을 수 있도록 여백을 과하다 싶을 정도로 많이 줘라.
      5. 핵심 요약 리스트(Bullet points) 강제: 섹션마다 줄글만 쓰지 말고, 유저의 특징이나 조언을 글머리 기호(💡, ✅, 📌 등)를 사용해 4~6줄로 명확하게 요약해 주는 구간을 반드시 넣어라.
      6. 따뜻한 에세이 톤: 감성적인 웹소설이나 에세이를 읽는 듯한 아주 다정하고 부드러운 경어체("~해요", "~요")를 사용해라.
      7. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.

      [예시 포맷 - 이 구조를 반드시 따를 것]
      ## 💰 재물운 (내 지갑은 언제쯤 두둑해질까?)
      ${name}님의 재물운은 오랜 시간 다져진 견고한 땅과 같아요.

      일확천금보다는 꾸준함으로 승부할 때 가장 빛이 납니다.

      **💡 ${name}님의 재물 포인트 3가지**
      ✅ **타고난 뚝심:** 한 번 목표한 바는 반드시 이뤄내요.
      ✅ **안정적인 자산:** 주식보다는 부동산, 저축이 훨씬 유리해요.
      ✅ **유연한 사고방식:** 때로는 물 흐르듯 유연한 대처가 필요해요.

      조금만 더 마음의 여유를 가지면, 큰 부가 따라올 거예요.
      \\n\\n
    `;

    responseText = await generateWithRetry(model, prompt);
    return NextResponse.json({ success: true, saju: sajuData, analysis: responseText.trim() });

  } catch (error: any) {
    console.error('Saju API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
