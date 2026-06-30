import { NextResponse } from 'next/server';
import { calculateSaju, GROUP_TRAIT } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { streamReport, streamPrebuilt } from '@/lib/ai';
import { coerceSajuReport, SAJU_ITEM_KEYS, scrubUserText } from '@/lib/saju-schema';
import { buildReportCacheKey, getCachedReport, saveCachedReport } from '@/lib/saju-cache';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

// 프롬프트/스키마가 바뀌면 이 버전을 올려 기존 캐시를 무효화한다.
// v2: timing 구조화 배열 도입. v3: 십성 종합·신강약 grounding 주입.
// v4: few-shot 톤 예시 + 한자/전문용어 후필터. v5: scores를 십성·신강약 구조에 근거.
// v6: lifeStages(생애 흐름) 추가. v7: 점신식 정통사주 구조로 전면 재설계(항목별 별점/본문/조언+신살풀이).
const SAJU_CACHE_VERSION = 'v7';
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
 * 점신식 SajuReport JSON을 파싱·검증하고 연도 범위/한자 누수를 정리한 뒤 정규화 문자열로 돌려준다.
 * (streamReport done 이벤트의 analysis로 저장됨) 파싱 실패 시 원문을 정리해 폴백 경로로 보낸다.
 */
function finalizeSajuReport(full: string) {
  const report = coerceSajuReport(full);
  if (!report) return scrubUserText(sanitizeYearRangeText(full));

  const clean = (s: string) => scrubUserText(sanitizeYearRangeText(s));

  report.headline = scrubUserText(report.headline);
  report.keywords = report.keywords.map(scrubUserText).filter(Boolean);
  report.overall = clean(report.overall);
  for (const k of SAJU_ITEM_KEYS) {
    report.items[k] = {
      score: report.items[k].score,
      body: clean(report.items[k].body),
      tip: clean(report.items[k].tip),
    };
  }
  if (report.lifeStages) {
    report.lifeStages = {
      early: clean(report.lifeStages.early),
      middle: clean(report.lifeStages.middle),
      late: clean(report.lifeStages.late),
      peak: clean(report.lifeStages.peak),
    };
  }
  report.shinsal = report.shinsal.map((s) => ({ name: scrubUserText(s.name), meaning: clean(s.meaning) }));
  if (report.lucky?.advice) report.lucky.advice = scrubUserText(report.lucky.advice);
  if (report.caution) report.caution = clean(report.caution);

  return JSON.stringify(report);
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
      - 항목 body 흐름 예: "너는 시작은 빠른데 마무리 전에 마음이 먼저 식는다(왜). 그래서 일이 늘 끝의 문턱에서 멈춘다(현실). 마감을 사람에게 공개하면 끝까지 간다(활용). 다만 새 자극이 오면 또 갈아타니 그걸 경계해라(함정)."
      - tip 예: "큰일은 혼자 끌지 말고 마무리 담당을 옆에 둬라."

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

      [출력 JSON 스키마 - 이 형태만 출력]
      {
        "headline": "한 줄로 끊는 후킹 요약(해라체). 예: '너는 불씨를 키워 큰불로 만드는 사람이다.'",
        "keywords": ["기질 키워드 3~5개. 예: 추진력, 직관, 뒷심부족"],
        "overallScore": 4,
        "overall": "평생 총운 한 단락(6~9줄). 일간·오행·신강약을 근거로 이 사람 인생 전체를 관통하는 결을 단정해라.",
        "items": {
          "personality": { "score": 4, "body": "성격·기질운 본문 5~8줄", "tip": "한 줄 실천 조언" },
          "wealth":      { "score": 3.5, "body": "재물운 본문 5~8줄", "tip": "한 줄 실천 조언" },
          "career":      { "score": 4, "body": "직업·사업운 본문 5~8줄", "tip": "한 줄 실천 조언" },
          "love":        { "score": 4, "body": "애정·결혼운 본문 5~8줄", "tip": "한 줄 실천 조언" },
          "health":      { "score": 3, "body": "건강운 본문 5~8줄", "tip": "한 줄 실천 조언" },
          "relationship":{ "score": 4, "body": "대인관계운 본문 5~8줄", "tip": "한 줄 실천 조언" }
        },
        "lifeStages": {
          "early": "초년(태어나 20대까지) 흐름 2~3문장(해라체)",
          "middle": "중년(30~40대) 흐름 2~3문장(해라체)",
          "late": "말년(50대 이후) 흐름 2~3문장(해라체)",
          "peak": "인생이 가장 크게 피는 시기를 한 줄로 단정(해라체)"
        },
        "shinsal": [ { "name": "천을귀인", "meaning": "이 신살이 네 삶에서 뜻하는 바를 해라체로 2~3문장" } ],
        "lucky": { "numbers": [3, 7], "color": "남색", "direction": "동쪽", "advice": "부족한 기운을 채우는 개운 한 줄(해라체)" },
        "caution": "강점이 과해질 때 손해 보는 패턴을 냉정하게 짚는 한 단락(해라체)"
      }

      [items 규칙 - 결과의 핵심. 6개 항목을 모두, 이 키 그대로 채워라]
      - 각 body는 5~8줄. "왜 그런지(근거) → 현실에서 어떻게 나타나는지 → 좋게 쓰는 법 → 조심할 함정" 흐름. 한 문장 끝나면 줄을 바꿔라(가독성).
      - 항목마다 서로 다른 데이터를 근거로 다른 판단을 내려라. 얕은 칭찬·복붙 금지.
      - tip은 당장 실천 가능한 한 줄.
      - personality: 십성 최강 축으로 기질을 단정.
      - wealth: 재성+신강이면 돈길이 넓다, 재성 약/신약이면 새기 쉽다. 계약·부업·지출 같은 생활 단어로.
      - career: 관성(책임·통제)과 식상(표현)으로 일하는 방식과 커리어 전략을.
      - love: 관계에서 끌리는 결과 어긋나는 지점을. 연애·결혼 단정은 피하고 선택 여지는 남겨라.
      - health: 질병 단정 금지. 오행 균형으로 에너지 소모 패턴·회복 루틴을.
      - relationship: 식상·비겁으로 사람 대하는 방식과 조심할 점을.

      [score 규칙] 각 item.score와 overallScore는 0~5, 0.5 단위. 모두 높게 주지 마라. 위 구조에 근거해 차등을 둬라.
      - wealth: 재성 강+신강이면 높게, 재성 0/신약이면 낮게. career: 관성 안정이면 높게, 과하거나 비면 낮게.
      - relationship: 식상·비겁이 받치면 높게. health: 오행 고르면 높게, 한 오행 0/심한 쏠림이면 낮게.
      - overallScore: 6개 항목과 신강약을 종합. 약한 구조면 솔직히 낮춰라.

      [lifeStages 규칙 - 점신식 생애 흐름 서사]
      - 대운 흐름(${daYunRangeText})에 근거해 초년→중년→말년의 큰 흐름을 단정해라. 막연한 일반론 금지.
      - peak는 "너의 전성기는 40대 중반부터 50대 초반이다." 처럼 가장 크게 피는 시기를 대운 근거로 한 줄 단정.
      - 좋게만 쓰지 말고 단계마다 강점과 조심할 점을 함께 담아라. 전문용어·한자 금지.

      [shinsal 규칙] 위 '핵심 신살'에 적힌 신살 각각을 name(그 이름)과 meaning(그 신살이 이 사람 삶에서 뜻하는 바, 해라체 2~3문장)으로 풀어라. '특별한 신살 없음'이면 빈 배열 []로 둬라. 한자 금지.

      [최종] 위 JSON 객체 하나만 출력해라. 첫 글자는 '{', 마지막 글자는 '}' 여야 한다.
    `;

    const stream = streamReport({
      prompt,
      openai: { model: 'gpt-5-mini', maxTokens: 16000, reasoningEffort: 'low', json: true },
      geminiModels: [model, fallbackModel],
      postProcess: finalizeSajuReport,
      // 점신식 리포트(items 포함)로 정상 생성된 경우에만 캐시에 저장.
      onComplete: async (analysis) => {
        if (coerceSajuReport(analysis)) {
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
