import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '무료 사주 · 타로 · MBTI · 궁합 | 사주 치트키',
  description:
    '생년월일로 무료 사주, AI 타로 카드, MBTI 성격유형 테스트, 궁합까지 한 번에 확인하세요. 2026년 운세를 쉽고 빠르게 알아보는 사주 치트키.',
  path: '/',
  keywords: ['무료 사주', '무료 타로', 'MBTI 테스트', '무료 궁합', '사주 치트키', '2026년 운세', '사주팔자', '타로 카드', 'MBTI 성격유형', '무료 운세'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://saju-cheatkey.kr/#website',
      url: 'https://saju-cheatkey.kr',
      name: '사주 치트키',
      description: '무료 사주, AI 타로 카드, MBTI 테스트, 궁합을 한 번에 제공하는 서비스',
      inLanguage: 'ko',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://saju-cheatkey.kr/faq' },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://saju-cheatkey.kr/#webapp',
      name: '사주 치트키',
      url: 'https://saju-cheatkey.kr',
      description: '생년월일로 무료 사주, AI 타로 카드, MBTI 성격유형 테스트, 궁합까지 한 번에 확인하세요.',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://saju-cheatkey.kr' },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePage />
    </>
  );
}
