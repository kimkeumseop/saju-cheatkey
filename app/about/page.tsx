import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, SITE_EMAIL, SITE_NAME, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '서비스 소개',
  description: '사주 치트키가 어떤 방식으로 사주 기초 콘텐츠와 해석 참고 정보를 제공하는지 소개합니다.',
  path: '/about',
  keywords: ['사주 치트키 소개', '서비스 소개', '사주 콘텐츠', '명리학 가이드'],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32">
      <AdSenseScript />
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-4">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">About</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{SITE_NAME} 소개</h1>
          <p className="text-gray-600 leading-8 break-keep">
            {SITE_NAME}는 사주 결과만 빠르게 보여주는 페이지에서 그치지 않고, 초보자도 이해할 수 있는 기초 설명과 함께 해석을 읽을 수 있도록 구성한 사주 안내 서비스입니다.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-black text-primary-900">무엇을 제공하나요</h2>
            <p className="text-gray-600 leading-8 break-keep">
              사주 기초 개념, 오행과 천간지지 설명, 운세 해석 참고 가이드, 자주 묻는 질문, 개인정보 및 이용 정책을 함께 제공합니다. 결과를 읽는 과정에서 생기는 질문도 내부 링크를 통해 바로 확인할 수 있습니다.
            </p>
          </article>
          <article className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-black text-primary-900">어떤 톤을 지향하나요</h2>
            <p className="text-gray-600 leading-8 break-keep">
              과장된 예언이나 자극적인 표현보다, 참고용 정보와 자기 이해를 돕는 설명형 톤을 지향합니다. 사주를 처음 접하는 이용자도 부담 없이 읽을 수 있게 용어를 풀어쓰는 방식을 우선합니다.
            </p>
          </article>
          <article className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-black text-primary-900">운영 정보</h2>
            <p className="text-gray-600 leading-8 break-keep">
              운영 주체는 {SITE_TEAM}이며, 사이트 전반의 콘텐츠와 정책 문서는 동일한 기준으로 관리합니다. 문의와 정책 관련 안내는 전용 페이지와 푸터 링크에서 확인할 수 있습니다.
            </p>
          </article>
          <article className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-black text-primary-900">문의 및 확인</h2>
            <p className="text-gray-600 leading-8 break-keep">
              서비스 이용 중 오류, 정책 문의, 콘텐츠 관련 의견은 {SITE_EMAIL} 로 보낼 수 있습니다. 기본 질문은 FAQ를 먼저 확인하면 빠르게 해결할 수 있습니다.
            </p>
          </article>
        </section>

        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-10 text-white space-y-4">
          <h2 className="text-2xl font-black">함께 읽으면 좋은 페이지</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/guide/what-is-saju" className="px-4 py-2 rounded-full bg-white text-primary-900 font-black">
              사주란 무엇인가
            </Link>
            <Link href="/faq" className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-black">
              FAQ
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-black">
              문의하기
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
