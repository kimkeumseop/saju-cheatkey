'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Stars,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import TodayWhisper from '@/components/TodayWhisper';
import TodayTarotCard from '@/components/tarot/TodayTarotCard';
import { guides } from '@/lib/site';

const tarotColor = '#7F77DD';

const serviceCards = [
  {
    title: '사주 분석',
    description: '생년월일로 나의 본질과\n타고난 흐름을 읽어드려요',
    href: '/saju',
    buttonLabel: '사주 보기',
    emoji: '✦',
    accent: '#f06595',
    accentEnd: '#e64980',
    glow: 'rgba(240,101,149,0.18)',
    bg: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(255,235,244,0.95) 100%)',
  },
  {
    title: '운명 궁합',
    description: '두 사람의 에너지가\n얼마나 잘 맞는지 확인해요',
    href: '/gunghap',
    buttonLabel: '궁합 보기',
    emoji: '💖',
    accent: '#e64980',
    accentEnd: '#c2255c',
    glow: 'rgba(230,73,128,0.18)',
    bg: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(255,228,240,0.95) 100%)',
  },
  {
    title: '타로 리딩',
    description: '지금 이 순간 카드가\n전하는 메시지를 받아요',
    href: '/tarot',
    buttonLabel: '타로 보기',
    emoji: '🔮',
    accent: tarotColor,
    accentEnd: '#534ab7',
    glow: 'rgba(127,119,221,0.18)',
    bg: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(238,237,254,0.95) 100%)',
  },
  {
    title: 'MBTI 테스트',
    description: '20문항 슬라이더로\n3~4분 만에 내 성격 유형 확인',
    href: '/mbti',
    buttonLabel: 'MBTI 보기',
    emoji: '🧠',
    accent: '#10B981',
    accentEnd: '#059669',
    glow: 'rgba(16,185,129,0.18)',
    bg: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(236,253,245,0.95) 100%)',
  },
];

const guideChoiceCards = [
  {
    question: '나의 본질이 궁금해요',
    service: '사주',
    subtext: '태어난 날의 기운으로 나를 읽어요',
    href: '/saju',
    accent: '#f06595',
    num: '01',
  },
  {
    question: '이 관계가 잘 맞는지 궁금해요',
    service: '궁합',
    subtext: '두 사람의 에너지가 만나는 방식을 봐요',
    href: '/gunghap',
    accent: '#e64980',
    num: '02',
  },
  {
    question: '지금 이 순간이 궁금해요',
    service: '타로',
    subtext: '카드가 전하는 오늘의 메시지를 받아요',
    href: '/tarot',
    accent: tarotColor,
    num: '03',
  },
  {
    question: '내 성격 유형이 궁금해요',
    service: 'MBTI',
    subtext: '20문항으로 빠르게 성향을 파악해요',
    href: '/mbti',
    accent: '#10B981',
    num: '04',
  },
];

const featureItems = [
  {
    num: '01',
    title: '사주로 본질 읽기',
    description: '타고난 기질과 반복되는 흐름을 먼저 읽고, 나를 설명하는 언어를 얻습니다.',
    accent: '#f06595',
  },
  {
    num: '02',
    title: '궁합으로 관계 보기',
    description: '서로의 에너지와 리듬이 어떻게 만나는지 확인하면서 관계의 온도를 살핍니다.',
    accent: '#e64980',
  },
  {
    num: '03',
    title: '타로로 지금 해석하기',
    description: '현재 감정과 선택 앞에서 무엇을 더 분명하게 봐야 하는지 카드의 메시지로 정리합니다.',
    accent: tarotColor,
  },
  {
    num: '04',
    title: 'MBTI로 성격 확인하기',
    description: '20문항 슬라이더로 내 성격 유형을 빠르게 확인하고, 강점과 잘 맞는 유형까지 한눈에 봅니다.',
    accent: '#10B981',
  },
];


const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg,#fff5f7 0%,#fffbfc 60%,#fff5f7 100%)' }}>
      <AdSenseScript />
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 md:pt-36">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(247,131,172,0.35) 0%, transparent 70%)' }} />
          <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(240,101,149,0.4) 0%, transparent 70%)' }} />
          <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${tarotColor}66 0%, transparent 70%)` }} />
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          {/* Top pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary-200/60 bg-white/90 px-5 py-2.5 shadow-sm"
          >
            <span className="text-sm font-black text-primary-600">사주</span>
            <span className="h-1 w-1 rounded-full bg-primary-300" />
            <span className="text-sm font-black text-rose-500">궁합</span>
            <span className="h-1 w-1 rounded-full bg-primary-300" />
            <span className="text-sm font-black" style={{ color: tarotColor }}>타로</span>
            <span className="h-1 w-1 rounded-full bg-primary-300" />
            <span className="text-sm font-black text-emerald-500">MBTI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.07 }}
            className="text-6xl font-black leading-[1.02] tracking-tight text-gray-900 md:text-8xl"
          >
            나를 읽는
            <br />
            <span className="gradient-text">네 가지 방법</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-7 max-w-xl text-lg leading-9 text-gray-500 break-keep md:text-xl"
          >
            사주로 본질을 알고, 궁합으로 인연을 확인하고<br className="hidden md:block" />
            타로와 MBTI로 지금의 나를 더 선명하게 봐요
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/saju"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #f06595, #e64980)', boxShadow: '0 12px 30px rgba(240,101,149,0.35)' }}
            >
              사주 바로 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tarot"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-7 py-4 text-base font-bold shadow-sm transition hover:shadow-md hover:bg-white active:scale-[0.98]"
              style={{ color: tarotColor }}
            >
              타로 보기
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-400"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary-300" />무료 제공</span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="flex items-center gap-1.5"><Stars className="h-3.5 w-3.5 text-primary-300" />개인정보 안전</span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary-300" />즉시 확인</span>
          </motion.div>
        </div>

      </section>

      {/* ─── SERVICES ─── */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Services</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">원하는 방식으로 바로 시작하기</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.22 } }}
                className="group relative overflow-hidden rounded-[2.4rem] p-7 md:p-8"
                style={{
                  background: card.bg,
                  boxShadow: `0 4px 24px ${card.glow}, 0 1px 4px rgba(0,0,0,0.04)`,
                  border: '1px solid rgba(255,255,255,0.8)',
                }}
              >
                {/* Top accent bar */}
                <div className="absolute left-0 top-0 h-1 w-full rounded-t-[2.4rem]" style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.accentEnd})` }} />

                {/* Glow orb */}
                <div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
                  style={{ background: `radial-gradient(circle, ${card.accent}, transparent 70%)` }}
                />

                <div className="relative z-10 flex h-full flex-col gap-7">
                  {/* Icon */}
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${card.accent}, ${card.accentEnd})`,
                      boxShadow: `0 12px 30px ${card.glow}`,
                    }}
                  >
                    {card.emoji}
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">{card.title}</h3>
                    <p className="whitespace-pre-line text-sm leading-7 text-gray-500 break-keep">{card.description}</p>
                  </div>

                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-white transition active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${card.accent}, ${card.accentEnd})`,
                      boxShadow: `0 8px 20px ${card.glow}`,
                    }}
                  >
                    {card.buttonLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TODAY'S HINT ─── */}
      <section className="px-6 py-14 md:py-20" style={{ background: 'linear-gradient(180deg,transparent,rgba(255,240,246,0.4),transparent)' }}>
        <motion.div {...fadeUp} className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Today&apos;s Hint</p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">오늘 당신에게 필요한 힌트</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TodayWhisper />
            <div className="tarot-theme">
              <TodayTarotCard />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── GUIDE MATCH ─── */}
      <section className="px-6 py-14 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Guide Match</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">어떤 게 나에게 맞을까요?</h2>
            <p className="mt-4 text-sm text-gray-500">지금 가장 궁금한 것을 골라보세요</p>
          </div>

          <div className="flex flex-col gap-4">
            {guideChoiceCards.map((card, index) => (
              <motion.div
                key={card.question}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
              >
                <Link
                  href={card.href}
                  className="group flex items-center justify-between gap-5 rounded-[1.8rem] border border-white/80 bg-white/90 p-6 shadow-sm transition hover:shadow-md md:p-7"
                  style={{ boxShadow: '0 2px 12px rgba(240,101,149,0.06)' }}
                >
                  <div className="flex items-center gap-5">
                    <span className="text-xs font-black tabular-nums text-gray-200">{card.num}</span>
                    <div className="h-10 w-0.5 rounded-full" style={{ background: card.accent }} />
                    <div>
                      <p className="text-base font-bold text-gray-900 break-keep md:text-lg">{card.question}</p>
                      <p className="mt-1 text-sm text-gray-400 break-keep">{card.subtext}</p>
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${card.accent}, ${card.accent}cc)` }}
                  >
                    {card.service}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── KEY FEATURES ─── */}
      <section className="relative overflow-hidden border-y border-pink-50/80 px-6 py-16 md:py-20" style={{ background: 'linear-gradient(180deg,#fff8fb,#ffffff,#fff8fb)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,rgba(240,101,149,0.3),transparent 70%)' }} />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full opacity-15" style={{ background: `radial-gradient(circle,${tarotColor}44,transparent 70%)` }} />
        </div>

        <motion.div {...fadeUp} className="relative z-10 mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Key Features</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">네 가지 도구를 함께 쓰는 이유</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="rounded-[2rem] bg-white p-7 shadow-sm"
                style={{ border: '1px solid rgba(240,101,149,0.08)' }}
              >
                <div className="mb-6 flex items-end justify-between">
                  <span className="text-5xl font-black leading-none" style={{ color: `${item.accent}22` }}>{item.num}</span>
                  <div className="h-1.5 w-10 rounded-full" style={{ background: item.accent }} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500 break-keep">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── READING LIBRARY ─── */}
      <section className="px-6 pb-24">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-6xl overflow-hidden rounded-[3rem]"
          style={{
            background: 'linear-gradient(135deg, #fff8fc, #ffffff, #fff0f6)',
            boxShadow: '0 20px 60px rgba(240,101,149,0.07)',
            border: '1px solid rgba(240,101,149,0.1)',
          }}
        >
          <div className="relative p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3rem]">
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,rgba(240,101,149,0.4),transparent 70%)' }} />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,rgba(240,101,149,0.5),transparent 70%)' }} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-primary-500">Reading Library</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">사주 기초 읽을거리</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500 break-keep">
                    결과를 더 차분하게 이해하는 데 도움이 되는 기본 자료를 모았습니다.
                  </p>
                </div>

                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-black text-primary-600 transition hover:bg-primary-100"
                >
                  자주 묻는 질문 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {guides.map((guide, index) => (
                  <article
                    key={guide.slug}
                    className="group rounded-[1.4rem] border border-pink-50 bg-white/90 p-5 transition hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="icon-gradient-pink flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-sm font-black leading-snug text-primary-900 break-keep">{guide.title}</h3>
                    </div>
                    <p className="mb-3 text-xs leading-6 text-gray-500 break-keep">{guide.description}</p>
                    <Link
                      href={`/guide/${guide.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-primary-500 transition hover:text-primary-700"
                      aria-label={`${guide.title} 읽어보기`}
                    >
                      {guide.title} 읽어보기
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
