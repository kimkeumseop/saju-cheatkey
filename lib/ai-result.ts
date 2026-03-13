const SOFT_ERROR_MESSAGE = '운명의 흐름을 정리하는 중입니다. 다시 시도해주세요.';

type AnalysisSection = {
  title: string;
  content: string;
};

function cleanAiResponseText(value: string) {
  return value
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function tryParseJson(value: string) {
  const cleaned = cleanAiResponseText(value);
  const candidates = [cleaned];
  const jsonSlice = cleaned.match(/\{[\s\S]*\}/);

  if (jsonSlice && jsonSlice[0] !== cleaned) {
    candidates.push(jsonSlice[0]);
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeSections(sections: any[]): AnalysisSection[] {
  return sections
    .map((section, index) => ({
      title:
        typeof section?.title === 'string' && section.title.trim()
          ? section.title.trim()
          : `분석 ${index + 1}`,
      content:
        typeof section?.content === 'string' ? section.content.trim() : '',
    }))
    .filter((section) => section.content);
}

function sectionsFromLegacyObject(value: Record<string, any>) {
  return Object.keys(value)
    .filter((key) => /^section\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')))
    .map((key, index) => {
      const section = value[key];
      if (typeof section === 'string') {
        return { title: `분석 ${index + 1}`, content: section.trim() };
      }

      return {
        title:
          typeof section?.title === 'string' && section.title.trim()
            ? section.title.trim()
            : `분석 ${index + 1}`,
        content:
          typeof section?.content === 'string' ? section.content.trim() : '',
      };
    })
    .filter((section) => section.content);
}

function sectionsFromText(value: string): AnalysisSection[] {
  const cleaned = cleanAiResponseText(value);
  const chunks = cleaned
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return [{ title: '분석 준비 중', content: SOFT_ERROR_MESSAGE }];
  }

  return chunks.map((content, index) => ({
    title: `분석 ${index + 1}`,
    content,
  }));
}

function normalizeSectionsFromUnknown(value: unknown): AnalysisSection[] {
  if (Array.isArray(value)) {
    const sections = normalizeSections(value);
    if (sections.length > 0) return sections;
  }

  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed && typeof parsed === 'object') {
      return normalizeSectionsFromUnknown(parsed);
    }

    return sectionsFromText(value);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, any>;

    if (Array.isArray(record.sections)) {
      const sections = normalizeSections(record.sections);
      if (sections.length > 0) return sections;
    }

    const legacySections = sectionsFromLegacyObject(record);
    if (legacySections.length > 0) return legacySections;
  }

  return [{ title: '분석 준비 중', content: SOFT_ERROR_MESSAGE }];
}

export function normalizeSajuAiResult(value: unknown) {
  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed && typeof parsed === 'object') {
      return normalizeSajuAiResult(parsed);
    }
  }

  const record = value && typeof value === 'object' ? (value as Record<string, any>) : {};

  return {
    ...record,
    sections: normalizeSectionsFromUnknown(value),
  };
}

export function normalizeGunghapAiResult(value: unknown) {
  const parsed =
    typeof value === 'string'
      ? tryParseJson(value) ?? value
      : value;

  const record = parsed && typeof parsed === 'object' ? (parsed as Record<string, any>) : {};
  const sections = normalizeSectionsFromUnknown(parsed);
  const headline =
    typeof record.headline === 'string' && record.headline.trim()
      ? record.headline.trim()
      : sections[0]?.content || SOFT_ERROR_MESSAGE;

  return {
    ...record,
    compatibilityScore:
      typeof record.compatibilityScore === 'number' ? record.compatibilityScore : 0,
    headline,
    sections,
  };
}
