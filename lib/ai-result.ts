'use client';

const SOFT_ERROR_MESSAGE = '운명의 흐름을 정리하는 중입니다. 다시 시도해주세요.';

export type AnalysisSection = {
  title: string;
  content: string;
};

type ParsedSectionsResult = {
  rawText: string;
  sections: AnalysisSection[];
};

type ParsedGunghapResult = ParsedSectionsResult & {
  compatibilityScore?: number;
  headline?: string;
};

function stripCodeFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/g, '')
    .trim();
}

function normalizeSection(section: unknown): AnalysisSection | null {
  if (!section || typeof section !== 'object') return null;

  const record = section as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const content = typeof record.content === 'string' ? record.content.trim() : '';

  if (!title || !content) return null;

  return {
    title,
    content,
  };
}

function normalizeSections(sections: unknown): AnalysisSection[] {
  if (!Array.isArray(sections)) return [];

  return sections
    .map((section) => normalizeSection(section))
    .filter((section): section is AnalysisSection => Boolean(section))
    .slice(0, 6);
}

function parsePossibleJson(value: string) {
  const cleaned = stripCodeFence(value);
  const candidates = [cleaned, ...(cleaned.match(/\{[\s\S]*\}/g) || [])];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  return null;
}

function splitMarkdownSections(text: string): AnalysisSection[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [{ title: '분석 준비 중', content: SOFT_ERROR_MESSAGE }];
  }

  const lines = normalized.split('\n');
  const sections: AnalysisSection[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];
  let introContent: string[] = [];

  const pushSection = () => {
    const content = currentContent.join('\n').trim();
    if (!content) return;
    sections.push({
      title: currentTitle || `분석 ${sections.length + 1}`,
      content,
    });
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentTitle || currentContent.length > 0) {
        pushSection();
      } else if (introContent.length > 0) {
        sections.push({
          title: '운명의 흐름',
          content: introContent.join('\n').trim(),
        });
        introContent = [];
      }

      currentTitle = line.replace(/^###\s*/, '').trim() || `분석 ${sections.length + 1}`;
      currentContent = [];
      continue;
    }

    if (!currentTitle) {
      introContent.push(line);
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle || currentContent.length > 0) {
    pushSection();
  } else if (introContent.length > 0) {
    sections.push({
      title: '운명의 흐름',
      content: introContent.join('\n').trim(),
    });
  }

  const normalizedSections = sections.filter((section) => section.content);
  return normalizedSections.length > 0
    ? normalizedSections
    : [{ title: '분석 준비 중', content: SOFT_ERROR_MESSAGE }];
}

function normalizeRawText(value: unknown) {
  if (typeof value === 'string') return stripCodeFence(value);

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return '';
}

function parseSectionsResult(value: unknown): ParsedSectionsResult {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sections = normalizeSections(record.sections);
    if (sections.length > 0) {
      return {
        rawText: normalizeRawText(value),
        sections,
      };
    }
  }

  const text = typeof value === 'string' ? value : '';
  const parsed = parsePossibleJson(text);

  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;
    const sections = normalizeSections(record.sections);
    if (sections.length > 0) {
      return {
        rawText: stripCodeFence(text),
        sections,
      };
    }
  }

  const plainText = normalizeRawText(value);

  return {
    rawText: plainText,
    sections: splitMarkdownSections(plainText),
  };
}

export function normalizeSajuAiResult(value: unknown): ParsedSectionsResult {
  return parseSectionsResult(value);
}

export function normalizeGunghapAiResult(value: unknown): ParsedGunghapResult {
  const normalized = parseSectionsResult(value);

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return {
      ...normalized,
      compatibilityScore: typeof record.compatibilityScore === 'number' ? Math.min(100, record.compatibilityScore) : 80,
      headline: typeof record.headline === 'string' && record.headline.trim()
        ? record.headline.trim()
        : normalized.sections[0]?.content || SOFT_ERROR_MESSAGE,
    };
  }

  const parsed = typeof value === 'string' ? parsePossibleJson(value) : null;
  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;
    return {
      ...normalized,
      compatibilityScore: typeof record.compatibilityScore === 'number' ? Math.min(100, record.compatibilityScore) : 80,
      headline: typeof record.headline === 'string' && record.headline.trim()
        ? record.headline.trim()
        : normalized.sections[0]?.content || SOFT_ERROR_MESSAGE,
    };
  }

  const lines = normalized.rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const scoreLine = lines.find((line) => /점/.test(line));
  const headlineLine = lines.find((line) => !line.startsWith('###') && !/점/.test(line));
  const scoreMatch = scoreLine?.match(/(\d{1,3})\s*점/);

  return {
    ...normalized,
    compatibilityScore: scoreMatch ? Math.min(100, Number(scoreMatch[1])) : 80,
    headline: headlineLine || normalized.sections[0]?.content || SOFT_ERROR_MESSAGE,
  };
}
