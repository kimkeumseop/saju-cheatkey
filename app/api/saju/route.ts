import { NextResponse } from 'next/server';
import { calculateSaju, GROUP_TRAIT } from '@/lib/saju';
import { Solar } from 'lunar-javascript';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { streamReport, streamPrebuilt } from '@/lib/ai';
import { coerceSajuStructured, TIMING_KEYS, scrubUserText } from '@/lib/saju-schema';
import { buildReportCacheKey, getCachedReport, saveCachedReport } from '@/lib/saju-cache';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

// 프롬프트/스키마가 바뀌면 이 버전을 올려 기존 캐시를 무효화한다.
// v2: timing 구조화 배열 도입. v3: 십성 종합·신강약 grounding 주입.
// v4: few-shot 톤 예시 + 한자/전문용어 후필터.
const SAJU_CACHE_VERSION = 'v4';
const SAJU_CACHE_COLLECTION = 'sajuCache';

const STREAM_HEADERS = {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
};

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

/**
 * 모델이 출력한 JSON 문자열을 파싱·검증하고, 각 섹션 본문과 caution의 연도 범위 표기를
 * 정리한 뒤 정규화된 JSON 문자열로 돌려준다. (streamReport done 이벤트의 analysis로 저장됨)
 * 파싱 실패 시 원문을 그대로 돌려 레거시 마크다운 렌더 경로로 떨어지게 한다.
 */
function finalizeSajuJson(full: string) {
  const structured = coerceSajuStructured(full);
  if (!structured) return scrubUserText(sanitizeYearRangeText(full));

  const clean = (s: string) => scrubUserText(sanitizeYearRangeText(s));

  structured.headline = scrubUserText(structured.headline);
  structured.keywords = structured.keywords.map(scrubUserText).filter(Boolean);
  structured.sections = structured.sections.map((section) => ({
    title: section.title,
    content: clean(section.content),
  }));
  if (structured.caution) structured.caution = clean(structured.caution);
  if (structured.lucky?.advice) structured.lucky.advice = scrubUserText(structured.lucky.advice);
  if (structured.timing) {
    for (const key of TIMING_KEYS) {
      structured.timing[key] = structured.timing[key].map((line) => clean(line));
    }
  }

  return JSON.stringify(structured);
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
    const shinsalText = sajuData.keyShinsal?.length ? sajuData.keyShinsal.join(', ') : '특별한 신살 없음';
    const g = sajuData.tenGodGroups;
    const tenGodText = `비겁:${g.비겁}, 식상:${g.식상}, 재성:${g.재성}, 관성:${g.관성}, 인성:${g.인성}`;
    const dominantText = sajuData.dominantTenGod
      ? `${sajuData.dominantTenGod}(${GROUP_TRAIT[sajuData.dominantTenGod] || ''})`
      : '뚜렷한 편중 없음';
    const bodyStrengthText = `${sajuData.bodyStrength.label} 경향 (일간을 돕는 기운 비중 ${Math.round(sajuData.bodyStrength.ratio * 100)}%)`;
    const { todayText, currentYear } = getKoreanDateParts();

    // 결정론적 캐싱: 동일 (생년월일·시간·달력·성별·기준연도)이면 이전 결과를 그대로 재사용.
    // 이름은 키에서 제외(해석 본문은 출생 데이터에 의존, 화면 이름은 결과 문서에서 따로 표시).
    const cacheKey = buildReportCacheKey(SAJU_CACHE_VERSION, [
      birthDate, birthTime, calendarType, gender, currentYear,
    ]);
    const cachedAnalysis = await getCachedReport(SAJU_CACHE_COLLECTION, cacheKey);
    if (cachedAnalysis) {
      return new Response(streamPrebuilt(cachedAnalysis), { headers: STREAM_HEADERS });
    }

    const currentAge = calcAge(birthDate, currentYear);
    const yearlyFlowText = buildYearlyFlowText(currentYear, currentAge);
    const monthlyFlowText = buildMonthlyFlowText(currentYear);
    const daYunText = buildDaYunText(sajuData.daYun);
    const daYunRangeText = buildDaYunRangeText(sajuData.daYun, currentYear, currentAge);

    if (!apiKey && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI API 키(OPENAI/GEMINI)가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey || '');
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
      responseMimeType: 'application/json',
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
      너는 30년 경력의 사주 명리 상담가다. 사주팔자와 오행·십성·신살에 근거해, 마치 마주 앉아 짚어주듯 풀이한다.
      결과는 JSON 하나로만 출력한다. JSON 밖의 어떤 텍스트도, 코드블록(\`\`\`)도, 설명도 쓰지 마라.

      [말투 - 절대 준수: 점쟁이 해라체]
      1. 확신 있는 해라체로 단정하듯 말한다. "너는 ~한 사람이다.", "이 시기엔 ~해라." 처럼 끊어 친다.
      2. "~할 수도 있어요", "~인 것 같아요", "사람마다 다르지만" 같은 흐리멍덩한 경어체·회피 표현은 전면 금지.
      3. 단정하되 비하·저주·공포 조장은 하지 마라. 미래를 100% 못박지 말고 "선택에 달렸다"는 여지는 남겨라.
      4. 따뜻함은 유지한다. 냉정하게 짚되 결국 응원하는 어른의 어조다.

      [말투·형식 예시 - 톤과 흐름만 참고하고 내용은 절대 베끼지 마라]
      - headline 예: "너는 마른 들판의 불씨다. 불붙으면 크게 번지지만, 바람이 없으면 혼자 꺼진다."
      - timing 한 줄 예: "2027년: 판을 키우기 좋은 해 | 근거: 너를 밀어주는 기운이 들어온다 | 행동: 미뤄둔 제안을 먼저 꺼내라"
      - 섹션 문장 흐름 예: "너는 시작은 빠른데 마무리 전에 마음이 먼저 식는다(왜). 그래서 일이 늘 끝의 문턱에서 멈춘다(현실). 마감을 사람에게 공개하면 끝까지 간다(활용). 다만 새 자극이 오면 또 갈아타니 그걸 경계해라(함정)."

      [근거 사용 - 개인화의 핵심]
      1. 아래 사주 데이터에 근거해서만 해석해라. 누구에게나 들어맞는 일반론은 실패다.
      2. 어려운 한자·전문용어(비견, 식상, 갑자, 무오 등 60갑자/십성 명칭/한자)는 화면에 단 한 글자도 쓰지 마라.
      3. 대신 오행을 자연물로 번역해 단정해라. 예: "너는 물 위에 자란 나무다. 흡수는 빠르지만 뿌리가 마르면 한순간에 처진다."
      4. 각 섹션은 최소 2개 이상의 데이터(일간, 오행 분포, 십성 분포, 신강약, 신살, 10년 흐름, 월별·연도별 흐름)를 근거로 서로 다른 판단을 내려라.
      5. 십성 분포는 기질의 뼈대다. 가장 강한 축(예: 식상↑=표현·창의, 재성↑=실리·돈, 관성↑=책임·통제, 인성↑=학습·생각, 비겁↑=자아·경쟁)으로 성향을 단정하고, 약한 축은 보완점으로 짚어라.
      6. 신강약은 에너지 운용법으로 번역해라. 신강이면 "스스로 밀어붙이는 힘이 강하니 내보내는 일(표현·도전·확장)에서 잘 풀린다", 신약이면 "기운이 분산되기 쉬우니 사람·환경·루틴의 도움을 받을 때 강해진다" 식으로. 전문용어 '신강/신약'은 화면에 쓰지 말고 풀어서 말해라.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 분석 기준일: ${todayText}
      - 현재 나이 참고값: 약 ${currentAge}세
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}
      - 십성 분포(기질 구조): ${tenGodText}
      - 가장 강한 기질 축: ${dominantText}
      - 신강약 경향: ${bodyStrengthText}
      - 핵심 신살: ${shinsalText}
      - 10년 주기 흐름: ${daYunText}
      - 10년 주기 상세 구간: ${daYunRangeText}
      - ${currentYear}년 월별 흐름 참고값: ${monthlyFlowText}
      - 향후 10년 연도별 흐름 참고값: ${yearlyFlowText}

      [출력 JSON 스키마 - 이 형태만 출력]
      {
        "headline": "한 줄로 끊는 후킹 요약(해라체). 예: '너는 불씨를 키워 큰불로 만드는 사람이다.'",
        "keywords": ["기질 키워드 3~5개. 예: 추진력, 직관, 뒷심부족"],
        "scores": { "총운": 4, "직업운": 4.5, "재물운": 3.5, "애정운": 4, "건강운": 3, "대인관계": 4 },
        "sections": [ 아래 8개 섹션 객체 ],
        "timing": {
          "daeunExpansion": ["대운 확장 구간 2개"],
          "daeunMaintenance": ["대운 정비·축적 구간 2개"],
          "daeunCaution": ["대운 주의 구간 2개"],
          "daeunDecisions": ["인생 중요 결정 포인트 3개"],
          "wealthGoodYears": ["재물운 좋은 해 3개"],
          "wealthCautionYears": ["지출 주의 해 3개"],
          "monthlyGrowth": ["${currentYear}년 일·성장에 좋은 달 3개"],
          "monthlyMoney": ["${currentYear}년 돈 관리에 유리한 달 2개"],
          "monthlyCaution": ["${currentYear}년 컨디션·감정 관리가 필요한 달 3개"],
          "monthlyActions": ["이번 시기에 바로 할 일 3개"]
        },
        "lucky": { "numbers": [3, 7], "color": "남색", "direction": "동쪽", "advice": "부족한 기운을 채우는 개운 한 줄(해라체)" },
        "caution": "강점이 과해질 때 손해 보는 패턴을 냉정하게 짚는 한 단락(해라체)"
      }

      [scores 규칙] 0~5 사이, 0.5 단위. 모두 높게 주지 마라. 사주 균형에 따라 낮은 항목도 있어야 한다.

      [timing 규칙 - 화면 카드로 바로 쓰임, 매우 중요]
      - 각 배열의 원소는 한 줄 문자열이며 형식은 "라벨: 핵심 | 근거: ... | 행동: ..." 다.
      - 연도형(daeun*, wealth*): "2028년: 수입을 넓히기 좋은 해 | 근거: ... | 행동: ..." 처럼 개별 연도로 시작해라. 연도를 범위(~, -)로 묶지 마라.
      - 월형(monthly*): "3월: 새 일을 키우기 좋은 달 | 근거: ... | 행동: ..." 처럼 개별 월로 시작해라.
      - monthlyActions는 라벨 없이 "지금 바로 할 일" 한 줄씩 짧게 써도 된다.
      - 근거는 사주 데이터(오행·대운·흐름)에 붙여라. 모든 구간을 좋다고 하지 말고 좋음/주의를 섞어라.
      - 위 sections 본문과 내용이 겹쳐도 되지만, timing 배열은 반드시 채워라. 화면 핵심 카드가 이 배열로 그려진다.

      [sections 규칙 - 정확히 아래 8개를, 이 title 그대로, 이 순서로]
      각 섹션 객체는 { "title": "...", "content": "..." } 형태다.
      content는 줄바꿈(\\n\\n)으로 문단을 나눈 문자열이다. 한 문장이 끝나면 줄을 바꿔라(스낵 컬처 가독성).
      핵심 항목은 글머리기호(✅, 💡, 📌)로 3~4개 요약하는 구간을 각 섹션에 넣어라.
      각 섹션은 6~9줄. 얕은 칭찬 금지. "왜 그런지(근거) → 현실에서 어떻게 나타나는지 → 좋게 쓰는 법 → 조심할 함정" 흐름을 담아라.

      1) "title": "🧭 핵심 운세 브리핑"
         - 지금 가장 먼저 알아야 할 결론을 단정해라.
      2) "title": "🪞 타고난 기질과 생활 패턴"
         - 나도 몰랐던 진짜 성향. "시작은 빠른데 마무리 전에 마음이 먼저 지친다" 같은 관찰 문장을 넣어라.
      3) "title": "🚀 향후 대운 10년 인생 타이밍"
         - ${daYunRangeText} 를 기준으로 미래 10년을 비교해 풀어라.
         - 모든 구간을 좋다고 하지 마라. 등급(확장/축적/정비/주의)을 나눠라.
         - 연도는 범위(~, -)로 묶지 말고 "2028년, 2029년"처럼 개별 연도로 써라.
         - 투자종목/로또/코인 대박 같은 확정 표현 금지. (구간별 한 줄 요약은 위 timing 배열에 따로 채운다.)
      4) "title": "💼 직업운과 성장운"
         - 내가 빛나는 일의 방식과 커리어 전략. 좋은 해/주의 해/추천 행동/피해야 할 행동을 담아라.
      5) "title": "💰 재물운과 현실적인 돈 관리"
         - 돈이 들어오는 흐름과 새는 흐름을 사주 근거로 짚어라.
         - 계약, 이직, 성과급, 부업, 지출 정리 같은 생활 단어로 현실적으로 써라.
         - 돈을 쌓는 방법 3가지를 글머리기호로 정리해라. (연도별 좋은 해/주의 해는 위 timing 배열에 채운다.)
      6) "title": "📅 ${currentYear}년 월별 운세 캘린더"
         - 올해 흐름을 월 단위로 풀되 좋음/보통/주의를 섞어라.
         - 개별 월("3월")로 짚고 범위로 묶지 마라. (월별 좋은 달/주의 달/바로 할 일은 위 timing 배열에 채운다.)
      7) "title": "🌙 컨디션과 회복 루틴"
         - 질병 단정 금지. 에너지 소모 패턴, 수면/루틴/과로 주의, 회복 루틴을 현실적으로.
      8) "title": "📸 인스타 스토리 요약"
         - 후킹 한 문장 비유(해라체) + 핵심 특징 3가지(💡/✅) + 마지막에 바이럴 한 줄.

      [최종] 위 JSON 객체 하나만 출력해라. 첫 글자는 '{', 마지막 글자는 '}' 여야 한다.
    `;

    const stream = streamReport({
      prompt,
      openai: { model: 'gpt-5-mini', maxTokens: 16000, reasoningEffort: 'low', json: true },
      geminiModels: [model, fallbackModel],
      postProcess: finalizeSajuJson,
      // 구조화 JSON으로 정상 생성된 경우에만 캐시에 저장(폴백 마크다운은 캐싱하지 않음).
      onComplete: async (analysis) => {
        if (coerceSajuStructured(analysis)) {
          await saveCachedReport(SAJU_CACHE_COLLECTION, cacheKey, analysis, {
            version: SAJU_CACHE_VERSION,
            year: currentYear,
          });
        }
      },
      label: 'Saju',
    });

    return new Response(stream, { headers: STREAM_HEADERS });

  } catch (error: any) {
    console.error('Saju API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
