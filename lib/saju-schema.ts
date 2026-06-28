// 사주 리포트 구조화 출력 스키마 + 파싱/검증 헬퍼.
// 서버(app/api/saju/route.ts postProcess)와 클라이언트(lib/ai-result.ts) 양쪽에서 공유한다.
// AI는 아래 SajuStructured 형태의 JSON 하나를 출력하며, sections는 기존 렌더러가 그대로 소비한다.

export interface SajuScores {
  총운: number;
  직업운: number;
  재물운: number;
  애정운: number;
  건강운: number;
  대인관계: number;
}

export interface SajuLucky {
  numbers: number[];
  color: string;
  direction: string;
  advice: string;
}

export interface SajuSectionRaw {
  title: string;
  content: string;
}

export interface SajuStructured {
  headline: string;
  keywords: string[];
  scores: SajuScores | null;
  sections: SajuSectionRaw[];
  lucky: SajuLucky | null;
  caution: string;
}

export const SCORE_KEYS: (keyof SajuScores)[] = [
  '총운', '직업운', '재물운', '애정운', '건강운', '대인관계',
];

/** 모델 출력 문자열에서 JSON 객체를 최대한 안전하게 추출한다. (코드펜스/잡텍스트 허용) */
export function extractJsonObject(input: unknown): Record<string, unknown> | null {
  if (input && typeof input === 'object') return input as Record<string, unknown>;
  if (typeof input !== 'string') return null;

  let text = input.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 1) 통째로 파싱 시도
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
  } catch {
    // 2) 첫 '{' ~ 마지막 '}' 구간만 잘라서 재시도
  }

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      const parsed = JSON.parse(text.slice(first, last + 1));
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function toStr(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toStrArray(value: unknown, max = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).slice(0, max);
}

function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n * 2) / 2));
}

function coerceScores(value: unknown): SajuScores | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const hasAny = SCORE_KEYS.some((k) => v[k] !== undefined);
  if (!hasAny) return null;
  return {
    총운: clampScore(v['총운']),
    직업운: clampScore(v['직업운']),
    재물운: clampScore(v['재물운']),
    애정운: clampScore(v['애정운']),
    건강운: clampScore(v['건강운']),
    대인관계: clampScore(v['대인관계']),
  };
}

function coerceLucky(value: unknown): SajuLucky | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const numbers = Array.isArray(v.numbers)
    ? v.numbers.map((n) => Number(n)).filter((n) => Number.isFinite(n)).slice(0, 4)
    : [];
  const lucky: SajuLucky = {
    numbers,
    color: toStr(v.color).trim(),
    direction: toStr(v.direction).trim(),
    advice: toStr(v.advice).trim(),
  };
  if (!lucky.numbers.length && !lucky.color && !lucky.direction && !lucky.advice) return null;
  return lucky;
}

function coerceSections(value: unknown): SajuSectionRaw[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const r = s as Record<string, unknown>;
      const title = toStr(r.title).trim();
      // content 또는 body 둘 다 허용
      const content = (toStr(r.content) || toStr(r.body)).trim();
      if (!title && !content) return null;
      return { title, content };
    })
    .filter((s): s is SajuSectionRaw => Boolean(s))
    .slice(0, 10);
}

/** 임의 입력을 SajuStructured로 정규화. sections가 없으면 구조화 실패로 보고 null 반환. */
export function coerceSajuStructured(input: unknown): SajuStructured | null {
  const obj = extractJsonObject(input);
  if (!obj) return null;
  const sections = coerceSections(obj.sections);
  if (sections.length === 0) return null; // 구조화된 섹션이 없으면 JSON으로 인정하지 않음(레거시 마크다운 처리)

  return {
    headline: toStr(obj.headline).trim(),
    keywords: toStrArray(obj.keywords),
    scores: coerceScores(obj.scores),
    sections,
    lucky: coerceLucky(obj.lucky),
    caution: toStr(obj.caution).trim(),
  };
}

/** 입력이 구조화 사주 JSON인지 빠르게 판별 */
export function isSajuStructured(input: unknown): boolean {
  return coerceSajuStructured(input) !== null;
}
