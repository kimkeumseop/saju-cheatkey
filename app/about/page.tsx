import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';
import { createMetadata, SITE_EMAIL, SITE_NAME, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '서비스 소개',
  description: '사주 치트키가 어떤 방식으로 사주 기초 콘텐츠와 해석 참고 정보를 제공하는지 소개합니다.',
  path: '/about',
  keywords: ['사주 치트키 소개', '서비스 소개', '사주 콘텐츠', '명리학 가이드'],
});

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
        <header className="rounded-[3rem] p-8 md:p-12 space-y-4" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.14)', boxShadow: '0 8px 40px rgba(212,104,138,0.06)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(212,104,138,0.7)' }}>About</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{SITE_NAME} 소개</h1>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
            {SITE_NAME}는 사주 결과만 빠르게 보여주는 페이지에서 그치지 않고, 초보자도 이해할 수 있는 기초 설명과 함께 해석을 읽을 수 있도록 구성한 사주 안내 서비스입니다.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[2rem] p-6 md:p-8 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
            <h2 className="text-xl font-bold text-[#2D1B1E]">무엇을 제공하나요</h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
              사주 기초 개념, 오행과 천간지지 설명, 운세 해석 참고 가이드, 자주 묻는 질문, 개인정보 및 이용 정책을 함께 제공합니다. 결과를 읽는 과정에서 생기는 질문도 내부 링크를 통해 바로 확인할 수 있습니다.
            </p>
          </article>
          <article className="rounded-[2rem] p-6 md:p-8 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
            <h2 className="text-xl font-bold text-[#2D1B1E]">어떤 톤을 지향하나요</h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
              과장된 예언이나 자극적인 표현보다, 참고용 정보와 자기 이해를 돕는 설명형 톤을 지향합니다. 사주를 처음 접하는 이용자도 부담 없이 읽을 수 있게 용어를 풀어쓰는 방식을 우선합니다.
            </p>
          </article>
          <article className="rounded-[2rem] p-6 md:p-8 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
            <h2 className="text-xl font-bold text-[#2D1B1E]">운영 정보</h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
              운영 주체는 {SITE_TEAM}이며, 사이트 전반의 콘텐츠와 정책 문서는 동일한 기준으로 관리합니다. 문의와 정책 관련 안내는 전용 페이지와 푸터 링크에서 확인할 수 있습니다.
            </p>
          </article>
          <article className="rounded-[2rem] p-6 md:p-8 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
            <h2 className="text-xl font-bold text-[#2D1B1E]">문의 및 확인</h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
              서비스 이용 중 오류, 정책 문의, 콘텐츠 관련 의견은 {SITE_EMAIL} 로 보낼 수 있습니다. 기본 질문은 FAQ를 먼저 확인하면 빠르게 해결할 수 있습니다.
            </p>
          </article>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,111,214,0.12), rgba(255,255,255,0.85) 60%)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>함께 읽으면 좋은 페이지</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/guide/what-is-saju" className="px-4 py-2 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #d4688a, #c2255c)' }}>
              사주란 무엇인가
            </Link>
            <Link href="/faq" className="px-4 py-2 rounded-full font-bold" style={{ background: 'rgba(45,27,30,0.08)', border: '1px solid rgba(124,111,214,0.2)', color: 'rgba(45,27,30,0.82)' }}>
              FAQ
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full font-bold" style={{ background: 'rgba(45,27,30,0.08)', border: '1px solid rgba(124,111,214,0.2)', color: 'rgba(45,27,30,0.82)' }}>
              문의하기
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
