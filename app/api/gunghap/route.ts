import { NextResponse } from 'next/server';
import { calculateSaju, GROUP_TRAIT } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { streamReport, streamPrebuilt } from '@/lib/ai';
import { buildReportCacheKey, getCachedReport, saveCachedReport } from '@/lib/saju-cache';
import { coerceGunghapStructured, GUNGHAP_TIMING_KEYS, scrubUserText } from '@/lib/saju-schema';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

// 프롬프트/스키마가 바뀌면 이 버전을 올려 기존 캐시를 무효화한다.
// v2: JSON 구조화 출력 도입. v3: few-shot 톤 예시 + 한자/전문용어 후필터.
// v4: 두 사람 십성·신강약 grounding 비교 주입.
const GUNGHAP_CACHE_VERSION = 'v4';
const GUNGHAP_CACHE_COLLECTION = 'gunghapCache';

const STREAM_HEADERS = {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
};

const relationLabels: Record<string, string> = {
  friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자', 'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
  family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료', partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
};

const ELEMENT_NATURE: Record<string, string> = {
  '木': '성장',
  '火': '표현과 확장',
  '土': '안정과 책임',
  '金': '결실과 정리',
  '水': '대화와 이해',
};

function getCurrentYear() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(new Date()));
}

function describeElementPair(primaryElement: string, secondaryElement: string) {
  const primary = ELEMENT_NATURE[primaryElement] || '관계의 중심';
  const secondary = ELEMENT_NATURE[secondaryElement] || '균형';

  if (primaryElement === secondaryElement) {
    const sameElementGuide: Record<string, string> = {
      '木': '함께 새 계획을 키우기 쉬운 시기',
      '火': '감정 표현과 외부 활동이 커지기 쉬운 시기',
      '土': '책임, 약속, 생활 기반을 정리하기 좋은 시기',
      '金': '관계의 기준과 결과를 분명히 해야 하는 시기',
      '水': '대화와 속마음 확인이 중요해지는 시기',
    };
    return sameElementGuide[primaryElement] || `${primary}이 강해지는 시기`;
  }

  const pairGuide: Record<string, string> = {
    '木火': '새로운 시도가 감정 표현으로 이어지기 쉬운 시기',
    '火木': '서로를 북돋우며 일을 빠르게 벌이기 쉬운 시기',
    '木土': '관계의 성장을 현실적인 약속 위에 올려야 하는 시기',
    '土木': '흔들린 기준을 다시 세우고 다음 단계를 준비하는 시기',
    '木金': '키워온 관계를 선명한 선택으로 정리해야 하는 시기',
    '金木': '결론을 낸 뒤 새 방식으로 관계를 키우기 좋은 시기',
    '木水': '조심스럽게 배려하며 관계를 천천히 키우는 시기',
    '水木': '속마음을 말로 꺼낼 때 관계가 자라는 시기',
    '火土': '커진 감정을 안정적인 약속으로 묶어야 하는 시기',
    '土火': '쌓아둔 신뢰가 밖으로 드러나기 좋은 시기',
    '火金': '강한 표현과 기준이 부딪혀 조율이 필요한 시기',
    '金火': '결론을 서두르면 감정이 과열되기 쉬운 시기',
    '火水': '표현 속도와 속마음의 속도가 달라 오해가 생기기 쉬운 시기',
    '水火': '참아둔 말을 따뜻하게 꺼내야 관계가 풀리는 시기',
    '土金': '약속, 돈, 일정처럼 현실 조건을 분명히 하기 좋은 시기',
    '金土': '관계의 기준을 안정적으로 지키고 다듬어야 하는 시기',
    '土水': '생활 리듬과 감정 속도를 함께 맞춰야 하는 시기',
    '水土': '생각이 많아질수록 약속과 루틴이 필요한 시기',
    '金水': '차분한 대화로 서로의 기준을 다시 맞추기 좋은 시기',
    '水金': '감정보다 기준을 먼저 정하면 관계가 안정되는 시기',
  };

  return pairGuide[`${primaryElement}${secondaryElement}`] || `${primary}을 중심으로 ${secondary}을 맞춰야 하는 시기`;
}

function calcAge(birthDate: string, currentYear: number) {
  const birthYear = Number(birthDate?.split('-')?.[0]);
  if (!birthYear || Number.isNaN(birthYear)) return 25;
  return Math.max(0, currentYear - birthYear);
}

function buildElementDistText(elementsCount: Record<string, number> = {}) {
  return `목:${elementsCount['목'] ?? 0}, 화:${elementsCount['화'] ?? 0}, 토:${elementsCount['토'] ?? 0}, 금:${elementsCount['금'] ?? 0}, 수:${elementsCount['수'] ?? 0}`;
}

/** 한 사람의 기질 구조(십성 분포·최강 축·신강약)를 프롬프트용 한 줄로 만든다. */
function buildStructureText(saju: any) {
  const g = saju.tenGodGroups || { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  const dom = saju.dominantTenGod
    ? `${saju.dominantTenGod}(${GROUP_TRAIT[saju.dominantTenGod] || ''})`
    : '뚜렷한 편중 없음';
  const strength = saju.bodyStrength?.label || '중화';
  return `십성 비겁:${g.비겁}/식상:${g.식상}/재성:${g.재성}/관성:${g.관성}/인성:${g.인성} · 가장 강한 축: ${dom} · 기운: ${strength} 경향`;
}

function buildDaYunText(daYun: any[], currentYear: number, currentAge: number) {
  if (!Array.isArray(daYun) || daYun.length === 0) return '대운 정보 없음';
  const horizonEnd = currentYear + 9;
  const futureLines = daYun
    .map((dy, index) => {
      const nextAge = daYun[index + 1]?.age ?? dy.age + 10;
      const startYear = currentYear + (dy.age - currentAge);
      const endYear = startYear + Math.max(1, nextAge - dy.age) - 1;
      if (endYear < currentYear || startYear > horizonEnd) return null;
      const visibleStart = Math.max(currentYear, startYear);
      const visibleEnd = Math.min(horizonEnd, endYear);
      const years = Array.from({ length: visibleEnd - visibleStart + 1 }, (_, offset) => `${visibleStart + offset}년`).slice(0, 4).join(', ');
      return `${index + 1}번째 10년 흐름: ${describeElementPair(dy.ganElement, dy.zhiElement)} / 참고 연도: ${years}`;
    })
    .filter(Boolean);

  return (futureLines.length ? futureLines : daYun.slice(0, 3).map((dy, index) => `${index + 1}번째 10년 흐름: ${describeElementPair(dy.ganElement, dy.zhiElement)}`))
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
    .replace(/년\s*[~\-–—]\s*(\d{4})년/g, '$1년')
    .replace(/\s*\+\s*/g, ', ');
}

/**
 * 모델 JSON 문자열을 파싱·검증하고 섹션 본문/timing의 연도 범위 표기를 정리한 뒤
 * 정규화된 JSON 문자열로 돌려준다. 파싱 실패 시 원문을 sanitize해 레거시 마크다운 경로로 보낸다.
 */
function finalizeGunghapJson(full: string) {
  const structured = coerceGunghapStructured(full);
  if (!structured) return scrubUserText(sanitizeYearRangeText(full).trim());

  const clean = (s: string) => scrubUserText(sanitizeYearRangeText(s));

  structured.headline = scrubUserText(structured.headline);
  structured.sections = structured.sections.map((section) => ({
    title: section.title,
    content: clean(section.content),
  }));
  if (structured.timing) {
    for (const key of GUNGHAP_TIMING_KEYS) {
      structured.timing[key] = structured.timing[key].map((line) => clean(line));
    }
  }
  structured.synergy = structured.synergy.map((line) => clean(line));
  structured.conflict = structured.conflict.map((line) => clean(line));
  structured.action = structured.action.map((line) => clean(line));
  structured.avoid = structured.avoid.map((line) => clean(line));

  return JSON.stringify(structured);
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const { user1, user2, relationship } = await req.json();
    const relationLabel = relationLabels[relationship] || '인연';
    const currentYear = getCurrentYear();

    // 결정론적 캐싱: 동일 (두 사람 출생 데이터 + 관계 + 기준연도)이면 이전 결과 재사용.
    // 관계는 본인(user1) 관점이라 순서를 보존한다((A,B) ≠ (B,A)).
    const cacheKey = buildReportCacheKey(GUNGHAP_CACHE_VERSION, [
      user1?.birthDate, user1?.birthTime, user1?.calendarType, user1?.gender,
      user2?.birthDate, user2?.birthTime, user2?.calendarType, user2?.gender,
      relationship, currentYear,
    ]);
    const cachedAnalysis = await getCachedReport(GUNGHAP_CACHE_COLLECTION, cacheKey);
    if (cachedAnalysis) {
      return new Response(streamPrebuilt(cachedAnalysis), { headers: STREAM_HEADERS });
    }

    if (!apiKey && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI API 키(OPENAI/GEMINI)가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);
    const currentAge1 = calcAge(user1.birthDate, currentYear);
    const currentAge2 = calcAge(user2.birthDate, currentYear);
    
    const pillars1 = saju1.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const pillars2 = saju2.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');

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
      너는 두 사람의 사주를 쉽게 번역해서 관계의 장점, 약점, 타이밍을 현실적으로 짚어주는 프리미엄 궁합 상담가야.
      결과는 "돈 주고 본 궁합 리포트"처럼 구체적이어야 하지만, 화면에서는 한눈에 읽혀야 해.
      결과는 JSON 하나로만 출력한다. JSON 밖의 어떤 텍스트도, 코드블록(\`\`\`)도, 설명도 쓰지 마라.

      [유저 정보]
      - 본인: ${user1.name} / 관계: ${relationLabel} / 사주 참고값: ${pillars1} / 일간: ${saju1.dayGanKo} / 오행 분포: ${buildElementDistText(saju1.elementsCount)}
        · 기질 구조: ${buildStructureText(saju1)}
      - 상대방: ${user2.name} / 사주 참고값: ${pillars2} / 일간: ${saju2.dayGanKo} / 오행 분포: ${buildElementDistText(saju2.elementsCount)}
        · 기질 구조: ${buildStructureText(saju2)}
      - 분석 기준 연도: ${currentYear}년
      - 본인의 향후 10년 참고 흐름: ${buildDaYunText(saju1.daYun, currentYear, currentAge1)}
      - 상대방의 향후 10년 참고 흐름: ${buildDaYunText(saju2.daYun, currentYear, currentAge2)}

      [절대 금지]
      1. 비견, 식상, 편관, 갑자, 무오, 기사 같은 명리학 전문용어와 한자를 최종 화면에 쓰지 마라.
      2. "확장+정비", "성장+결실"처럼 플러스 기호로 묶지 마라. 사용자가 이해할 수 있는 문장으로 풀어라.
      3. "2028년~2030년", "년 ~ 2032년", "37세~41세" 같은 범위 표기를 쓰지 마라.
      4. 시기는 반드시 "2028년", "2029년"처럼 개별 연도로 찍어라. 여러 해는 쉼표로 나열해라.
      5. 모든 내용을 좋게 쓰지 마라. 가까워지는 해, 멀어지기 쉬운 해, 결정해야 하는 해를 나누어라.
      6. 관계가 직장/사업/친구/가족이면 사랑, 설렘, 연애 같은 표현을 남발하지 말고 그 관계에 맞는 언어를 써라.
      7. "대화를 많이 하세요" 같은 뻔한 조언을 금지한다. 돈, 일정, 말투, 감정, 거리감 중 무엇을 어떻게 조정해야 하는지 말해라.
      8. 같은 표현을 반복하지 마라. "운명", "찰떡", "빛나요", "따뜻해요"를 과하게 쓰면 실패다.

      [말투·형식 예시 - 형식만 참고하고 내용은 절대 베끼지 마라]
      - headline 예: "둘은 속도가 다른 두 시계다. 맞추면 오래 가고, 방치하면 어긋난다."
      - timing 한 줄 예: "2028년: 가까워지기 좋은 해 | 근거: 둘 다 관계를 밖으로 드러내려는 흐름 | 행동: 만남 횟수와 약속의 이름을 분명히 정한다"

      [두 사람 기질 구조 비교 - 개인화의 핵심]
      1. 두 사람의 십성 최강 축을 맞대서 관계 역학을 단정해라. 예: 한쪽이 표현(식상)이 세고 한쪽이 책임(관성)이 세면 "한쪽은 분위기를 띄우고, 한쪽은 선을 긋는다. 그래서 신날 땐 잘 맞다가 결정 앞에서 부딪힌다."
      2. 신강약 조합도 읽어라. 둘 다 신강이면 주도권 다툼, 둘 다 신약이면 서로 기대다 둘 다 지침, 신강·신약이면 한쪽이 끌고 한쪽이 받쳐주는 그림으로 풀어라.
      3. 단, '십성·신강·신약' 같은 전문용어와 한자는 화면에 쓰지 말고 생활 언어로 번역해라.

      [글쓰기 깊이]
      1. 각 섹션은 결론부터 시작해라.
      2. 각 섹션마다 반드시 "한 줄 결론", "좋은 이유", "현실 장면", "추천 행동", "조심할 점" 중 3개 이상을 포함해라.
      3. 근거는 전문용어 대신 생활 언어로 번역해라. 예: "한쪽은 속도가 빠르고, 한쪽은 기준을 먼저 세우려는 편이라 결정 순서가 어긋나기 쉬워요."
      4. 점수는 실제 조합처럼 줘라. 애매하면 60점대/70점대도 가능하다.
      5. 미래는 단정하지 말고, 선택에 따라 좋아지는 지점과 방치하면 틀어지는 지점을 함께 보여줘라.

      [출력 JSON 스키마 - 이 형태만 출력]
      {
        "headline": "두 사람 관계를 한 문장으로 끊는 요약",
        "compatibilityScore": 78,
        "sections": [ 아래 7개 섹션 객체 ],
        "synergy": ["잘 맞는 지점 3개(짧은 한 줄)"],
        "conflict": ["반복되는 갈등 포인트 3개(짧은 한 줄)"],
        "action": ["관계를 지키는 실전 행동 3개(짧은 한 줄)"],
        "avoid": ["이 관계에서 피해야 할 선택 2~3개(짧은 한 줄)"],
        "timing": {
          "closer": ["가까워지는 해 2개"],
          "distance": ["멀어지기 쉬운 해 2개"],
          "decision": ["관계를 결정해야 하는 해 3개"],
          "actions": ["그 시기에 하면 좋은 행동 3개(일정/돈/감정)"]
        }
      }

      [compatibilityScore 규칙] 0~100 정수. 실제 조합처럼 줘라. 애매하면 60점대/70점대도 가능하다.

      [sections 규칙 - 정확히 아래 7개를, 이 title 그대로, 이 순서로]
      각 섹션 객체는 { "title": "...", "content": "..." } 형태다. content는 줄바꿈(\\n\\n)으로 문단을 나눈 문자열.
      각 섹션은 결론부터 시작하고 5~8줄. "한 줄 결론 → 좋은 이유 → 현실 장면 → 추천 행동 → 조심할 점" 중 3개 이상을 담아라.
      1) "title": "💞 두 사람의 관계 핵심 브리핑"
      2) "title": "✨ 끌림과 시너지 포인트"
      3) "title": "⚠️ 갈등 포인트와 진짜 마음"
      4) "title": "🕰️ 향후 10년 관계 타이밍"  (구간별 한 줄 요약은 위 timing 배열에 따로 채운다.)
      5) "title": "✅ 관계를 지키는 실전 행동 5가지"
      6) "title": "🚫 이 관계에서 피해야 할 선택"
      7) "title": "📸 인스타 스토리 요약"

      [timing 규칙 - 화면 카드로 바로 쓰임, 매우 중요]
      - 각 배열의 원소는 "2028년: 핵심 결론 | 근거: ... | 행동: ..." 형식 한 줄 문자열이다(파이프로 분리).
      - 연도는 반드시 개별 연도("2028년")로 시작하고, 범위(~, -)로 묶지 마라.
      - actions는 라벨 없이 "일정: ...", "돈: ...", "감정: ..."처럼 짧게 써도 된다.
      - 모든 시기를 좋게 쓰지 마라. 가까워지는/멀어지는/결정 시기를 분명히 나눠라.

      [최종] 위 JSON 객체 하나만 출력해라. 첫 글자는 '{', 마지막 글자는 '}' 여야 한다.
    `;

    const stream = streamReport({
      prompt,
      openai: { model: 'gpt-5-mini', maxTokens: 16000, reasoningEffort: 'low', json: true },
      geminiModels: [model, fallbackModel],
      postProcess: finalizeGunghapJson,
      // 구조화 JSON으로 정상 생성된 경우에만 캐시에 저장.
      onComplete: async (analysis) => {
        if (coerceGunghapStructured(analysis)) {
          await saveCachedReport(GUNGHAP_CACHE_COLLECTION, cacheKey, analysis, {
            version: GUNGHAP_CACHE_VERSION,
            year: currentYear,
          });
        }
      },
      label: 'Gunghap',
    });

    return new Response(stream, { headers: STREAM_HEADERS });

  } catch (error: any) {
    console.error('Gunghap API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
