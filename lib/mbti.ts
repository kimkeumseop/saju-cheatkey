import { MBTI_QUESTIONS, type MbtiLetter } from '@/src/data/mbtiQuestions';

export type MbtiScores = Record<MbtiLetter, number>;

export type MbtiAiProfile = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  goodMatch: string;
  cautionMatch: string;
};

export const MBTI_RESULT_STORAGE_KEY = 'mbti_latest_result';

export const MBTI_DIMENSIONS = [
  { left: 'E', right: 'I', label: '에너지 방향' },
  { left: 'S', right: 'N', label: '정보 인식' },
  { left: 'T', right: 'F', label: '의사 결정' },
  { left: 'J', right: 'P', label: '생활 방식' },
] as const;

const OPPOSITE_LETTER: Record<MbtiLetter, MbtiLetter> = {
  E: 'I',
  I: 'E',
  S: 'N',
  N: 'S',
  T: 'F',
  F: 'T',
  J: 'P',
  P: 'J',
};

export function calculateMbtiResult(answers: Record<number, number>) {
  const totals: Record<MbtiLetter, number> = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  };

  MBTI_QUESTIONS.forEach((question) => {
    const selected = answers[question.id] ?? 2;
    const agreeScore = Math.max(0, Math.min(4, selected));
    const opposite = OPPOSITE_LETTER[question.agreesWith];

    totals[question.agreesWith] += agreeScore;
    totals[opposite] += 4 - agreeScore;
  });

  const scores: MbtiScores = {
    E: Math.round((totals.E / (totals.E + totals.I)) * 100),
    I: 0,
    S: Math.round((totals.S / (totals.S + totals.N)) * 100),
    N: 0,
    T: Math.round((totals.T / (totals.T + totals.F)) * 100),
    F: 0,
    J: Math.round((totals.J / (totals.J + totals.P)) * 100),
    P: 0,
  };

  scores.I = 100 - scores.E;
  scores.N = 100 - scores.S;
  scores.F = 100 - scores.T;
  scores.P = 100 - scores.J;

  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');

  return { type, scores };
}

export function getDefaultScoresForType(type: string): MbtiScores {
  const letters = type.toUpperCase().split('') as MbtiLetter[];
  const preferred = new Set(letters);

  const scores: MbtiScores = {
    E: preferred.has('E') ? 72 : 28,
    I: preferred.has('I') ? 72 : 28,
    S: preferred.has('S') ? 72 : 28,
    N: preferred.has('N') ? 72 : 28,
    T: preferred.has('T') ? 72 : 28,
    F: preferred.has('F') ? 72 : 28,
    J: preferred.has('J') ? 72 : 28,
    P: preferred.has('P') ? 72 : 28,
  };

  scores.I = 100 - scores.E;
  scores.N = 100 - scores.S;
  scores.F = 100 - scores.T;
  scores.P = 100 - scores.J;
  return scores;
}

export function buildMbtiFallbackProfile(type: string): MbtiAiProfile {
  const upper = type.toUpperCase();
  return {
    summary: `${upper}는 선호가 분명하고 일하는 리듬도 뚜렷한 편입니다. 강점을 잘 쓰면 몰입과 성과가 빠르게 올라가지만, 반대 성향의 방식도 함께 익히면 훨씬 더 균형 있게 성장할 수 있습니다.`,
    strengths: ['자기 성향이 비교적 분명하다.', '선호하는 방식에서 집중력이 높다.', '강점을 역할과 관계에 연결하기 쉽다.'],
    weaknesses: ['반대 성향의 방식이 피로하게 느껴질 수 있다.', '익숙한 패턴에 고정되면 시야가 좁아질 수 있다.', '상황에 따라 유연한 조정이 필요하다.'],
    goodMatch: 'ENFP',
    cautionMatch: 'ISTJ',
  };
}
