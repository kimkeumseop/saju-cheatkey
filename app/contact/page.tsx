import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
import { createMetadata, SITE_EMAIL, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '문의하기',
  description: '사주 치트키 운영팀의 문의 안내 페이지입니다. 서비스 이용, 정책, 오류 제보 관련 문의 채널을 확인할 수 있습니다.',
  path: '/contact',
  keywords: ['사주 치트키 문의', '문의 이메일', '서비스 문의', '오류 제보'],
});

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />

      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
        <header className="rounded-[3rem] p-8 md:p-12 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.14)', boxShadow: '0 8px 40px rgba(232,130,154,0.06)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(232,130,154,0.7)' }}>Contact</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>문의하기</h1>
          <p className="leading-8 break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>
            {SITE_TEAM}은 서비스 이용 문의, 정책 문의, 오류 제보를 이메일로 받고 있습니다. 확인이 필요한 내용은 가능한 한 자세히 적어주시면 처리에 도움이 됩니다.
          </p>
        </header>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>기본 문의 채널</h2>
          <div className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(232,130,154,0.06)', border: '1px solid rgba(232,130,154,0.14)' }}>
            <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(232,130,154,0.7)' }}>Email</p>
            <a href={`mailto:${SITE_EMAIL}`} className="text-xl md:text-2xl font-bold break-all transition-colors" style={{ color: '#f5eef2' }}>
              {SITE_EMAIL}
            </a>
            <p className="leading-8 break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>
              서비스 이용, 개인정보 및 정책 관련 문의, 오류 제보, 콘텐츠 관련 의견을 보낼 수 있습니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232,130,154,0.1)' }}>
              <h3 className="font-bold" style={{ color: '#f5eef2' }}>문의 시 함께 적어주세요</h3>
              <p className="leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>이용한 페이지, 발생한 시간, 오류 화면이나 상황 설명, 회신이 필요한 이메일 주소</p>
            </article>
            <article className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232,130,154,0.1)' }}>
              <h3 className="font-bold" style={{ color: '#f5eef2' }}>먼저 확인하면 좋은 페이지</h3>
              <p className="leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>기본 이용 질문은 FAQ, 개인정보 관련 내용은 개인정보처리방침, 서비스 소개는 서비스 소개 페이지에서 확인할 수 있습니다.</p>
            </article>
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(157,143,255,0.12), rgba(18,8,16,0.85) 60%)', border: '1px solid rgba(157,143,255,0.16)' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>관련 링크</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/faq" className="px-4 py-2 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #e8829a, #c2255c)' }}>
              FAQ
            </Link>
            <Link href="/privacy" className="px-4 py-2 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,143,255,0.2)', color: 'rgba(240,232,238,0.82)' }}>
              개인정보처리방침
            </Link>
            <Link href="/terms" className="px-4 py-2 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,143,255,0.2)', color: 'rgba(240,232,238,0.82)' }}>
              이용약관
            </Link>
          </div>
        </section>
      </div>

      <Footer dark />
    </main>
  );
}
