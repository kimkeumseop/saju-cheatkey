import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { Solar } from 'lunar-javascript';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { generateText } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

const ELEMENT_NATURE: Record<string, string> = {
  '木': '성장',
  '火': '확장',
  '土': '안정',
  '金': '결실',
  '水': '지혜',
};

function describeElementPair(primaryElement: string, secondaryElement: string) {
  const primary = ELEMENT_NATURE[primaryElement] || '정리';
  const secondary = ELEMENT_NATURE[secondaryElement] || '균형';

  if (primaryElement === secondaryElement) {
    const sameElementGuide: Record<string, string> = {
      '木': '새로운 시작과 성장 욕구가 강해지는 시기',
      '火': '드러내고 확장하려는 힘이 커지는 시기',
      '土': '기반을 다지고 안정감을 회복하는 시기',
      '金': '성과를 정리하고 결과를 손에 쥐기 좋은 시기',
      '水': '생각을 정리하고 다음 방향을 고르기 좋은 시기',
    };
    return sameElementGuide[primaryElement] || `${primary}의 힘이 강해지는 시기`;
  }

  const pairKey = `${primaryElement}${secondaryElement}`;
  const pairGuide: Record<string, string> = {
    '木火': '새로 시작한 일을 밖으로 알리기 좋은 시기',
    '火木': '아이디어를 빠르게 실행으로 옮기기 좋은 시기',
    '木土': '성장하고 싶은 일을 현실 기반 위에 올리는 시기',
    '土木': '흔들린 루틴을 다시 세우고 새 계획을 붙이는 시기',
    '木金': '키운 일을 성과로 정리해야 하는 시기',
    '金木': '완성된 결과를 바탕으로 다음 성장을 여는 시기',
    '木水': '배우고 준비한 것을 천천히 키우는 시기',
    '水木': '생각한 방향을 실제 행동으로 옮기는 시기',
    '火土': '확장한 일을 안정적인 구조로 묶어야 하는 시기',
    '土火': '준비한 기반을 밖으로 보여주기 좋은 시기',
    '火金': '눈에 띄는 성과와 평가가 함께 들어오는 시기',
    '金火': '성과를 더 넓게 알리되 과열을 조심할 시기',
    '火水': '속도와 판단이 부딪혀 결정 피로가 생기기 쉬운 시기',
    '水火': '조용히 준비한 것을 드러내야 하는 시기',
    '土金': '쌓아둔 기반이 성과와 돈으로 바뀌기 쉬운 시기',
    '金土': '성과를 안정적으로 지키고 관리해야 하는 시기',
    '土水': '생활 기반과 마음의 속도를 함께 정리할 시기',
    '水土': '생각이 많아질수록 루틴과 기준이 필요한 시기',
    '金水': '결과를 정리하고 다음 선택을 계산하기 좋은 시기',
    '水金': '판단력을 바탕으로 성과를 선별해야 하는 시기',
  };

  return pairGuide[pairKey] || `${primary}을 중심으로 ${secondary}을 보태는 시기`;
}

const REQUIRED_REPORT_LABELS = [
  '확장 구간 2개',
  '정비 구간 2개',
  '주의 구간 2개',
  '중요 결정 포인트 3개',
  '연도별 체크포인트',
  '재물운 좋은 해 3개',
  '수입 확장에 좋은 해 2개',
  '지출 주의 해 3개',
  '돈을 쌓는 방법 3개',
  '일과 성장에 좋은 구간 3개',
  '돈 관리에 유리한 구간 2개',
  '컨디션과 감정 관리가 필요한 구간 3개',
  '바로 할 일 3개',
];

const REQUIRED_REPORT_SECTIONS = [
  '핵심 운세',
  '기질',
  '대운 10년',
  '직업운',
  '재물운',
  '월별 운세',
  '컨디션',
  '인스타 스토리',
];

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
  return describeElementPair(ganElement, zhiElement);
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

function buildYearlyFlowText(currentYear: number, _currentAge: number) {
  return Array.from({ length: 10 }, (_, index) => currentYear + index)
    .map((year) => {
      const yearGz = Solar.fromYmd(year, 6, 15).getLunar().getYearInGanZhiExact();
      return `${year}년: ${formatGanZhiContext(yearGz)}`;
    })
    .join(' / ');
}

function buildMonthlyFlowText(currentYear: number) {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1;
    const monthGz = Solar.fromYmd(currentYear, month, 15).getLunar().getMonthInGanZhiExact();
    return `${month}월: ${formatGanZhiContext(monthGz)}`;
  }).join(' / ');
}

function buildDaYunText(daYun: any[]) {
  if (!Array.isArray(daYun) || daYun.length === 0) return '대운 정보 없음';
  return daYun
    .map((dy, index) => `${index + 1}번째 10년 구간: ${describeElementPair(dy.ganElement, dy.zhiElement)}`)
    .join(' / ');
}

function calcAge(birthDate: string, currentYear: number) {
  const birthYear = Number(birthDate?.split('-')?.[0]);
  if (!birthYear || Number.isNaN(birthYear)) return 25;
  return Math.max(0, currentYear - birthYear);
}

function buildDaYunRangeText(daYun: any[], currentYear: number, currentAge: number) {
  if (!Array.isArray(daYun) || daYun.length === 0) return '대운 구간 정보 없음';
  return daYun
    .map((dy, index) => {
      const nextAge = daYun[index + 1]?.age ?? dy.age + 10;
      const startYear = currentYear + (dy.age - currentAge);
      const endYear = startYear + Math.max(1, nextAge - dy.age) - 1;
      const sampleYears = Array.from({ length: Math.min(3, Math.max(1, endYear - startYear + 1)) }, (_, offset) => `${startYear + offset}년`).join(', ');
      return `${index + 1}번째 10년 구간: ${describeElementPair(dy.ganElement, dy.zhiElement)} / 대표 연도: ${sampleYears}`;
    })
    .join(' / ');
}

function normalizeReportText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .trim();
}

function expandYearRange(startYearText: string, endYearText: string) {
  const startYear = Number(startYearText);
  const endYear = Number(endYearText);
  if (!startYear || !endYear || endYear < startYear || endYear - startYear > 10) {
    return `${startYearText}년, ${endYearText}년`;
  }

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => `${startYear + index}년`).join(', ');
}

function sanitizeYearRangeText(text: string) {
  return normalizeReportText(text)
    .replace(/(\d{4})년\s*[~\-–—]\s*(\d{4})년/g, (_match, startYear, endYear) => expandYearRange(startYear, endYear))
    .replace(/(^|\n)(\s*(?:[-*•]|\d+[.)])?\s*)년\s*[~\-–—]\s*(\d{4})년\s*(?:\([^)\n]*\))?/g, (_match, lineStart, prefix, endYear) => `${lineStart}${prefix}${endYear}년`)
    .replace(/\s*\(\s*\d{1,3}\s*세\s*[~\-–—]\s*\d{1,3}\s*세\s*\)/g, '')
    .replace(/년\s*[~\-–—]\s*(\d{4})년/g, '$1년');
}

function getSajuReportIssues(text: string, finishReason?: string) {
  const normalized = normalizeReportText(text);
  const sectionTitles = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^##\s+/.test(line));
  const compactText = normalized.replace(/\s/g, '');
  const issues: string[] = [];

  if (finishReason && !['STOP', 'FINISH_REASON_UNSPECIFIED'].includes(finishReason)) {
    issues.push(`Gemini finishReason=${finishReason}`);
  }

  if (sectionTitles.length < 8) {
    issues.push(`8개 섹션 중 ${sectionTitles.length}개만 생성됨`);
  }

  REQUIRED_REPORT_SECTIONS.forEach((keyword) => {
    if (!sectionTitles.some((title) => title.replace(/\s/g, '').includes(keyword.replace(/\s/g, '')))) {
      issues.push(`섹션 누락: ${keyword}`);
    }
  });

  REQUIRED_REPORT_LABELS.forEach((label) => {
    if (!compactText.includes(label.replace(/\s/g, ''))) {
      issues.push(`필수 라벨 누락: ${label}`);
    }
  });

  return issues;
}

function buildRepairPrompt(basePrompt: string, issues: string[]) {
  return `${basePrompt}

      [🚨 재작성 요청 - 이전 응답이 미완성으로 판정됨]
      이전 응답 문제: ${issues.slice(0, 8).join(' / ')}
      지금 답변은 전체 리포트를 처음부터 다시 작성해라.
      절대 이어 쓰지 말고, 반드시 8개 섹션을 모두 완성해라.
      각 섹션 제목은 반드시 ## 로 시작해야 하며 총 8개여야 한다.
      대운/재물운/월별운세의 필수 라벨은 한 글자도 바꾸지 말고 포함해라.
      길이가 부족하면 문장을 줄여라. 섹션을 생략하는 것은 실패다.

      [🚨 연도별 근거 형식 - 절대 준수]
      좋은 해와 주의 해는 반드시 아래 형식으로 써라.
      - 2028년: 수입을 넓히기 좋은 해 | 근거: 쌓아둔 기반이 성과와 돈으로 바뀌기 쉬운 해 | 행동: 계약, 성과급, 부업 정산을 확인한다.
      - 2029년: 지출을 조심해야 하는 해 | 근거: 돈이 새는 곳을 정리해야 하는 해 | 행동: 큰 결제와 장기 약정은 조건을 다시 본다.

      [최종 출력]
      표지 제목, 인사말, 구분선 없이 8개 섹션 본문만 출력해라.
      첫 줄은 반드시 "## 🧭 핵심 운세 브리핑"으로 시작해라.
      설명이나 사과 없이 리포트 본문만 출력해라.
    `;
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
    const currentAge = calcAge(birthDate, currentYear);
    const yearlyFlowText = buildYearlyFlowText(currentYear, currentAge);
    const monthlyFlowText = buildMonthlyFlowText(currentYear);
    const daYunText = buildDaYunText(sajuData.daYun);
    const daYunRangeText = buildDaYunRangeText(sajuData.daYun, currentYear, currentAge);

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

    const generationConfig = {
      temperature: 0.68,
      maxOutputTokens: 8500,
      topP: 0.95,
    };
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig,
      safetySettings,
    });
    // lite 모델이 과부하(503)일 때를 대비한 폴백 모델
    const fallbackModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig,
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
      - 현재 나이 참고값: 약 ${currentAge}세
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}
      - 10년 주기 흐름: ${daYunText}
      - 10년 주기 상세 구간: ${daYunRangeText}
      - ${currentYear}년 월별 흐름 참고값: ${monthlyFlowText}
      - 향후 10년 연도별 흐름 참고값: ${yearlyFlowText}

      [🔥 반복 방지 및 개인화 규칙 - 절대 준수]
      1. 다른 사용자에게도 그대로 붙여 넣을 수 있는 뻔한 문장을 금지한다.
      2. 각 섹션마다 반드시 위 유저 정보 중 최소 2개(오행 분포, 일간, 10년 주기 흐름, 월별 흐름, 향후 10년 연도별 흐름)를 근거로 삼아 유저별로 다른 판단을 내려라.
      3. 같은 표현을 반복하지 마라. 특히 "빛나요", "같아요", "흐름", "기회"를 과하게 반복하지 말고 섹션마다 다른 어휘를 써라.
      4. 돈, 대박, 주의 시점은 전체 운세의 일부로만 다뤄라. 사주 운세 전체가 돈 이야기처럼 보이면 실패다.
      5. 근거는 화면에 전문 용어로 노출하지 말고, 자연물과 생활 언어로 번역해서 설명해라.
      6. 모든 시기를 좋게 쓰지 마라. 좋은 시기, 보통의 준비 시기, 조심할 시기를 반드시 나누어라.
      7. 올해 운세만 과하게 강조하지 마라. 올해는 월별 실전 계획으로만 다루고, 큰 흐름은 10년 주기 대운에서 판단해라.
      8. 오행 조합, 한자, 전문용어, 플러스 기호로 묶은 조합 표기를 화면에 쓰지 마라.
      9. 시기 근거가 필요하면 "성과가 돈으로 연결되기 쉬운 해", "루틴을 다시 세워야 하는 해"처럼 생활 언어로 번역해라.
      10. 재물운과 대운 시기는 범위로 쓰지 마라. 반드시 "2028년", "2029년"처럼 개별 연도로 찍어라.
      11. 최종 결과에는 나이를 괄호로 길게 붙이지 마라. 나이는 필요할 때 한 번만 짧게 쓰고, 핵심 표기는 연도로 한다.
      12. 물결표, 하이픈, 시작-끝 구조로 시기를 묶는 범위 표기는 절대 금지다. 여러 해를 말할 때는 "2028년, 2029년, 2030년"처럼 쉼표로 나열해라.

      [💎 유료 리포트 깊이 규칙 - 돈 주고 보는 느낌]
      1. 각 섹션은 얕은 칭찬으로 끝내지 말고 반드시 아래 4단계를 포함해라.
         - **왜 이렇게 보는지:** 유저 정보에서 나온 근거를 쉬운 말로 설명
         - **현실에서 어떻게 나타나는지:** 일, 돈, 건강/컨디션, 감정, 선택 습관 중 실제 장면으로 번역
         - **좋게 쓰는 법:** 강점이 성과, 돈, 안정감, 회복력으로 바뀌는 행동 지침
         - **조심할 함정:** 과해질 때 손해 보는 패턴과 피하는 방법
      2. 섹션마다 6~9줄로 작성해라. 길게 늘어놓기보다 핵심이 보이게 완결성 있게 써라.
      3. 뭉뚱그린 조언을 금지한다. "열심히 하세요", "긍정적으로 생각하세요", "기회를 잡으세요"처럼 누구에게나 맞는 말은 쓰지 마라.
      4. 사용자가 "나를 실제로 보고 쓴 것 같다"고 느끼도록 관찰 문장을 넣어라. 예: "시작은 빠른데 마무리 전에 마음이 먼저 지치는 패턴이 보여요."
      5. 직업/재물/올해운 섹션은 반드시 **좋은 해**, **주의 해**, **추천 행동**, **피해야 할 행동**을 모두 담아라.
      6. 대운 섹션은 반드시 **확장 구간 2개**, **정비 구간 2개**, **주의 구간 2개**, **중요 결정 포인트 3개**를 담아라.
      7. 대운 섹션에서는 모든 10년 구간을 좋다고 하지 말고, 구간마다 등급을 나누어라. 등급은 "확장", "축적", "정비", "주의" 중 하나만 사용해라.
      8. 건강/컨디션 섹션은 질병을 단정하지 말고, 에너지 소모 패턴, 수면/루틴/과로 주의, 회복 루틴을 현실적으로 제시해라.
      9. 전체 톤은 고급 상담 리포트처럼 확신 있게 말하되, 미래를 100% 단정하지 말고 선택 가능성을 열어둬라.
      10. 답변이 길어져서 중간에 끊기는 것은 최악이다. 길이를 줄이더라도 8개 섹션을 모두 끝까지 완성해라.
      11. 좋은 해/좋은 달/확장 구간에는 반드시 "왜 좋은지"를 붙여라. 근거는 오행 키워드, 현재 10년 주기, 월별/연도별 참고값 중 최소 1개에서 가져와라.
      12. 주의 해/주의 달에도 반드시 "왜 조심해야 하는지"를 붙여라. 막연한 불안 조장이 아니라 지출, 과로, 계약, 결정 피로 같은 현실 이유로 설명해라.

      [🧭 글맛과 가독성 규칙 - 화면에서 잘 들어오게 쓰기]
      1. "시처럼 예쁜 문장"보다 "상담사가 짚어주는 정확한 문장"을 우선해라.
      2. 각 섹션 첫 3줄은 반드시 결론부터 말해라. 배경 설명으로 시작하지 마라.
      3. 추상적인 비유만 길게 쓰지 마라. 비유 1줄 뒤에는 반드시 현실 행동 1줄을 붙여라.
      4. 같은 문장 구조를 반복하지 마라. "~같아요"로 끝나는 문장이 연속 2번 나오면 실패다.
      5. 섹션마다 **한 줄 결론**, **핵심 포인트**, **실전 조언**이라는 소제목을 자연스럽게 넣어라.
      6. 사용자가 훑어봐도 핵심이 보이도록 굵은 글씨 키워드를 많이 쓰되, 과한 장식 문장은 줄여라.
      7. 연도 표기는 한눈에 보이게 써라. 예: "2028년: 수입을 넓히기 좋은 해", "2029년: 계약을 조심해야 하는 해".
      8. **한 줄 결론**과 **왜 이렇게 보나요?**를 절대 같은 줄에 붙이지 마라. 각각 독립된 줄과 문단으로 써라.
      9. 연도 뒤에 판단 단어만 쓰고 끝내지 마라. 반드시 "2028년: 확장하기 좋은 해 | 근거: ... | 행동: ..."처럼 의미가 보이게 써라.

      [필수 지시사항 - 구조와 형식]
      1. 표지 제목, 인사말, "안녕하세요", "리포트를 준비했어요", "---" 같은 구분선은 절대 쓰지 마라. 첫 출력은 반드시 1번 섹션 제목인 "## 🧭 핵심 운세 브리핑"으로 시작해야 한다.
      2. 반드시 아래 8개의 주제를 모두 포함하여 8개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 핵심 운세 브리핑 (지금 가장 먼저 알아야 할 결론)
         ② 타고난 기질과 생활 패턴 (나도 몰랐던 나의 진짜 모습)
         ③ 향후 대운 10년 인생 타이밍 (확장, 정비, 주의, 결정의 시기)
         ④ 직업운과 성장운 (내가 빛나는 일의 방식과 커리어 전략)
         ⑤ 재물운과 현실적인 돈 관리 (수입 방식, 지출 패턴, 쌓는 법)
         ⑥ ${currentYear}년 월별 운세 캘린더 (일, 돈, 컨디션, 주의 포인트)
         ⑦ 컨디션과 회복 루틴 (지치지 않고 오래 가는 법)
         ⑧ 인스타 스토리 요약 (SNS 공유용 초핵심 요약)
      3. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 8번 등장해야 함)**
         - 소제목(##) 후킹 최적화: 단순히 '재물운'이 아니라, "내 지갑은 언제쯤 두둑해질까? 💰" 처럼 유저의 호기심을 자극하고 공감할 수 있는 대화형 문장으로 작성해라.

      [🔥 3번 섹션: 향후 대운 10년 인생 타이밍 작성 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 🚀 향후 대운 10년 인생 타이밍" 으로 작성해.
      - ${daYunRangeText}를 기준으로 미래 10년 주기들을 비교해라.
      - 반드시 아래 4개 블록 라벨을 글자 그대로 포함해라.
        1) **확장 구간 2개**
        2) **정비 구간 2개**
        3) **주의 구간 2개**
        4) **중요 결정 포인트 3개**
      - 각 구간에는 나이대보다 연도를 우선해서 써라. 단, 범위 표기는 금지하고 "2028년, 2029년, 2030년"처럼 개별 연도로 나열해라.
      - 구간 설명 뒤에는 반드시 **연도별 체크포인트**를 넣어라.
      - **연도별 체크포인트**에는 향후 10년 중 최소 6개 연도를 골라 "2028년: 확장하기 좋은 해", "2029년: 정리하고 다듬는 해"처럼 개별 연도로 써라.
      - **연도별 체크포인트**는 반드시 "2028년: 확장하기 좋은 해 | 근거: ... | 행동: ..." 형식으로 써라.
      - 시작 연도가 비어 보이는 범위 표기는 실패다. 이런 표기 대신 "2029년: 정리하고 다듬는 해 | 근거: ... | 행동: ..."처럼 한 해씩 써라.
      - 플러스 기호로 묶은 조합표는 절대 쓰지 말고 "성과가 밖으로 커지는 시기"처럼 해석 문장으로 바꿔라.
      - 각 구간은 "왜 그 구간인지", "일/돈/건강 중 무엇이 커지는지", "무엇을 조심해야 하는지"를 포함해라.
      - 확장 구간은 2개를 넘기지 마라.
      - 주의 구간도 반드시 2개를 골라라.
      - 투자 종목, 로또, 코인 대박처럼 위험한 확정 표현은 금지한다.

      [🔥 5번 섹션: 재물운과 현실적인 돈 관리 작성 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 💰 재물운과 현실적인 돈 관리" 로 작성해.
      - 반드시 아래 4개 블록 라벨을 글자 그대로 포함해라.
        1) **재물운 좋은 해 3개**
        2) **수입 확장에 좋은 해 2개**
        3) **지출 주의 해 3개**
        4) **돈을 쌓는 방법 3개**
      - 각 해는 반드시 "2028년", "2029년"처럼 개별 연도로 써라.
      - 여러 해를 한 덩어리로 묶어 좋다고 쓰는 방식은 금지한다.
      - 각 해는 반드시 "2028년: 수입을 넓히기 좋은 해 | 근거: ... | 행동: ..." 형식으로 써라.
      - 각 해마다 왜 좋은지/주의인지, 어떤 행동이 돈으로 연결되는지 한 줄로 붙여라.
      - 돈 이야기는 현실적으로 써라. 계약, 이직, 성과급, 부업, 지출 정리, 세금/정산, 건강으로 인한 지출 같은 생활 단어를 써라.

      [🔥 6번 섹션: ${currentYear}년 월별 운세 캘린더 작성 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 📅 ${currentYear}년 월별 운세 캘린더" 로 작성해.
      - 반드시 아래 4개 블록 라벨을 글자 그대로 포함해라. 이 라벨은 프론트엔드 요약 카드의 추출 기준이므로 바꾸지 마라.
        1) **일과 성장에 좋은 구간 3개**
        2) **돈 관리에 유리한 구간 2개**
        3) **컨디션과 감정 관리가 필요한 구간 3개**
        4) **바로 할 일 3개**
      - 올해 운세도 돈만 말하지 말고 일, 돈, 몸 컨디션, 결정, 휴식을 함께 섞어라.
      - 각 구간은 "왜 그 시기인지", "무엇을 하면 좋아지는지", "무엇을 피해야 하는지"를 한 줄씩 붙여라.
      - 각 월/구간은 반드시 "3월: 새 일을 키우기 좋은 달 | 근거: ... | 행동: ..." 형식으로 써라.
      - 모든 달을 좋게 쓰지 마라. 좋음/보통/주의가 섞여야 한다.

      [🔥 인스타 스토리 요약 (8번 섹션) 작성 특별 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 📸 인스타 스토리 요약" 으로 작성해.
      - 후킹 제목: 유저의 타고난 기질을 다정하고 직관적인 '한 문장 비유'로 표현해. (예: "${name}님은 웅장한 산봉우리 같은 든든한 존재예요.")
      - 핵심 특징 3가지: 전체 분석에서 가장 듣기 좋은 특징 3가지만 글머리 기호(💡, ✅ 등)를 사용해 초단문으로 요약해.
      - 바이럴 포인트: "내 운세, 언제 밀고 언제 쉬어야 할까 ✨"처럼 일, 돈, 컨디션이 함께 보이는 문구 한 줄을 반드시 마지막에 포함해.

      [필수 지시사항 - AI 글쓰기 절대 규칙 (가독성 최우선, 스낵 컬처 스타일)]
      1. AI가 줄글(수필) 형태로 길게 쓰는 것을 엄격히 금지한다. 대신 짧은 문장 여러 개로 깊이를 만들어라.
      2. 1문장 = 1줄: 절대 한 문단에 문장을 2개 이상 이어 쓰지 마라. 한 문장이 끝나면 무조건 줄바꿈(\\n\\n)을 해라.
      3. 초단문 사용: 접속사(그리고, 그래서, 하지만)를 남발하지 말고, 문장을 최대한 짧고 명쾌하게 끊어 쳐라. 단, 내용은 얕게 줄이지 마라.
      4. 여백 극대화: 유저가 스크롤을 내리며 휙휙 읽을 수 있도록 여백을 과하다 싶을 정도로 많이 줘라.
      5. 핵심 요약 리스트(Bullet points) 강제: 섹션마다 줄글만 쓰지 말고, 유저의 특징이나 조언을 글머리 기호(💡, ✅, 📌 등)를 사용해 3~4줄로 명확하게 요약해 주는 구간을 반드시 넣어라.
      6. 따뜻한 에세이 톤: 감성적인 웹소설이나 에세이를 읽는 듯한 아주 다정하고 부드러운 경어체("~해요", "~요")를 사용해라.
      7. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.

      [예시 포맷 - 이 구조를 반드시 따를 것]
      ## 🧭 핵심 운세 브리핑 (지금 가장 먼저 알아야 할 결론)
      **한 줄 결론:** ${name}님은 빠르게 밀어붙일 때보다, 방향을 정리한 뒤 꾸준히 쌓을 때 결과가 커지는 타입이에요.

      **왜 이렇게 보나요?**
      사주 안에서 밀어붙이는 힘보다 정리하고 버티는 힘이 더 안정적으로 작동하기 때문이에요.

      지금 중요한 건 무작정 더 하는 것이 아니라, 힘을 쓸 곳과 뺄 곳을 나누는 일이에요.

      **핵심 포인트**
      ✅ **일:** 혼자 버티는 일보다 구조를 만드는 일이 잘 맞아요.
      ✅ **돈:** 크게 벌기보다 새는 곳을 막을 때 체감이 빨라져요.
      ✅ **컨디션:** 마음이 급해지는 시기에는 수면과 루틴이 먼저 흔들려요.

      **실전 조언:** 이번 리포트는 돈만 보는 게 아니라, 일과 몸과 선택의 타이밍을 함께 보는 기준표로 읽으면 좋아요.

      [최종 출력]
      표지, 인사말, 구분선 없이 8개 섹션 본문만 출력해라.
      첫 줄은 반드시 "## 🧭 핵심 운세 브리핑"으로 시작해라.
      설명이나 사과 없이 리포트 본문만 출력해라.
      \\n\\n
    `;

    const firstResult = await generateText({
      prompt,
      openai: { model: 'gpt-5-mini', maxTokens: 16000, reasoningEffort: 'minimal' },
      geminiModels: [model, fallbackModel],
      label: 'Saju',
    });
    responseText = firstResult.text;

    const firstIssues = getSajuReportIssues(responseText, firstResult.finishReason);
    if (firstIssues.length > 0) {
      console.warn('[Gemini/Saju] Report completed with validation warnings:', firstIssues);
    }

    return NextResponse.json({ success: true, saju: sajuData, analysis: sanitizeYearRangeText(responseText) });

  } catch (error: any) {
    console.error('Saju API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
