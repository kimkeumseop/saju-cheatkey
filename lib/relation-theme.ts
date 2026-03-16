// 관계 유형별 테마 상수
// DB에는 'couple' | 'some' | 'spouse' | 'ex-couple' | 'friend' | 'colleague' | 'idol' | 'etc' 형태로 저장

export interface RelationTheme {
  /** 점수 카드 배경 그라데이션 */
  gradient: string;
  /** 카드 상단 아이콘 */
  icon: string;
  /** 레이블 텍스트 (대문자) */
  label: string;
  /** 레이블 옆 이모지 */
  labelEmoji: string;
  /** "상위 N%" 뒤에 붙는 문구 */
  percentText: string;
  /** 포인트 컬러 (점수 숫자, 프로그레스 바 등) */
  color: string;
  /** 점수 → 상위 N% 변환 */
  topPercent: (score: number) => number;
}

const defaultTopPercent = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 80) return 15;
  if (score >= 70) return 30;
  if (score >= 60) return 50;
  if (score >= 50) return 70;
  return 90;
};

export const RELATION_THEMES: Record<string, RelationTheme> = {
  couple: {
    gradient: 'linear-gradient(135deg, #FFD6E0, #E8D5F5)',
    icon: '💗',
    label: 'SOULMATES',
    labelEmoji: '✨',
    percentText: '의 인연입니다',
    color: '#E91E8C',
    topPercent: defaultTopPercent,
  },
  some: {
    gradient: 'linear-gradient(135deg, #FFB5A7, #FFC8A2)',
    icon: '✨',
    label: 'CHEMISTRY',
    labelEmoji: '💫',
    percentText: '의 설렘입니다',
    color: '#FF6B6B',
    topPercent: defaultTopPercent,
  },
  spouse: {
    gradient: 'linear-gradient(135deg, #FFD6E0, #E8D5F5)',
    icon: '💍',
    label: 'SOULMATES',
    labelEmoji: '✨',
    percentText: '의 인연입니다',
    color: '#E91E8C',
    topPercent: defaultTopPercent,
  },
  'ex-couple': {
    gradient: 'linear-gradient(135deg, #D8D5F5, #C5B8E8)',
    icon: '🌙',
    label: 'PAST BOND',
    labelEmoji: '💫',
    percentText: '의 인연이었습니다',
    color: '#7B68EE',
    topPercent: defaultTopPercent,
  },
  friend: {
    gradient: 'linear-gradient(135deg, #B5EAD7, #C7F2FF)',
    icon: '🤝',
    label: 'BEST MATCH',
    labelEmoji: '🌿',
    percentText: '의 우정입니다',
    color: '#2ECC71',
    topPercent: defaultTopPercent,
  },
  colleague: {
    gradient: 'linear-gradient(135deg, #C9D6E3, #A8B8CC)',
    icon: '💼',
    label: 'SYNERGY',
    labelEmoji: '📈',
    percentText: '의 파트너입니다',
    color: '#2C3E6B',
    topPercent: defaultTopPercent,
  },
  idol: {
    gradient: 'linear-gradient(135deg, #FFF4B2, #FFD580)',
    icon: '⭐',
    label: 'FANDOM',
    labelEmoji: '🌟',
    percentText: '의 연결입니다',
    color: '#F39C12',
    topPercent: defaultTopPercent,
  },
  etc: {
    gradient: 'linear-gradient(135deg, #E0E0E0, #C8C8C8)',
    icon: '🔮',
    label: 'CONNECTION',
    labelEmoji: '🌀',
    percentText: '의 인연입니다',
    color: '#7F8C8D',
    topPercent: defaultTopPercent,
  },
};

// DB 저장 값(id 또는 한글 라벨) → 테마 키 정규화
export function normalizeRelation(raw: string | undefined | null): string {
  if (!raw) return 'etc';

  // 이미 유효한 키면 바로 반환
  if (RELATION_THEMES[raw]) return raw;

  // 한글 라벨 또는 슬래시 포함 구형 데이터 대응
  const labelMap: Record<string, string> = {
    '연인': 'couple',
    '썸남/썸녀': 'some',
    '썸남썸녀': 'some',
    '배우자': 'spouse',
    '전연인': 'ex-couple',
    '전여친 전남친': 'ex-couple',
    '친구': 'friend',
    '직장/사업': 'colleague',
    '직장사업': 'colleague',
    '직장 동료': 'colleague',
    '팬심/덕질': 'idol',
    '팬심덕질': 'idol',
    '아이돌과 팬': 'idol',
    '기타': 'etc',
  };

  return labelMap[raw] ?? 'etc';
}

// 관계 값으로 테마 객체를 가져오는 헬퍼
export function getRelationTheme(raw: string | undefined | null): RelationTheme {
  const key = normalizeRelation(raw);
  return RELATION_THEMES[key] ?? RELATION_THEMES.etc;
}
