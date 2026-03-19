export type MbtiTypeCode =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

export type MbtiTypeInfo = {
  code: MbtiTypeCode;
  name: string;
  emoji: string;
  desc: string;
  color: string;
};

export const MBTI_TYPES: Record<MbtiTypeCode, MbtiTypeInfo> = {
  INTJ: { code: 'INTJ', name: '전략가', emoji: '🏰', desc: '멀리 보고 구조를 설계하며, 독립적으로 큰 그림을 완성해 가는 타입입니다.', color: '#0F766E' },
  INTP: { code: 'INTP', name: '논리술사', emoji: '🔬', desc: '아이디어를 해부하듯 탐구하고, 개념과 원리를 깊게 파고드는 타입입니다.', color: '#0D9488' },
  ENTJ: { code: 'ENTJ', name: '통솔자', emoji: '👑', desc: '목표를 선명하게 세우고, 사람과 자원을 움직여 결과를 만드는 타입입니다.', color: '#047857' },
  ENTP: { code: 'ENTP', name: '변론가', emoji: '⚡', desc: '새로운 가능성을 빠르게 포착하고, 토론과 실험으로 판을 바꾸는 타입입니다.', color: '#10B981' },
  INFJ: { code: 'INFJ', name: '옹호자', emoji: '🕊️', desc: '사람의 마음과 방향성을 함께 읽으며, 의미 있는 변화를 추구하는 타입입니다.', color: '#059669' },
  INFP: { code: 'INFP', name: '중재자', emoji: '🌿', desc: '진심과 가치관을 지키며, 자신만의 감수성으로 세상을 해석하는 타입입니다.', color: '#34D399' },
  ENFJ: { code: 'ENFJ', name: '선도자', emoji: '🌞', desc: '사람을 북돋우고 연결하며, 함께 성장하는 흐름을 만드는 타입입니다.', color: '#14B8A6' },
  ENFP: { code: 'ENFP', name: '활동가', emoji: '🎈', desc: '호기심과 열정으로 주변을 밝히고, 새로운 경험에 생기를 불어넣는 타입입니다.', color: '#2DD4BF' },
  ISTJ: { code: 'ISTJ', name: '현실주의자', emoji: '📚', desc: '기준과 책임을 중시하며, 안정적으로 일을 끝까지 완수하는 타입입니다.', color: '#0F766E' },
  ISFJ: { code: 'ISFJ', name: '수호자', emoji: '🛡️', desc: '세심하게 사람을 챙기고, 익숙한 관계와 질서를 든든하게 지키는 타입입니다.', color: '#0EA5A4' },
  ESTJ: { code: 'ESTJ', name: '경영자', emoji: '📈', desc: '명확한 기준과 실행력으로 조직과 일정을 정리해 나가는 타입입니다.', color: '#16A34A' },
  ESFJ: { code: 'ESFJ', name: '집정관', emoji: '🤝', desc: '관계의 온도를 살피며, 모두가 편안한 분위기를 만드는 데 강한 타입입니다.', color: '#22C55E' },
  ISTP: { code: 'ISTP', name: '장인', emoji: '🛠️', desc: '차분하게 상황을 파악하고, 필요한 해결책을 손에 잡히게 만드는 타입입니다.', color: '#0891B2' },
  ISFP: { code: 'ISFP', name: '모험가', emoji: '🎨', desc: '부드러운 감수성과 자유로운 표현으로 자신만의 리듬을 만드는 타입입니다.', color: '#06B6D4' },
  ESTP: { code: 'ESTP', name: '사업가', emoji: '🏎️', desc: '순간의 기회를 재빠르게 잡고, 행동으로 흐름을 만드는 타입입니다.', color: '#22C55E' },
  ESFP: { code: 'ESFP', name: '연예인', emoji: '🎤', desc: '즉흥성과 친화력으로 분위기를 살리고, 사람들과 에너지를 나누는 타입입니다.', color: '#4ADE80' },
};

export const MBTI_TYPE_CODES = Object.keys(MBTI_TYPES) as MbtiTypeCode[];
