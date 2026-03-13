import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, SITE_EMAIL, SITE_NAME, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '이용약관',
  description: '사주 치트키 서비스 이용약관입니다. 서비스 범위, 책임 한계, 이용자 의무, 분쟁 해결 기준을 안내합니다.',
  path: '/terms',
  keywords: ['사주 치트키 이용약관', '서비스 약관', '책임 한계', '사주 서비스 정책'],
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 px-4 md:px-6">
      <AdSenseScript />
      <Navbar />

      <article className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-4">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Terms of Service</p>
          <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
          <p className="text-gray-600 leading-8 break-keep">
            본 약관은 {SITE_TEAM}(이하 "회사")가 제공하는 {SITE_NAME} 서비스의 이용과 관련한 기본 사항을 규정합니다.
          </p>
        </header>

        <section className="space-y-5 text-gray-700 leading-8">
          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">제 1 조 (목적)</h2>
            <p>
              본 약관은 회사가 제공하는 사주 기초 콘텐츠, 사주 분석 결과, 운세 참고 정보 및 관련 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 정함을 목적으로 합니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">제 2 조 (서비스의 내용)</h2>
            <p>
              회사는 사주 계산 결과, 명리학 설명형 콘텐츠, 운세 참고 자료, FAQ 및 정책 안내를 제공합니다. 서비스의 세부 구성은 운영상 필요에 따라 조정될 수 있습니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">제 3 조 (이용자의 의무)</h2>
            <p>
              이용자는 서비스를 이용하면서 타인의 정보를 무단으로 사용하거나, 허위 정보를 입력하거나, 회사 및 제3자의 권리를 침해하는 행위를 해서는 안 됩니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">제 4 조 (책임의 한계)</h2>
            <p>
              회사가 제공하는 사주 및 운세 관련 콘텐츠는 명리학 해석을 바탕으로 한 참고용 정보입니다. 투자, 결혼, 건강, 직업 등 중요한 의사결정은 이용자 본인의 판단과 별도의 객관적 정보에 따라 이루어져야 합니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">제 5 조 (개인정보보호 및 문의)</h2>
            <p>
              회사는 개인정보처리방침을 통해 개인정보 처리 기준을 안내합니다. 이용약관이나 서비스 이용과 관련한 문의는 {SITE_EMAIL} 로 접수할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-black text-primary-700">
              <Link href="/privacy" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                문의하기
              </Link>
              <Link href="/about" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                서비스 소개
              </Link>
            </div>
          </section>
        </section>

        <div className="p-6 bg-white rounded-2xl border border-pink-50 text-sm text-gray-500">
          <p>공고일자: 2026년 3월 13일</p>
          <p>시행일자: 2026년 3월 13일</p>
        </div>
      </article>

      <Footer />
    </main>
  );
}
