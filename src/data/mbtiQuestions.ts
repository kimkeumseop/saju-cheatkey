export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type MbtiQuestion = {
  id: number;
  axis: MbtiAxis;
  agreesWith: MbtiLetter;
  statement: string;
};

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // ── EI ──────────────────────────────────────────────────────
  {
    id: 1,
    axis: 'EI',
    agreesWith: 'E',
    statement: '퇴근 후 친구에게서 "오늘 즉석 모임 있는데 올래? 처음 보는 사람들도 있어"라는 연락이 왔다. 나는 설레는 마음에 바로 가겠다고 한다.',
  },
  {
    id: 2,
    axis: 'EI',
    agreesWith: 'I',
    statement: '며칠 동안 사람들과 계속 만나는 일정이 이어졌다. 마지막 약속을 마치고 집에 돌아온 순간, 이제야 진짜 쉬는 기분이 든다.',
  },
  {
    id: 3,
    axis: 'EI',
    agreesWith: 'E',
    statement: '머릿속에서 아무리 생각해도 고민이 잘 안 풀린다. 결국 누군가에게 말하기 시작하면서 정리가 되는 편이다.',
  },
  {
    id: 4,
    axis: 'EI',
    agreesWith: 'I',
    statement: '처음 가는 모임에 도착했다. 아는 얼굴이 한 명도 없다. 나는 일단 분위기를 파악하며 조용히 있다가 천천히 섞이는 편이다.',
  },
  {
    id: 5,
    axis: 'EI',
    agreesWith: 'E',
    statement: '일요일 오후, 딱히 계획이 없다. 친구에게서 "지금 나올 수 있어?"라는 메시지가 왔다. 크게 고민하지 않고 나간다.',
  },

  // ── SN ──────────────────────────────────────────────────────
  {
    id: 6,
    axis: 'SN',
    agreesWith: 'S',
    statement: '팀에서 새 프로젝트를 시작하며 아이디어를 먼저 모으자는 의견이 나왔다. 나는 아이디어보다 구체적인 실행 단계부터 정하고 싶다.',
  },
  {
    id: 7,
    axis: 'SN',
    agreesWith: 'N',
    statement: '"이걸 어떻게 할까요?"라는 질문을 받았을 때, 현실적인 조건보다 "이렇게 하면 어떨까"하는 새로운 가능성이 머릿속에 먼저 펼쳐진다.',
  },
  {
    id: 8,
    axis: 'SN',
    agreesWith: 'S',
    statement: '새로운 방식을 써볼까 고민 중인데 기존 방식도 잘 작동하고 있다. 검증된 방법이라면 굳이 바꿀 필요를 느끼지 못한다.',
  },
  {
    id: 9,
    axis: 'SN',
    agreesWith: 'N',
    statement: '대화 중 상대방이 "요즘 좀 힘들어"라고 툭 말했다. 나는 그 말 뒤에 숨어 있는 감정이나 맥락이 더 신경 쓰인다.',
  },
  {
    id: 10,
    axis: 'SN',
    agreesWith: 'S',
    statement: '새로운 개념을 배울 때, 이론이나 원리보다 실제 사례나 예시가 있어야 이해가 빠르게 된다.',
  },

  // ── TF ──────────────────────────────────────────────────────
  {
    id: 11,
    axis: 'TF',
    agreesWith: 'T',
    statement: '팀에서 의견이 갈려 결정을 내려야 하는 상황이다. 각자의 감정보다 어떤 선택이 논리적으로 더 맞는지를 기준으로 판단한다.',
  },
  {
    id: 12,
    axis: 'TF',
    agreesWith: 'F',
    statement: '친구가 실수를 했고 나는 그 결과를 알고 있다. 원칙대로 말하기 전에 먼저 친구의 상황과 마음이 어떤지 이해하고 싶다.',
  },
  {
    id: 13,
    axis: 'TF',
    agreesWith: 'T',
    statement: '동료의 결과물에 분명한 문제가 있다. 그 사람이 꽤 공들인 것 같아도, 정확하게 짚어주는 게 결국 더 도움이 된다고 생각한다.',
  },
  {
    id: 14,
    axis: 'TF',
    agreesWith: 'F',
    statement: '회의에서 내가 보기에 맞는 말인데 분위기가 굳을 것 같다. 맞는 말이라도 표현 방식을 더 부드럽게 다듬게 된다.',
  },
  {
    id: 15,
    axis: 'TF',
    agreesWith: 'T',
    statement: '갑자기 예상 못 한 문제가 터졌다. 당황스럽지만 일단 원인부터 파악하고, 감정은 나중에 추스르는 편이다.',
  },

  // ── JP ──────────────────────────────────────────────────────
  {
    id: 16,
    axis: 'JP',
    agreesWith: 'J',
    statement: '오늘 해야 할 일이 여러 개 있다. 자연스럽게 목록을 만들고 하나씩 체크하면서 진행한다.',
  },
  {
    id: 17,
    axis: 'JP',
    agreesWith: 'P',
    statement: '여행 계획을 세우는데 숙소와 일정을 전부 미리 잡자는 의견이 나왔다. 나는 대략적인 방향만 잡고 현지에서 유연하게 움직이는 게 더 편하다.',
  },
  {
    id: 18,
    axis: 'JP',
    agreesWith: 'J',
    statement: '마감이 일주일 남은 과제가 있다. 미리 끝내두지 않으면 다른 일을 할 때도 마음 한켠이 불편하다.',
  },
  {
    id: 19,
    axis: 'JP',
    agreesWith: 'P',
    statement: '아침에 오늘 하루 일정이 빼곡하게 짜인 계획표를 받았다. 일정 자체보다 그 촘촘함에서 답답함이 먼저 든다.',
  },
  {
    id: 20,
    axis: 'JP',
    agreesWith: 'J',
    statement: '중요한 약속이나 행사가 있다. 즉흥으로 흘러가기보다 미리 정해진 흐름대로 진행되는 쪽이 훨씬 편하고 안심이 된다.',
  },
];
