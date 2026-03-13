'use client';

const SOFT_ERROR_MESSAGE = '운명의 흐름을 정리하는 중입니다. 다시 시도해주세요.';

type AnalysisSection = {
  title: string;
  content: string;
};

function toPlainText(value: unknown) {
  if (typeof value === 'string') return value.trim();

  if (value && typeof value === 'object') {
    const record = value as Record<string, any>;

    if (Array.isArray(record.sections)) {
      return record.sections
        .map((section) => {
          const title = typeof section?.title === 'string' ? section.title.trim() : '';
          const content = typeof section?.content === 'string' ? section.content.trim() : '';
          return title && content ? `### ${title}\n${content}` : '';
        })
        .filter(Boolean)
        .join('\n\n');
    }

    return Object.values(record)
      .filter((item) => typeof item === 'string' && item.trim())
      .join('\n\n')
      .trim();
  }

  return '';
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

  return sections.filter((section) => section.content) || [
    { title: '분석 준비 중', content: SOFT_ERROR_MESSAGE },
  ];
}

export function normalizeSajuAiResult(value: unknown) {
  const text = toPlainText(value);

  return {
    rawText: text,
    sections: splitMarkdownSections(text),
  };
}

export function normalizeGunghapAiResult(value: unknown) {
  const text = toPlainText(value);
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const scoreLine = lines.find((line) => /점/.test(line));
  const headlineLine = lines.find((line) => !line.startsWith('###') && !/점/.test(line));
  const scoreMatch = scoreLine?.match(/(\d{1,3})\s*점/);
  const sections = splitMarkdownSections(text);

  return {
    rawText: text,
    compatibilityScore: scoreMatch ? Math.min(100, Number(scoreMatch[1])) : 80,
    headline: headlineLine || sections[0]?.content || SOFT_ERROR_MESSAGE,
    sections,
  };
}
