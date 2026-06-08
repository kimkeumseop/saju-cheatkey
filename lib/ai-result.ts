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

const SAJU_MAJOR_SECTION_PATTERNS = [
  '핵심운세',
  '브리핑',
  '기질',
  '생활패턴',
  '대운10년',
  '인생타이밍',
  '직업운',
  '성장운',
  '재물운',
  '돈관리',
  '월별운세',
  '운세캘린더',
  '컨디션',
  '회복루틴',
  '인스타',
  '스토리요약',
];

const GUNGHAP_MAJOR_SECTION_PATTERNS = [
  '관계핵심브리핑',
  '핵심브리핑',
  '끌림과시너지',
  '시너지포인트',
  '갈등포인트',
  '진짜마음',
  '향후10년관계타이밍',
  '관계타이밍',
  '실전행동',
  '관계를지키는',
  '피해야할선택',
  '방치하면틀어지는',
  '인스타',
  '스토리요약',
];

function normalizeLineBreaks(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/(\d{4})년\s*[~\-–—]\s*(\d{4})년/g, (_match, startYear, endYear) => expandYearRange(startYear, endYear))
    .replace(/(^|\n)(\s*(?:[-*•]|\d+[.)])?\s*)년\s*[~\-–—]\s*(\d{4})년\s*(?:\([^)\n]*\))?/g, (_match, lineStart, prefix, endYear) => `${lineStart}${prefix}${endYear}년`)
    .replace(/\s*\(\s*\d{1,3}\s*세\s*[~\-–—]\s*\d{1,3}\s*세\s*\)/g, '')
    .replace(/년\s*[~\-–—]\s*(\d{4})년/g, '$1년')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeCompact(value: string) {
  return value.replace(/\s/g, '');
}

function expandYearRange(startYearText: string, endYearText: string) {
  const startYear = Number(startYearText);
  const endYear = Number(endYearText);
  if (!startYear || !endYear || endYear < startYear || endYear - startYear > 10) {
    return `${startYearText}년, ${endYearText}년`;
  }

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => `${startYear + index}년`).join(', ');
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

function mergeSectionsByMajorPatterns(sections: AnalysisSection[], patterns: string[]) {
  return sections.reduce<AnalysisSection[]>((mergedSections, section) => {
    const compactTitle = normalizeCompact(section.title);
    const isMajorSection = patterns.some((pattern) => compactTitle.includes(pattern));

    if (mergedSections.length === 0 || isMajorSection) {
      mergedSections.push({ ...section });
      return mergedSections;
    }

    const previous = mergedSections[mergedSections.length - 1];
    previous.content = normalizeLineBreaks(`${previous.content}\n\n**${section.title}**\n${section.content}`);
    return mergedSections;
  }, []);
}

function hasUsefulContent(content: string) {
  return content
    .replace(/\*\*/g, '')
    .replace(/^[✅📌💡💰💸⚠️🔥✨🌱🌊🌙⭐️⭐\-*•\d.)\s]+/gm, '')
    .split('\n')
    .map((line) => line.trim())
    .some((line) => line.length >= 6 && !line.endsWith(':'));
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
    .filter((section): section is AnalysisSection => Boolean(section && hasUsefulContent(section.content)))
    .slice(0, 10);
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
    .filter((section) => hasUsefulContent(section.content))
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
  const normalized = parseAnalysisSections(value);
  const mergedSections = mergeSectionsByMajorPatterns(normalized.sections, SAJU_MAJOR_SECTION_PATTERNS);

  return {
    rawText: normalized.rawText,
    sections: mergedSections.length > 0 ? mergedSections : normalized.sections,
  };
}

export function normalizeGunghapAiResult(value: unknown): ParsedGunghapResult {
  const normalized = parseAnalysisSections(value);
  const mergedSections = mergeSectionsByMajorPatterns(normalized.sections, GUNGHAP_MAJOR_SECTION_PATTERNS);
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
    sections: mergedSections.length > 0 ? mergedSections : normalized.sections,
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
