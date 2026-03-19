export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type MbtiQuestion = {
  id: number;
  axis: MbtiAxis;
  agreesWith: MbtiLetter;
  statement: string;
};

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  { id: 1, axis: 'EI', agreesWith: 'E', statement: '파티에서 새로운 사람을 만나면 에너지가 생긴다.' },
  { id: 2, axis: 'EI', agreesWith: 'I', statement: '혼자 있는 시간이 충분해야 다시 집중할 수 있다.' },
  { id: 3, axis: 'EI', agreesWith: 'E', statement: '생각을 정리할 때 혼자 고민하기보다 말하면서 풀리는 편이다.' },
  { id: 4, axis: 'EI', agreesWith: 'I', statement: '처음 보는 사람들 사이에서는 먼저 분위기를 읽는 편이다.' },
  { id: 5, axis: 'EI', agreesWith: 'E', statement: '즉석 모임 제안을 받으면 일단 가보고 싶어진다.' },
  { id: 6, axis: 'SN', agreesWith: 'S', statement: '계획을 세울 때 구체적인 단계를 좋아한다.' },
  { id: 7, axis: 'SN', agreesWith: 'N', statement: '현실적인 조건보다 가능성과 아이디어가 더 먼저 보인다.' },
  { id: 8, axis: 'SN', agreesWith: 'S', statement: '익숙한 방식이라도 검증된 방법이면 안심이 된다.' },
  { id: 9, axis: 'SN', agreesWith: 'N', statement: '대화할 때 사실 자체보다 숨은 의미나 맥락이 더 흥미롭다.' },
  { id: 10, axis: 'SN', agreesWith: 'S', statement: '설명을 들을 때 예시와 실제 사례가 있어야 이해가 빠르다.' },
  { id: 11, axis: 'TF', agreesWith: 'T', statement: '결정할 때 감정보다 논리를 우선한다.' },
  { id: 12, axis: 'TF', agreesWith: 'F', statement: '누군가의 입장을 생각하면 원칙보다 배려가 먼저 떠오른다.' },
  { id: 13, axis: 'TF', agreesWith: 'T', statement: '피드백을 줄 때 솔직하고 명확한 표현이 더 도움이 된다고 본다.' },
  { id: 14, axis: 'TF', agreesWith: 'F', statement: '팀 분위기가 상할 수 있다면 표현 방식을 더 부드럽게 조정한다.' },
  { id: 15, axis: 'TF', agreesWith: 'T', statement: '문제가 생기면 원인 분석부터 하고 감정 정리는 나중에 한다.' },
  { id: 16, axis: 'JP', agreesWith: 'J', statement: '할 일 목록을 만들고 체크하는 걸 좋아한다.' },
  { id: 17, axis: 'JP', agreesWith: 'P', statement: '계획은 있어도 상황에 따라 유연하게 바꾸는 편이 편하다.' },
  { id: 18, axis: 'JP', agreesWith: 'J', statement: '마감이 다가오기 전에 미리 끝내두면 마음이 편하다.' },
  { id: 19, axis: 'JP', agreesWith: 'P', statement: '너무 촘촘한 일정표를 보면 답답함부터 느껴진다.' },
  { id: 20, axis: 'JP', agreesWith: 'J', statement: '중요한 일정은 즉흥보다 정해진 흐름대로 진행되는 것이 좋다.' },
];
