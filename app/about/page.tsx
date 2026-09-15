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

        <section id="editorial" className="scroll-mt-24 rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>콘텐츠는 이렇게 만듭니다</h2>
          <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
            <p>
              공개 가이드와 칼럼의 게시·수정 책임은 사주 치트키 운영팀에 있습니다. 이 서비스는 전통 명리학을 처음 접하는 이용자를 위한 설명과 계산 예시를 제공합니다. 운영팀 명의가 전문 자격이나 임상 검수 이력을 뜻하지는 않습니다. 별도 검토자를 표시하지 않은 글을 전문가가 개별 검수한 자료로 소개하지 않습니다.
            </p>
            <p>
              개인화 사주 해설의 문장 생성에는 AI를 사용합니다. 먼저 명식과 오행 등을 계산하고 그 값을 해설에 전달합니다. AI 결과는 사람이 매 건 확인한 상담 결과가 아니며 사실 오류나 과도한 해석이 있을 수 있습니다. 공개 예시는 가상 입력임을 표시하고 실제 서비스 계산으로 비교할 수 있게 구성합니다.
            </p>
            <h3 className="text-lg font-bold text-[#2D1B1E]">자료를 읽는 기준</h3>
            <p>달력과 간지 계산은 <a href="https://github.com/6tail/lunar-javascript" className="underline underline-offset-4">lunar-javascript</a>를 사용합니다. 이 자료는 계산 방식을 확인하기 위한 것으로 성격·건강·미래 예측의 검증 근거가 아닙니다. 전통적 상징과 서비스가 택한 계산 규칙을 구분하고, 참고 자료가 뒷받침하지 않는 통계나 임상적 효과를 주장하지 않습니다.</p>
            <p>MBTI 메뉴는 자체 20문항을 사용하는 간이 성향 테스트입니다. 공식 MBTI 검사를 제공하거나 성격·능력을 진단하는 서비스는 아닙니다. 사주 및 테스트 점수를 의학적 판단, 투자 결정, 채용 평가의 근거로 사용하지 않습니다.</p>
            <h3 className="text-lg font-bold text-[#2D1B1E]">수정과 오류 제보</h3>
            <p>본문을 실제로 수정한 경우 해당 글의 수정일을 갱신합니다. 문장 생성에 사용된 AI나 운영팀 명의만으로 정확성을 보장하지 않습니다. 글의 오류는 <a href={`mailto:${SITE_EMAIL}`} className="underline underline-offset-4">{SITE_EMAIL}</a>로 페이지 주소, 문제가 되는 문장과 이유를 보내주세요. 개인 병력이나 신분증 같은 자료는 필요하지 않습니다.</p>
            <p>계산 예시와 한계는 <Link href="/guide/what-is-saju#calculation-example" className="underline underline-offset-4">가상 명식 비교표</Link>, <Link href="/guide/lunar-solar-calendar-saju" className="underline underline-offset-4">달력·시간 보정 기준</Link>, <Link href="/guide/birth-time-unknown" className="underline underline-offset-4">출생시간 미상 안내</Link>에서 확인할 수 있습니다.</p>
            <p className="text-sm">2026년 9월 15일 수정. 과학·건강 관련 표현의 범위를 정리하고, 가상 계산 예시와 출생시간 미상 처리 기준을 추가했습니다.</p>
          </div>
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
