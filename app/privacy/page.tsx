import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import { createMetadata, SITE_EMAIL, SITE_NAME, SITE_TEAM } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '개인정보처리방침',
  description: '사주 치트키의 개인정보 수집 항목, 이용 목적, 광고 및 쿠키 처리, 문의처를 안내합니다.',
  path: '/privacy',
  keywords: ['개인정보처리방침', '사주 치트키 개인정보', '쿠키', 'AdSense'],
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 overflow-x-hidden">
      <AdSenseScript />
      <Navbar />

      <article className="px-6 py-6 max-w-4xl mx-auto space-y-8">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-4">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Privacy Policy</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 text-serif">개인정보처리방침</h1>
          <p className="text-gray-500 text-sm">최종 수정일: 2026년 3월 13일</p>
          <p className="text-gray-600 leading-8 break-keep">
            {SITE_NAME}는 서비스 제공에 필요한 범위 안에서 개인정보를 처리하며, 관련 법령에 맞추어 이용자의 정보를 보호하려고 합니다.
          </p>
        </header>

        <div className="space-y-5 text-gray-700 leading-8">
          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-primary-900">1. 수집 항목 및 이용 목적</h2>
            <p>
              본 서비스는 사주 분석 결과 생성과 문의 대응을 위해 이름, 생년월일, 출생 시간, 성별, 양력/음력 구분, 문의 시 제공되는 연락 정보를 처리할 수 있습니다.
              입력된 정보는 사주 계산과 결과 제공, 서비스 운영 및 오류 확인을 위한 목적으로만 사용합니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-primary-900">2. 광고 및 쿠키 안내</h2>
            <p>
              {SITE_NAME}는 정보성 페이지와 일부 서비스 화면에서 Google AdSense를 사용할 수 있습니다. Google은 쿠키를 사용하여 방문 이력에 기반한 광고를 제공할 수 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>광고 쿠키 사용 여부는 Google의 광고 설정에서 관리할 수 있습니다.</li>
              <li>브라우저 설정을 통해 쿠키 저장을 제한할 수 있으나, 일부 기능 이용에 영향이 있을 수 있습니다.</li>
              <li>콘텐츠가 충분하지 않은 페이지나 빈 결과, 준비 상태 화면에는 광고 스크립트나 광고 영역이 노출되지 않도록 운영합니다.</li>
            </ul>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-primary-900">3. 보관 및 외부 제공</h2>
            <p>
              이용자가 입력한 정보는 결과 생성과 서비스 운영을 위해 필요한 범위에서만 처리됩니다. {SITE_TEAM}은 이용자의 개인정보를 외부에 판매하거나 무단으로 공유하지 않습니다.
            </p>
            <p>
              다만 서비스 운영 과정에서 사용하는 인프라나 광고, 인증, 결제, 분석 도구를 통해 필요한 범위의 정보 처리가 발생할 수 있으며, 이는 서비스 제공 목적 안에서만 제한적으로 이루어집니다.
            </p>
          </section>

          <section className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-black text-primary-900">4. 이용자 권리 및 문의처</h2>
            <p>
              개인정보 처리와 관련한 문의는 {SITE_EMAIL} 로 접수할 수 있습니다. 요청 내용 확인 후 관련 법령과 서비스 운영 기준에 따라 안내합니다.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-black text-primary-700">
              <Link href="/contact" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                문의하기
              </Link>
              <Link href="/terms" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                이용약관
              </Link>
              <Link href="/faq" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
                FAQ
              </Link>
            </div>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
