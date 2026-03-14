import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '2026년 무료 사주 & 궁합 치트키 | 내 운명 완벽 해설',
  description:
    '어려운 명리학은 그만! 2026년 무료 사주, 토정비결, 운명 궁합을 현대적으로 풀어낸 프리미엄 비밀 리포트로 만나보세요. 내 사주 치트키로 숨겨진 재물운과 연애운의 흐름을 정확하게 확인하세요.',
  path: '/',
  keywords: ['2026년 무료 사주', '무료 토정비결', '사주 치트키', '사주팔자', '명리학', '궁합', '연애운', '재물운', '무료 운세', '운명 테스트'],
});

export default function Page() {
  return <HomePage />;
}
