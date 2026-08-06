import type { Metadata } from 'next';
import { MBTI_TYPES, type MbtiTypeCode } from '@/src/data/mbtiTypes';
import { MBTI_PROFILES } from '@/src/data/mbtiProfiles';
import { SITE_URL, SITE_NAME, SITE_TEAM, DEFAULT_OG_IMAGE } from '@/lib/site';
import MbtiResultClient from './MbtiResultClient';
import MbtiTypeArticle from './MbtiTypeArticle';

const MBTI_TYPE_CODES: MbtiTypeCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export function generateStaticParams() {
  return MBTI_TYPE_CODES.map((type) => ({ type: type.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type: rawType } = await params;
  const type = rawType.toUpperCase() as MbtiTypeCode;
  const typeInfo = MBTI_TYPES[type];

  if (!typeInfo) {
    return { title: 'MBTI 결과 | 사주 치트키' };
  }

  const title = `${type} ${typeInfo.name} MBTI 성격유형 완벽 분석 | 사주 치트키`;
  const description = `${type} ${typeInfo.name} 유형의 특징, 강점, 약점, 잘 맞는 MBTI 궁합까지 한 번에 확인하세요. ${typeInfo.desc}`;
  const url = `${SITE_URL}/mbti/result/${type.toLowerCase()}`;

  return {
    title,
    description,
    keywords: [`${type}`, `${type} 성격`, `${type} 특징`, 'MBTI 유형', 'MBTI 결과', `${typeInfo.name}`, 'MBTI 궁합'],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type: 'article',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${type} ${typeInfo.name} MBTI 결과` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function MbtiResultPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: rawType } = await params;
  const type = rawType.toUpperCase() as MbtiTypeCode;
  const typeInfo = MBTI_TYPES[type];
  const profile = MBTI_PROFILES[type];
  const url = `${SITE_URL}/mbti/result/${type.toLowerCase()}`;

  const jsonLd = typeInfo ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'MBTI 테스트', item: `${SITE_URL}/mbti` },
          { '@type': 'ListItem', position: 3, name: `${type} ${typeInfo.name}`, item: url },
        ],
      },
      ...(profile
        ? [
            {
              '@type': 'Article',
              '@id': `${url}#article`,
              headline: `${type} ${typeInfo.name} 성격유형 분석`,
              description: profile.headline,
              articleBody: [profile.headline, ...profile.overview, profile.work, profile.relationship, profile.growth, profile.sajuBridge].join('\n\n'),
              inLanguage: 'ko-KR',
              mainEntityOfPage: url,
              author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
              publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
              },
            },
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: profile.faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ]
        : []),
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <MbtiResultClient />
      {typeInfo && profile && (
        <MbtiTypeArticle type={type} typeInfo={typeInfo} profile={profile} author={SITE_TEAM} />
      )}
    </>
  );
}
