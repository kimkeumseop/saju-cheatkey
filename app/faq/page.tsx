import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, faqEntries, SITE_EMAIL } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '자주 묻는 질문 FAQ | 사주 치트키',
  description: '사주 치트키 이용 전 자주 묻는 질문 모음. 사주 계산 기준, 출생시간 없을 때 이용 방법, 결과 해석 방식, 개인정보 처리, 문의 방법을 확인하세요.',
  path: '/faq',
  keywords: ['사주 치트키 FAQ', '사주 자주 묻는 질문', '출생시간 모름', '사주 해석 기준', '사주 개인정보'],
});

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://saju-cheatkey.kr' },
        { '@type': 'ListItem', position: 2, name: '자주 묻는 질문', item: 'https://saju-cheatkey.kr/faq' },
      ],
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32">
      <AdSenseScript />
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-4">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">FAQ</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">자주 묻는 질문</h1>
          <p className="text-gray-600 leading-relaxed break-keep">
            서비스 이용 전 많이 확인하는 질문을 먼저 정리했습니다. 더 구체적인 문의가 필요하면 아래 안내된 이메일로 연락할 수 있습니다.
          </p>
        </header>

        <section className="space-y-4">
          {faqEntries.map((entry, index) => (
            <article key={entry.question} className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
              <p className="text-primary-500 text-xs font-black tracking-[0.2em] uppercase">Q{index + 1}</p>
              <h2 className="text-xl font-black text-primary-900 break-keep">{entry.question}</h2>
              <p className="text-gray-600 leading-8 break-keep">{entry.answer}</p>
            </article>
          ))}
        </section>

        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-10 text-white space-y-4">
          <h2 className="text-2xl font-black">추가 문의 안내</h2>
          <p className="text-white/80 leading-8 break-keep">
            FAQ에서 해결되지 않는 문의는 {SITE_EMAIL} 로 보내주시면 확인 후 순차적으로 답변합니다. 개인정보, 결제, 서비스 이용 관련 문의는 가능한 한 구체적으로 적어주시면 확인이 빨라집니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="px-4 py-2 rounded-full bg-white text-primary-900 font-black">
              문의하기
            </Link>
            <Link href="/privacy" className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-black">
              개인정보처리방침
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
    </>
  );
}
