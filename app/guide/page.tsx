import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, guides } from '@/lib/site';

export const metadata = createMetadata({
  title: '사주 기초 가이드 전체 목록 — 사주 치트키',
  description:
    '사주·오행·천간지지·십신·대운 등 명리학 기초부터 운세 해석까지, 26편의 단계별 가이드를 무료로 읽어보세요.',
  path: '/guide',
  keywords: ['사주 가이드', '명리학 기초', '오행 설명', '천간 지지', '십신이란', '대운이란', '사주 초보'],
});

const CATEGORIES = [
  {
    label: '기초 개념',
    description: '사주·오행·천간지지를 처음 접하는 분을 위한 필수 개념',
    accent: '#ff6eb4',
    slugs: [
      'what-is-saju',
      'heavenly-stems-earthly-branches',
      'five-elements',
      'what-is-ilju',
      'what-is-sipsin',
      'what-is-yongshin',
      'what-is-daeun',
      'lunar-solar-calendar',
    ],
  },
  {
    label: '운세 읽기',
    description: '재물·연애·직업·건강 등 삶의 영역별 운세 해석법',
    accent: '#9d8fff',
    slugs: [
      'how-to-read-yearly-fortune',
      'wealth-in-saju',
      'love-marriage-in-saju',
      'gunghap-guide',
      'career-in-saju',
      'health-in-saju',
      'reading-2026-fortune',
    ],
  },
  {
    label: '일간별 성향',
    description: '천간 일간에 따른 기질과 에너지 패턴 분석',
    accent: '#00e5a0',
    slugs: ['ilgan-gap-wood', 'ilgan-byeong-fire', 'ilgan-gyeong-metal'],
  },
  {
    label: '심화 & 비교',
    description: '오해 바로잡기, MBTI 비교, 타로 연결 등 확장 주제',
    accent: '#ff4da6',
    slugs: [
      'common-misunderstandings',
      'birth-time-unknown',
      'zodiac-traits',
      'saju-vs-mbti',
      'sipsin-siksin-sanggwan',
      'sipsin-pyeonggwan-jeonggwan',
      'saju-and-tarot',
      'saju-beginners',
    ],
  },
];

const guideMap = Object.fromEntries(guides.map((g) => [g.slug, g]));

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32">
      <AdSenseScript />
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 space-y-16">
        {/* Header */}
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-5">
          <p className="text-pink-400 text-xs font-black tracking-[0.25em] uppercase">Reading Library</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight break-keep">
            사주 기초 가이드
          </h1>
          <p className="text-gray-600 leading-relaxed break-keep text-base md:text-lg max-w-2xl">
            사주를 처음 접하는 분도 쉽게 읽을 수 있도록 명리학의 기본 개념부터 운세 해석 방법까지 26편으로 정리했습니다. 결과를 더 잘 이해하고 싶을 때, 관심 주제부터 골라 읽어보세요.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors"
            >
              홈으로
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 rounded-full text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors"
            >
              자주 묻는 질문
            </Link>
          </div>
        </header>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const catGuides = cat.slugs.map((s) => guideMap[s]).filter(Boolean);
          if (catGuides.length === 0) return null;
          return (
            <section key={cat.label} className="space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className="mt-1 h-6 w-1.5 rounded-full shrink-0"
                  style={{ background: cat.accent }}
                />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{cat.label}</h2>
                  <p className="mt-1 text-sm text-gray-500 break-keep">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {catGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guide/${guide.slug}`}
                    className="group bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3"
                  >
                    <h3 className="text-lg font-black text-gray-900 break-keep group-hover:text-pink-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-7 break-keep">{guide.description}</p>
                    <p
                      className="text-xs font-black flex items-center gap-1"
                      style={{ color: cat.accent }}
                    >
                      읽어보기
                      <svg
                        className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-12 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            가이드를 읽었다면, 이제 나의 사주를 봐요
          </h2>
          <p className="text-white/60 text-base leading-8 break-keep">
            생년월일시를 입력하면 오행 분포와 일주를 기반으로 한 맞춤 해석을 바로 확인할 수 있습니다.
          </p>
          <Link
            href="/saju"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-900/30 hover:scale-[1.02] transition-transform"
          >
            무료 사주 분석 시작하기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
