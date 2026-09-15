import type { Metadata } from "next";
import { guides } from "./guides";

export const SITE_URL = "https://saju-cheatkey.kr";
export const SITE_NAME = "사주 치트키";
export const SITE_TEAM = "사주 치트키 운영팀";
export const SITE_EMAIL = "sajucheatkey@gmail.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og`;

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
};

export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: MetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "article",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} 대표 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export type { GuideEntry } from "./guides";
export { guides };

export const guideMap = Object.fromEntries(guides.map((guide) => [guide.slug, guide]));

export type ColumnEntry = {
  id: string;
  title: string;
  description: string;
  date: string;
  dateModified?: string;
  readMinutes: number;
};

export const columns: ColumnEntry[] = [
  {
    id: "3",
    title: "2026년 병오년(丙午年), 뜨거운 불의 기운을 내 것으로 만드는 개운법 가이드",
    description:
      "위아래가 모두 불의 기운인 병오년의 의미와, 토·수 기운을 활용해 2026년의 강한 화기를 내 편으로 만드는 개운법을 정리했습니다.",
    date: "2026-01-05",
    dateModified: "2026-09-15",
    readMinutes: 8,
  },
  {
    id: "1",
    title: "명리학과 성격 검사는 어떻게 다를까 — 두 결과를 읽는 기준",
    description:
      "출생 정보를 해석하는 사주와 설문에 응답하는 성격 검사의 차이, 결과를 실제 경험과 비교하는 방법을 설명합니다.",
    date: "2026-02-10",
    dateModified: "2026-09-15",
    readMinutes: 8,
  },
  {
    id: "2",
    title: "운세에서 위로를 얻은 뒤, 실제 선택으로 이어가는 방법",
    description:
      "가상 이용 사례로 운세를 읽는 목적을 나누고, 공감한 문장과 실제 경험을 함께 기록하는 방법을 안내합니다.",
    date: "2026-02-24",
    dateModified: "2026-09-15",
    readMinutes: 8,
  },
  {
    id: "4",
    title: "나쁜 사주는 없다 — 단점도 강점이 되는 명리학의 시각",
    description:
      "칠살·상관·편중된 오행도 쓰임에 따라 강점이 되는 이유를 통해 '나쁜 사주'라는 통념을 다시 바라봅니다.",
    date: "2026-03-09",
    dateModified: "2026-09-15",
    readMinutes: 8,
  },
  {
    id: "5",
    title: "대운이 바뀌는 해, 무엇을 준비해야 하는가",
    description:
      "10년 단위로 흐르는 대운의 의미와 전환기에 나타나는 신호, 새 대운에 맞춰 삶을 재설계하는 법을 안내합니다.",
    date: "2026-03-23",
    readMinutes: 8,
  },
  {
    id: "6",
    title: "사주를 처음 봤는데 맞지 않는다고 느낄 때 — 해석의 층위에 대하여",
    description:
      "사주 해석이 나와 다르게 느껴지는 이유를 일간·일지·대운 등 해석의 여러 층위로 풀어 설명합니다.",
    date: "2026-04-06",
    readMinutes: 8,
  },
  {
    id: "7",
    title: "이직 타이밍, 사주로 어떻게 읽을까 — 직장인을 위한 명리학",
    description:
      "관성과 식상, 대운의 흐름을 통해 이직을 고민할 때 명리학이 실제로 참고가 되는 지점과 되지 않는 지점을 구분해 설명합니다.",
    date: "2026-04-20",
    readMinutes: 8,
  },
  {
    id: "8",
    title: "궁합에서 정말 봐야 하는 것 — 겉궁합과 속궁합의 차이",
    description:
      "띠 궁합 같은 겉궁합의 한계와, 일간의 관계·오행 보완·십성 구조로 읽는 속궁합의 실제 해석 포인트를 정리했습니다.",
    date: "2026-05-04",
    readMinutes: 8,
  },
  {
    id: "9",
    title: "신강과 신약 — 내 사주의 힘을 판단하는 첫 기준",
    description:
      "사주 해석의 출발점인 신강·신약 개념을 풀어 설명하고, 강한 사주와 약한 사주가 각각 어떤 방식으로 힘을 쓰는지 안내합니다.",
    date: "2026-05-18",
    readMinutes: 8,
  },
  {
    id: "10",
    title: "AI 사주 서비스는 어떻게 사주를 풀이할까 — 원리와 한계",
    description:
      "만세력 계산부터 AI 해석 생성까지, AI 사주 서비스가 작동하는 실제 과정과 전통 상담 대비 잘하는 것·못하는 것을 투명하게 설명합니다.",
    date: "2026-06-01",
    dateModified: "2026-09-15",
    readMinutes: 9,
  },
  {
    id: "11",
    title: "일주론 열풍, 어떻게 읽어야 할까 — 60일주를 보는 올바른 관점",
    description:
      "SNS에서 유행하는 일주론 콘텐츠의 매력과 한계를 짚고, 일주를 사주 전체 구조 안에서 읽는 방법을 안내합니다.",
    date: "2026-06-15",
    readMinutes: 7,
  },
  {
    id: "12",
    title: "2026년 하반기, 오행별로 준비하면 좋은 것들",
    description:
      "병오년 하반기의 기운 변화를 짚고, 내 사주에서 강한 오행과 약한 오행에 따라 하반기를 준비하는 실용적인 방법을 정리했습니다.",
    date: "2026-06-29",
    dateModified: "2026-09-15",
    readMinutes: 8,
  },
];

export const columnMap = Object.fromEntries(columns.map((column) => [column.id, column]));

export const faqEntries = [
  {
    question: "사주 치트키는 어떤 정보를 바탕으로 사주를 계산하나요?",
    answer:
      "기본적으로 이름, 생년월일, 출생시간, 양력/음력 여부, 성별 정보를 바탕으로 사주 원국을 계산합니다. 출생시간을 모를 경우에는 시간 미상 상태로 처리해 해석 범위를 보수적으로 안내합니다.",
  },
  {
    question: "출생시간을 모르면 결과를 볼 수 없나요?",
    answer:
      "아닙니다. 연, 월, 일만으로도 기본 성향과 큰 흐름은 확인할 수 있습니다. 다만 시주가 필요한 일부 세부 해석은 제외되거나 참고용 설명으로 제한될 수 있습니다.",
  },
  {
    question: "결과 내용은 절대적인 예언인가요?",
    answer:
      "아닙니다. 사주 치트키의 콘텐츠는 명리학적 해석을 바탕으로 한 참고용 정보입니다. 중요한 의사결정은 개인 상황과 객관적 정보, 필요한 경우 전문가 상담을 함께 고려하는 것이 좋습니다.",
  },
  {
    question: "결과는 어떻게 구성되나요?",
    answer:
      "먼저 사주 원국(명식 여덟 글자)과 오행 분포를 보여드리고, 그 근거 위에서 총운·성격·재물·직업·관계·건강 같은 항목별 해석이 이어집니다. 이어서 초년·중년·말년의 흐름과 올해의 운세를 함께 확인하실 수 있습니다. 근거가 되는 구조를 먼저 보여드리는 이유는 뒤따르는 설명이 어디서 나온 이야기인지 확인하며 읽으실 수 있도록 하기 위해서입니다. 모든 결과는 참고용 정보라는 원칙 안에서 제공됩니다.",
  },
  {
    question: "입력한 개인정보는 어떻게 처리되나요?",
    answer:
      "서비스 제공에 필요한 범위에서만 사용하며, 상세 기준은 개인정보처리방침에서 확인할 수 있습니다. 사주 분석과 관련된 입력 정보는 결과 생성 및 운영 지원 목적으로만 처리됩니다.",
  },
  {
    question: "문의는 어디로 하면 되나요?",
    answer:
      `서비스 이용, 정책, 오류 제보 관련 문의는 ${SITE_EMAIL} 로 보내주시면 확인 후 순차적으로 답변합니다. 결과가 이상하게 나온 경우에는 입력하신 생년월일시와 음력·양력 구분, 그리고 결과 페이지 주소를 함께 적어주시면 확인이 훨씬 빠릅니다. 개인정보 열람이나 삭제 요청도 같은 주소로 접수합니다.`,
  },
  {
    question: "사주 치트키는 누구를 위한 서비스인가요?",
    answer:
      "사주를 처음 접하는 이용자도 부담 없이 읽을 수 있도록 만든 서비스입니다. 명리학은 용어가 많아 입문 단계에서 막히는 경우가 흔합니다. 그래서 결과 화면에 명식과 오행 분포 같은 근거를 먼저 보여주고, 해석은 일상 언어로 풀어 쓰는 방식을 택했습니다. 용어가 낯설다면 사주 가이드에서 개념부터 확인하신 뒤 결과를 보시는 것을 권합니다.",
  },
  {
    question: "음력 생일과 양력 생일 중 어느 것을 입력해야 하나요?",
    answer:
      "어느 쪽이든 괜찮습니다. 입력하실 때 음력인지 양력인지만 정확히 선택해 주시면 됩니다. 사주는 음력도 양력도 아닌 절기력을 기준으로 계산하기 때문에, 어떤 달력으로 입력하시든 내부에서 절기 기준으로 변환합니다. 다만 음력 생일을 양력으로 잘못 선택하시면 월주가 통째로 바뀌어 전혀 다른 결과가 나오므로 이 부분만 확인해 주세요.",
  },
  {
    question: "생일이 2월 초인데 띠와 사주의 연주가 다르게 나옵니다.",
    answer:
      "정상입니다. 사주에서 한 해의 시작은 1월 1일이나 설날이 아니라 입춘입니다. 그래서 입춘 이전에 태어나신 분은 달력상의 해와 사주의 연주가 다를 수 있습니다. 같은 이유로 사주상의 띠도 달력상의 띠와 달라지는 경우가 있습니다.",
  },
  {
    question: "같은 생년월일시인데 다른 곳과 결과가 다릅니다. 왜 그런가요?",
    answer:
      "시간 보정과 날짜 경계 기준이 다르면 명식부터 달라질 수 있습니다. 이 서비스는 고정 30분 보정과 자정 기준의 일주 계산을 사용합니다. 같은 명식에서도 해석은 달라질 수 있습니다. 용신을 정하는 방식이나 강약을 판단하는 기준에 유파별 견해차가 있어 강조점이 달라지기 때문입니다. 여러 해석에서 공통으로 반복되는 부분에 무게를 두고 읽으시는 것이 현실적인 방법입니다. 다만 밤 11시에서 자정 사이 출생처럼 경계에 걸린 경우에는 명식 자체가 달라질 수 있으니 입력 정보를 한 번 확인해 보시는 것이 좋습니다.",
  },
  {
    question: "결과 해석은 AI가 만드나요?",
    answer:
      "네, 해석 문장 생성에는 AI를 사용합니다. 다만 AI가 생년월일만 받아 자유롭게 지어내는 방식이 아니라, 먼저 만세력 계산으로 명식과 오행 분포, 십신 배치를 확정한 뒤 그 데이터를 근거로 문장을 만드는 구조입니다. 결과 화면에 명식과 오행 정보를 함께 표시하는 것도 어떤 근거에서 나온 설명인지 확인하실 수 있도록 하기 위해서입니다.",
  },
  {
    question: "결과가 마음에 들지 않거나 나에게 맞지 않는 것 같습니다.",
    answer:
      "모든 문장이 맞아야 하는 것은 아닙니다. 사주 해석은 확정된 판정이 아니라 경향에 대한 설명이므로, 어긋나는 부분은 그대로 두셔도 됩니다. 다만 전반적으로 크게 어긋난다고 느끼신다면 입력하신 생년월일시와 음력·양력 구분을 먼저 확인해 보시는 것을 권합니다. 입력 정보가 어긋나면 결과 전체가 달라집니다.",
  },
  {
    question: "궁합 결과가 나쁘게 나오면 만나면 안 되나요?",
    answer:
      "그런 용도로 쓰시는 것은 권하지 않습니다. 궁합은 두 사람이 어느 지점에서 잘 맞고 어느 지점에서 마찰이 생기기 쉬운지를 보여주는 정보입니다. 같은 조합이라도 서로의 태도와 합의에 따라 결과가 크게 달라집니다. 점수보다 어떤 영역에서 어긋나기 쉬운지를 확인하고 대화의 재료로 쓰시는 편이 훨씬 유용합니다.",
  },
  {
    question: "건강이나 질병에 대한 내용도 볼 수 있나요?",
    answer:
      "건강 상태를 판정하는 서비스는 아닙니다. 전통적 상징을 실제 신체 기능이나 질병 위험과 연결하지 않으며, 일상 점검 질문과 해석의 한계를 안내합니다. 사주는 신체를 관찰하거나 검사하지 않으므로 질병을 진단하거나 예측할 수 없습니다. 증상이 있으시면 반드시 의료기관을 먼저 찾으시고, 사주 내용은 생활 습관을 점검하는 참고 자료로만 활용해 주세요.",
  },
  {
    question: "결과를 저장하거나 다시 볼 수 있나요?",
    answer:
      "로그인하신 상태에서 생성한 결과는 계정에 연결되어 다시 확인하실 수 있습니다. 결과 페이지 주소를 통해 다시 접근하실 수도 있습니다. 공유 시에는 생년월일시 같은 개인 정보가 함께 전달될 수 있으니 대상에 주의해 주세요.",
  },
];

export const footerLinks = {
  service: { href: "/about", label: "서비스 소개" },
  unse: { href: "/unse", label: "오늘의 운세" },
  guide: { href: "/guide", label: "사주 기초 가이드" },
  column: { href: "/column", label: "명리 칼럼" },
  faq: { href: "/faq", label: "FAQ" },
  contact: { href: "/contact", label: "문의하기" },
  privacy: { href: "/privacy", label: "개인정보처리방침" },
  terms: { href: "/terms", label: "이용약관" },
};
