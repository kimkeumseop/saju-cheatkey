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

function normalizeLineBreaks(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripCodeFence(text: string) {
  return text
    .trim()
    .replace(/^```markdown\s*/i, '')
    .replace(/^```md\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/g, '')
    .trim();
}

function cleanTitle(title: string) {
  return title.replace(/^#+\s*/, '').trim();
}

function normalizeObjectSections(value: unknown): AnalysisSection[] {
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.sections)) return [];

  return record.sections
    .map((section, index) => {
      if (!section || typeof section !== 'object') return null;
      const sectionRecord = section as Record<string, unknown>;
      const title = typeof sectionRecord.title === 'string' ? cleanTitle(sectionRecord.title) : `분석 ${index + 1}`;
      const content = typeof sectionRecord.content === 'string' ? normalizeLineBreaks(sectionRecord.content) : '';

      return {
        title,
        content,
      };
    })
    .filter((section): section is AnalysisSection => Boolean(section))
    .slice(0, 6);
}

export function parseAnalysisSections(value: unknown): ParsedSectionsResult {
  const rawText = (() => {
    if (typeof value === 'string') return normalizeLineBreaks(stripCodeFence(value));
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.rawText === 'string' && record.rawText.trim()) {
        return normalizeLineBreaks(stripCodeFence(record.rawText));
      }
    }
    return '';
  })();

  // Streaming 중에는 rawText가 가장 최신 상태이므로 sections보다 우선 파싱한다.
  // rawText가 없을 때만 legacy object sections를 fallback으로 사용한다.
  if (!rawText) {
    const objectSections = normalizeObjectSections(value);
    if (objectSections.length > 0) {
      return {
        rawText: objectSections.map((section) => `## ${section.title}\n${section.content}`).join('\n\n'),
        sections: objectSections,
      };
    }
  }

  if (!rawText) {
    return {
      rawText: '',
      sections: [{ title: '분석 준비 중', content: SOFT_ERROR_MESSAGE }],
    };
  }

  const splitBlocks = rawText
    .split(/(?=^##)/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const hasSectionMarker = splitBlocks.some((block) => block.startsWith('##'));
  const blocksToParse = hasSectionMarker ? splitBlocks.filter((block) => block.startsWith('##')) : splitBlocks;

  const sections = blocksToParse
    .map((block, index) => {
      const normalizedBlock = block.startsWith('##') ? block.replace(/^##\s*/, '') : block;
      const [firstLine = '', ...restLines] = normalizedBlock.split('\n');
      const title = cleanTitle(firstLine) || `분석 ${index + 1}`;
      const content = normalizeLineBreaks(restLines.join('\n'));

      return {
        title,
        content,
      };
    })
    .filter((section) => section.title || section.content)
    .map((section, index) => ({
      title: section.title || `분석 ${index + 1}`,
      content: section.content || '',
    }));

  if (sections.length > 0) {
    return { rawText, sections };
  }

  return {
    rawText,
    sections: [{ title: '운명의 흐름', content: rawText }],
  };
}

export function normalizeSajuAiResult(value: unknown): ParsedSectionsResult {
  return parseAnalysisSections(value);
}

export function normalizeGunghapAiResult(value: unknown): ParsedGunghapResult {
  const normalized = parseAnalysisSections(value);
  const legacyRecord = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const lines = normalized.rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const scoreLine = lines.find((line) => /궁합\s*점수\s*[:：]?\s*\d{1,3}\s*점/.test(line) || /^\d{1,3}\s*점$/.test(line));
  const headlineLine = lines.find((line) => !line.startsWith('##') && !/점/.test(line));
  const scoreMatch = scoreLine?.match(/(\d{1,3})\s*점/);

  return {
    ...normalized,
    compatibilityScore:
      typeof legacyRecord?.compatibilityScore === 'number'
        ? Math.min(100, legacyRecord.compatibilityScore)
        : scoreMatch
          ? Math.min(100, Number(scoreMatch[1]))
          : 80,
    headline:
      typeof legacyRecord?.headline === 'string' && legacyRecord.headline.trim()
        ? legacyRecord.headline.trim()
        : headlineLine || normalized.sections[0]?.content || SOFT_ERROR_MESSAGE,
  };
}
