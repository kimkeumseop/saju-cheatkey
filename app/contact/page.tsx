import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, SITE_EMAIL, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '문의하기',
  description: '사주 치트키 운영팀의 문의 안내 페이지입니다. 서비스 이용, 정책, 오류 제보 관련 문의 채널을 확인할 수 있습니다.',
  path: '/contact',
  keywords: ['사주 치트키 문의', '문의 이메일', '서비스 문의', '오류 제보'],
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32">
      <AdSenseScript />
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-4">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Contact</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">문의하기</h1>
          <p className="text-gray-600 leading-8 break-keep">
            {SITE_TEAM}은 서비스 이용 문의, 정책 문의, 오류 제보를 이메일로 받고 있습니다. 확인이 필요한 내용은 가능한 한 자세히 적어주시면 처리에 도움이 됩니다.
          </p>
        </header>

        <section className="bg-white rounded-[2.5rem] border border-pink-50 shadow-sm p-8 md:p-10 space-y-5">
          <h2 className="text-2xl font-black text-primary-900">기본 문의 채널</h2>
          <div className="rounded-[1.75rem] bg-[#FFF5F7] border border-pink-50 p-6 space-y-2">
            <p className="text-sm font-black text-primary-500 uppercase tracking-[0.2em]">Email</p>
            <a href={`mailto:${SITE_EMAIL}`} className="text-xl md:text-2xl font-black text-primary-900 break-all hover:text-primary-700 transition-colors">
              {SITE_EMAIL}
            </a>
            <p className="text-gray-600 leading-8 break-keep">
              서비스 이용, 개인정보 및 정책 관련 문의, 오류 제보, 콘텐츠 관련 의견을 보낼 수 있습니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[1.75rem] bg-white border border-pink-50 p-6 space-y-2">
              <h3 className="font-black text-primary-900">문의 시 함께 적어주세요</h3>
              <p className="text-gray-600 leading-7 break-keep">이용한 페이지, 발생한 시간, 오류 화면이나 상황 설명, 회신이 필요한 이메일 주소</p>
            </article>
            <article className="rounded-[1.75rem] bg-white border border-pink-50 p-6 space-y-2">
              <h3 className="font-black text-primary-900">먼저 확인하면 좋은 페이지</h3>
              <p className="text-gray-600 leading-7 break-keep">기본 이용 질문은 FAQ, 개인정보 관련 내용은 개인정보처리방침, 서비스 소개는 서비스 소개 페이지에서 확인할 수 있습니다.</p>
            </article>
          </div>
        </section>

        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-10 text-white space-y-4">
          <h2 className="text-2xl font-black">관련 링크</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/faq" className="px-4 py-2 rounded-full bg-white text-primary-900 font-black">
              FAQ
            </Link>
            <Link href="/privacy" className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-black">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-black">
              이용약관
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
