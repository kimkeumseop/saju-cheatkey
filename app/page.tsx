import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '사주 정보와 해석 가이드',
  description:
    '사주란 무엇인지, 천간과 지지, 오행, 운세 읽는 법까지 함께 살펴볼 수 있는 사주 치트키 홈입니다.',
  path: '/',
  keywords: ['사주란 무엇인가', '천간 지지', '오행', '운세 해석', '사주 가이드'],
});

export default function Page() {
  return <HomePage />;
}
