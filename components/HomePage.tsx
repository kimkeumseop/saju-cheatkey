'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Stars, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
import TodayWhisper from '@/components/TodayWhisper';
import TodayTarotCard from '@/components/tarot/TodayTarotCard';
import { guides } from '@/lib/site';

// Deterministic star positions — safe for SSR (no Math.random)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 37 + 13) * 997) % 10000 / 100,
  y: ((i * 53 + 7) * 1009) % 10000 / 100,
  size: [1, 1, 1.5, 1, 1, 2, 1, 1, 1, 2.5][i % 10],
  opacity: [0.15, 0.25, 0.4, 0.2, 0.35, 0.6, 0.2, 0.3, 0.45, 0.7][i % 10],
  delay: (i * 0.17) % 4,
  duration: 2.5 + (i % 20) / 10,
  bright: i % 9 === 0,
}));

const serviceCards = [
  {
    title: '사주 분석',
    description: '생년월일로 나의 본질과\n타고난 흐름을 읽어드려요',
    href: '/saju',
    buttonLabel: '사주 보기',
    emoji: '✦',
    accent: '#ff6eb4',
    accentEnd: '#e64980',
    glow: 'rgba(255,110,180,0.28)',
    border: 'rgba(255,110,180,0.2)',
  },
  {
    title: '운명 궁합',
    description: '두 사람의 에너지가\n얼마나 잘 맞는지 확인해요',
    href: '/gunghap',
    buttonLabel: '궁합 보기',
    emoji: '💖',
    accent: '#ff4da6',
    accentEnd: '#c2255c',
    glow: 'rgba(255,77,166,0.28)',
    border: 'rgba(255,77,166,0.2)',
  },
  {
    title: '타로 리딩',
    description: '지금 이 순간 카드가\n전하는 메시지를 받아요',
    href: '/tarot',
    buttonLabel: '타로 보기',
    emoji: '🔮',
    accent: '#9d8fff',
    accentEnd: '#534ab7',
    glow: 'rgba(157,143,255,0.28)',
    border: 'rgba(157,143,255,0.2)',
  },
  {
    title: 'MBTI 테스트',
    description: '20문항 슬라이더로\n3~4분 만에 내 성격 유형 확인',
    href: '/mbti',
    buttonLabel: 'MBTI 보기',
    emoji: '🧠',
    accent: '#00e5a0',
    accentEnd: '#059669',
    glow: 'rgba(0,229,160,0.22)',
    border: 'rgba(0,229,160,0.2)',
  },
];

const guideChoiceCards = [
  { question: '나의 본질이 궁금해요',         service: '사주',  subtext: '태어난 날의 기운으로 나를 읽어요',      href: '/saju',    accent: '#ff6eb4', accentEnd: '#e64980', num: '01' },
  { question: '이 관계가 잘 맞는지 궁금해요', service: '궁합',  subtext: '두 사람의 에너지가 만나는 방식을 봐요', href: '/gunghap', accent: '#ff4da6', accentEnd: '#c2255c', num: '02' },
  { question: '지금 이 순간이 궁금해요',       service: '타로',  subtext: '카드가 전하는 오늘의 메시지를 받아요',  href: '/tarot',   accent: '#9d8fff', accentEnd: '#534ab7', num: '03' },
  { question: '내 성격 유형이 궁금해요',       service: 'MBTI', subtext: '20문항으로 빠르게 성향을 파악해요',     href: '/mbti',    accent: '#00e5a0', accentEnd: '#059669', num: '04' },
];

const featureItems = [
  { num: '01', title: '사주로 본질 읽기',       description: '타고난 기질과 반복되는 흐름을 먼저 읽고, 나를 설명하는 언어를 얻습니다.',                                       accent: '#ff6eb4' },
  { num: '02', title: '궁합으로 관계 보기',     description: '서로의 에너지와 리듬이 어떻게 만나는지 확인하면서 관계의 온도를 살핍니다.',                                      accent: '#ff4da6' },
  { num: '03', title: '타로로 지금 해석하기',   description: '현재 감정과 선택 앞에서 무엇을 더 분명하게 봐야 하는지 카드의 메시지로 정리합니다.',                             accent: '#9d8fff' },
  { num: '04', title: 'MBTI로 성격 확인하기',  description: '20문항 슬라이더로 내 성격 유형을 빠르게 확인하고, 강점과 잘 맞는 유형까지 한눈에 봅니다.',                       accent: '#00e5a0' },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

// Shared dark glass card style
const glassCard = (borderColor = 'rgba(255,255,255,0.08)', glowColor?: string) => ({
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${borderColor}`,
  boxShadow: glowColor
    ? `0 4px 32px ${glowColor}, 0 1px 0 rgba(255,255,255,0.05) inset`
    : '0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset',
});

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#06040f' }}>
      <AdSenseScript />

      {/* ─── STAR FIELD ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.bright ? '#fff' : 'rgba(255,255,255,0.9)',
              animation: `${star.bright ? 'cosmic-twinkle-bright' : 'cosmic-twinkle'} ${star.duration}s ease-in-out ${star.delay}s infinite`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* ─── AURORA BACKGROUND ORBS ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '900px', height: '700px',
            background: 'radial-gradient(ellipse, rgba(240,101,149,0.12) 0%, transparent 65%)',
            animation: 'aurora-drift 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '10%', right: '-15%',
            width: '700px', height: '600px',
            background: 'radial-gradient(ellipse, rgba(120,80,255,0.09) 0%, transparent 65%)',
            animation: 'aurora-drift-2 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '10%', left: '-10%',
            width: '600px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(0,200,140,0.07) 0%, transparent 65%)',
            animation: 'aurora-drift 22s ease-in-out 3s infinite reverse',
          }}
        />
      </div>

      <Navbar dark />

      {/* ─── HERO ─── */}
      <section className="relative z-10 flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 md:pt-36">
        <div className="flex max-w-4xl flex-col items-center text-center">
          {/* Top pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full px-5 py-2.5"
            style={glassCard('rgba(255,255,255,0.1)')}
          >
            <span className="text-sm font-black" style={{ color: '#ff6eb4', textShadow: '0 0 12px rgba(255,110,180,0.6)' }}>사주</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-sm font-black" style={{ color: '#ff4da6', textShadow: '0 0 12px rgba(255,77,166,0.6)' }}>궁합</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-sm font-black" style={{ color: '#9d8fff', textShadow: '0 0 12px rgba(157,143,255,0.6)' }}>타로</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-sm font-black" style={{ color: '#00e5a0', textShadow: '0 0 12px rgba(0,229,160,0.6)' }}>MBTI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.07 }}
            className="text-6xl font-black leading-[1.02] tracking-tight md:text-8xl"
            style={{ color: '#f0eeff' }}
          >
            나를 읽는
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #ff6eb4, #9d8fff, #00e5a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(157,143,255,0.4))',
              }}
            >
              네 가지 방법
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-7 max-w-xl text-lg leading-9 break-keep md:text-xl"
            style={{ color: 'rgba(240,238,255,0.5)' }}
          >
            사주로 본질을 알고, 궁합으로 인연을 확인하고<br className="hidden md:block" />
            타로와 MBTI로 지금의 나를 더 선명하게 봐요
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-bold"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" style={{ color: '#ff6eb4' }} />무료 제공
            </span>
            <span className="h-3 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="flex items-center gap-1.5">
              <Stars className="h-3.5 w-3.5" style={{ color: '#9d8fff' }} />개인정보 안전
            </span>
            <span className="h-3 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" style={{ color: '#00e5a0' }} />즉시 확인
            </span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.2)' }}>scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-5 w-5 rounded-full flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 1L4 4.5L7 1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,110,180,0.7)' }}>Services</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl" style={{ color: '#f0eeff' }}>원하는 방식으로 바로 시작하기</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-[2rem] p-7 transition-all duration-300"
                style={{
                  background: `radial-gradient(ellipse at 110% -10%, ${card.accent}1a 0%, rgba(10,8,22,0.85) 55%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${card.border}`,
                  boxShadow: `0 8px 40px ${card.glow}, 0 1px 0 rgba(255,255,255,0.05) inset`,
                }}
              >
                {/* Number badge — top right */}
                <div
                  className="absolute right-6 top-5 text-[11px] font-black tracking-[0.22em]"
                  style={{ color: card.accent, opacity: 0.25 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Top accent line — left-anchored, fades right */}
                <div
                  className="absolute left-7 top-0 h-[2px] rounded-b"
                  style={{
                    width: '44%',
                    background: `linear-gradient(90deg, ${card.accent}, transparent)`,
                    boxShadow: `0 0 8px ${card.glow}`,
                  }}
                />

                {/* Bottom-right ambient glow orb */}
                <div
                  className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full opacity-10 transition-opacity duration-500 group-hover:opacity-22"
                  style={{ background: `radial-gradient(circle, ${card.accent}, transparent 68%)` }}
                />

                <div className="relative z-10 flex h-full flex-col gap-6">
                  {/* Icon — glass tile */}
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] text-[1.6rem]"
                    style={{
                      background: `linear-gradient(145deg, ${card.accent}2e, ${card.accentEnd}18)`,
                      border: `1px solid ${card.accent}40`,
                      boxShadow: `0 4px 20px ${card.glow}, 0 0 0 1px rgba(255,255,255,0.06) inset`,
                    }}
                  >
                    <span style={{ filter: `drop-shadow(0 0 6px ${card.accent})` }}>{card.emoji}</span>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <h3 className="text-xl font-bold tracking-tight" style={{ color: '#f0eeff' }}>{card.title}</h3>
                    <p className="whitespace-pre-line text-sm leading-[1.75] break-keep" style={{ color: 'rgba(240,238,255,0.5)' }}>{card.description}</p>
                  </div>

                  <Link
                    href={card.href}
                    className="group/btn inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all duration-200 hover:gap-3 hover:brightness-110 hover:shadow-lg active:scale-[0.97] active:brightness-95"
                    style={{
                      background: `linear-gradient(135deg, ${card.accent}, ${card.accentEnd})`,
                      boxShadow: `0 4px 20px ${card.glow}, 0 1px 0 rgba(255,255,255,0.18) inset`,
                    }}
                  >
                    {card.buttonLabel}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TODAY'S HINT ─── */}
      <section
        className="relative z-10 px-6 py-14 md:py-20"
        style={{ background: 'linear-gradient(180deg,transparent,rgba(157,143,255,0.04),transparent)' }}
      >
        <motion.div {...fadeUp} className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(157,143,255,0.7)' }}>Today&apos;s Hint</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: '#f0eeff' }}>오늘 당신에게 필요한 힌트</h2>
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
      <section className="relative z-10 px-6 py-14 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,110,180,0.7)' }}>Guide Match</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl" style={{ color: '#f0eeff' }}>어떤 게 나에게 맞을까요?</h2>
            <p className="mt-3 text-sm" style={{ color: 'rgba(240,238,255,0.35)' }}>지금 가장 궁금한 것을 골라보세요</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {guideChoiceCards.map((card, index) => (
              <motion.div
                key={card.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  href={card.href}
                  className="group flex flex-col gap-5 rounded-[2rem] p-6 transition-shadow duration-300 md:p-7"
                  style={{
                    background: `radial-gradient(ellipse at 100% 0%, ${card.accent}18 0%, rgba(10,8,22,0.7) 60%)`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${card.accent}30`,
                    boxShadow: `0 4px 28px ${card.accent}14`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-[11px] font-black tabular-nums tracking-[0.18em]"
                      style={{ color: `${card.accent}60` }}
                    >
                      {card.num}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 opacity-30 transition-all duration-200 group-hover:opacity-80 group-hover:translate-x-1"
                      style={{ color: card.accent }}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-snug break-keep" style={{ color: '#f0eeff' }}>{card.question}</p>
                    <p className="mt-2 text-sm leading-relaxed break-keep" style={{ color: 'rgba(240,238,255,0.4)' }}>{card.subtext}</p>
                  </div>
                  <div
                    className="self-start rounded-full px-4 py-2 text-xs font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${card.accent}, ${card.accentEnd})`,
                      boxShadow: `0 2px 12px ${card.accent}40`,
                    }}
                  >
                    {card.service} 보기
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── KEY FEATURES ─── */}
      <section
        className="relative z-10 overflow-hidden px-6 py-16 md:py-20"
        style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.01),rgba(157,143,255,0.03),rgba(255,255,255,0.01))' }}
      >
        <motion.div {...fadeUp} className="relative z-10 mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(157,143,255,0.7)' }}>Key Features</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl" style={{ color: '#f0eeff' }}>네 가지 도구를 함께 쓰는 이유</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="group rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1"
                style={glassCard(`${item.accent}22`)}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="text-[3.5rem] font-black leading-none"
                    style={{ color: item.accent, opacity: 0.15 }}
                  >
                    {item.num}
                  </span>
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent}28, ${item.accent}14)`,
                      border: `1px solid ${item.accent}35`,
                    }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-tight" style={{ color: '#f0eeff' }}>{item.title}</h3>
                <p className="mt-3 text-sm leading-7 break-keep" style={{ color: 'rgba(240,238,255,0.45)' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── SAJU INTRO ─── */}
      <section className="relative z-10 px-6 py-14 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(157,143,255,0.7)' }}>사주란 무엇인가</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl" style={{ color: '#f0eeff' }}>명리학이 읽는 나의 기운</h2>
          </div>

          <div
            className="rounded-[2.4rem] p-8 md:p-12"
            style={glassCard('rgba(157,143,255,0.12)', 'rgba(157,143,255,0.06)')}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
              {/* Text column */}
              <div className="space-y-5">
                <p className="text-base leading-8 break-keep" style={{ color: 'rgba(240,238,255,0.7)' }}>
                  사주(四柱)란 태어난 연·월·일·시의 네 기둥, 여덟 글자로 개인의 기질과 삶의 흐름을 읽는 동양 명리학의 핵심 도구입니다. 수천 년간 축적된 관찰을 바탕으로, 타고난 에너지 패턴을 파악하고 변화의 흐름을 살피는 데 활용해왔습니다.
                </p>
                <p className="text-base leading-8 break-keep" style={{ color: 'rgba(240,238,255,0.7)' }}>
                  사주의 근간은 오행(五行)입니다. 목·화·토·금·수, 다섯 기운이 서로 돕고 견제하면서 자연과 사람의 흐름을 만듭니다. 천간 열 글자와 지지 열두 글자의 조합이 만드는 60개의 패턴은 개인의 기질과 대인관계 방식을 입체적으로 드러내줍니다.
                </p>
                <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(240,238,255,0.45)' }}>
                  사주 치트키는 이 명리학적 관점을 누구나 읽을 수 있는 언어로 풀어드립니다. 26편의 기초 가이드와 명리 칼럼으로 처음 접하는 분도 입체적인 이해를 얻을 수 있습니다.
                </p>
              </div>

              {/* Concept tiles column */}
              <div className="flex flex-col gap-3">
                {[
                  { label: '네 기둥', desc: '연·월·일·시 여덟 글자로 기질과 흐름을 읽는 구조', accent: '#ff6eb4' },
                  { label: '오행 균형', desc: '목·화·토·금·수의 강약과 상생상극 관계 분석', accent: '#9d8fff' },
                  { label: '대운 흐름', desc: '10년 단위로 바뀌는 대운과 연간 운세의 변화', accent: '#00e5a0' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl p-4"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent}0f, rgba(255,255,255,0.02))`,
                      border: `1px solid ${item.accent}22`,
                    }}
                  >
                    <p className="text-sm font-black mb-1.5" style={{ color: item.accent }}>{item.label}</p>
                    <p className="text-xs leading-[1.7] break-keep" style={{ color: 'rgba(240,238,255,0.45)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── READING LIBRARY ─── */}
      <section className="relative z-10 px-6 pb-24">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-6xl overflow-hidden rounded-[3rem] p-8 md:p-12"
          style={glassCard('rgba(255,110,180,0.15)', 'rgba(255,110,180,0.08)')}
        >
          {/* Corner orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3rem]">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff6eb4, transparent 70%)' }} />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #9d8fff, transparent 70%)' }} />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'rgba(255,110,180,0.8)' }}>Reading Library</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight" style={{ color: '#f0eeff' }}>사주 기초 읽을거리</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 break-keep" style={{ color: 'rgba(240,238,255,0.4)' }}>
                  결과를 더 차분하게 이해하는 데 도움이 되는 기본 자료를 모았습니다.
                </p>
              </div>
              <div className="flex flex-col gap-2 self-start">
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,110,180,0.15)',
                    border: '1px solid rgba(255,110,180,0.25)',
                    color: '#ff6eb4',
                  }}
                >
                  가이드 전체 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,110,180,0.06)',
                    border: '1px solid rgba(255,110,180,0.12)',
                    color: 'rgba(255,110,180,0.7)',
                  }}
                >
                  자주 묻는 질문 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {guides.slice(0, 6).map((guide, index) => (
                <Link
                  key={guide.slug}
                  href={`/guide/${guide.slug}`}
                  className="group rounded-[1.4rem] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(255,110,180,0.18)] block"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  aria-label={`${guide.title} 읽어보기`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #ff6eb4, #e64980)' }}
                    >
                      {index + 1}
                    </div>
                    <h3 className="text-sm font-bold leading-snug break-keep" style={{ color: 'rgba(240,238,255,0.88)' }}>{guide.title}</h3>
                  </div>
                  <p className="mb-4 pl-9 text-xs leading-[1.7] break-keep" style={{ color: 'rgba(240,238,255,0.35)' }}>{guide.description}</p>
                  <div
                    className="pl-9 inline-flex items-center gap-1 text-xs font-black transition-all duration-200 group-hover:gap-1.5"
                    style={{ color: '#ff6eb4' }}
                  >
                    읽어보기
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer dark />
    </main>
  );
}
