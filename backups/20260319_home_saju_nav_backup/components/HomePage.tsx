'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  Compass,
  Heart,
  Layers3,
  ShieldCheck,
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
    lineColor: '#f06595',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,240,246,0.98))',
    buttonClassName: 'bg-primary-600 hover:bg-primary-700',
    titleClassName: 'text-primary-900',
  },
  {
    title: '운명 궁합',
    description: '두 사람의 에너지가\n얼마나 잘 맞는지 확인해요',
    href: '/gunghap',
    buttonLabel: '궁합 보기',
    emoji: '💖',
    lineColor: '#e64980',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,244,247,0.98))',
    buttonClassName: 'bg-rose-500 hover:bg-rose-600',
    titleClassName: 'text-rose-700',
  },
  {
    title: '타로 리딩',
    description: '지금 이 순간 카드가\n전하는 메시지를 받아요',
    href: '/tarot',
    buttonLabel: '타로 보기',
    emoji: '🔮',
    lineColor: tarotColor,
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(238,237,254,0.98))',
    buttonStyle: { background: `linear-gradient(135deg, ${tarotColor}, #534ab7)` },
    titleStyle: { color: tarotColor },
  },
];

const guideChoiceCards = [
  { title: '나의 본질이 궁금해요', description: '사주 추천', href: '/saju', color: '#f06595' },
  { title: '지금 이 관계가 궁금해요', description: '궁합 추천', href: '/gunghap', color: '#e64980' },
  { title: '지금 이 순간이 궁금해요', description: '타로 추천', href: '/tarot', color: tarotColor },
];

const featureCards = [
  {
    title: '사주로 본질 읽기',
    description: '타고난 기질과 반복되는 흐름을 먼저 읽고, 나를 설명하는 언어를 얻습니다.',
    color: '#f06595',
    icon: Heart,
  },
  {
    title: '궁합으로 관계 보기',
    description: '서로의 에너지와 리듬이 어떻게 만나는지 확인하면서 관계의 온도를 살핍니다.',
    color: '#e64980',
    icon: Sparkles,
  },
  {
    title: '타로로 지금 해석하기',
    description: '현재 감정과 선택 앞에서 무엇을 더 분명하게 봐야 하는지 카드의 메시지로 정리합니다.',
    color: tarotColor,
    icon: Stars,
  },
  {
    title: '바로 이어지는 읽을거리',
    description: '결과만 던지지 않고, 이해를 돕는 기초 가이드와 설명 콘텐츠까지 이어집니다.',
    color: '#f59f00',
    icon: Zap,
  },
];

const featuredGuideCards = [
  {
    title: '사주란 무엇인가',
    description: '사주가 어떤 원리로 읽히는지, 처음 보는 사람도 이해하기 쉽게 정리한 기초 가이드입니다.',
    href: '/guide/what-is-saju',
    icon: BookOpen,
  },
  {
    title: '천간과 지지 기초',
    description: '사주의 구조를 이루는 천간과 지지를 초보자도 따라갈 수 있게 풀어낸 읽을거리입니다.',
    href: '/guide/heavenly-stems-earthly-branches',
    icon: Layers3,
  },
  {
    title: '오행의 흐름',
    description: '목화토금수가 어떻게 균형을 이루는지, 사주에서 어떤 의미를 가지는지 살펴봅니다.',
    href: '/guide/five-elements',
    icon: Compass,
  },
  {
    title: '운세 해석 가이드',
    description: '결과를 어떻게 읽고 어디까지 참고해야 하는지, 해석의 기준을 차분히 안내합니다.',
    href: '/guide/how-to-read-yearly-fortune',
    icon: CircleHelp,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(250,162,193,0.22),transparent_25%),radial-gradient(circle_at_top_right,rgba(247,131,172,0.14),transparent_28%),linear-gradient(180deg,#fff5f7_0%,#fff9fb_52%,#fff5f7_100%)] pt-20">
      <AdSenseScript />
      <Navbar />

      <section className="relative px-6 pb-16 pt-8 md:pb-24 md:pt-14">
        <div className="section-blob -left-16 top-0 h-80 w-80 bg-primary-100/70" />
        <div className="section-blob right-0 top-8 h-[26rem] w-[26rem] bg-pink-100/50" />
        <div className="section-blob bottom-0 left-1/3 h-72 w-72 bg-primary-50/80" />

        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <motion.div {...fadeUp} className="glass-panel relative overflow-hidden rounded-[2.7rem] px-7 py-8 md:px-12 md:py-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(255,240,246,0.76),rgba(255,255,255,0.56))]" />
            <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full border border-white/70 bg-white/35 blur-sm md:block" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-primary-200/70 bg-white/80 px-5 py-2 text-sm font-black text-primary-700 shadow-sm">
                  <span>사주</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
                  <span>궁합</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
                  <span style={{ color: tarotColor }}>타로</span>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-gray-900 md:text-7xl">
                    나를 읽는
                    <br />
                    세 가지 방법
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-gray-600 break-keep md:text-xl md:leading-9">
                    사주로 본질을 알고, 궁합으로 인연을 확인하고
                    <br className="hidden md:block" />
                    타로로 지금 이 순간의 메시지를 받아요
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  무료 제공
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                  개인정보 안전
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-sm">
                  <Zap className="h-4 w-4" />
                  즉시 확인
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="relative overflow-hidden rounded-[2.7rem] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(255,244,247,0.92),rgba(255,255,255,0.86))] p-7 shadow-[0_24px_70px_rgba(240,101,149,0.08)]"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Harmony Note</p>
                <h2 className="text-2xl font-black leading-tight text-gray-900">
                  사주, 궁합, 타로를
                  <br />
                  한 흐름으로 보세요
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-[1.6rem] bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-black text-primary-700">사주</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">내가 어떤 결의 사람인지 먼저 읽습니다.</p>
                </div>
                <div className="rounded-[1.6rem] bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-black text-rose-600">궁합</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">그 결이 다른 사람과 만났을 때의 리듬을 봅니다.</p>
                </div>
                <div className="rounded-[1.6rem] bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-black" style={{ color: tarotColor }}>타로</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">지금 내 앞에 놓인 순간의 메시지를 확인합니다.</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-400">Services</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">원하는 방식으로 바로 시작하기</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {serviceCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className="glass-card relative overflow-hidden rounded-[2.2rem] p-6"
                style={{ background: card.surface }}
              >
                <div className="absolute left-0 top-0 h-1.5 w-full" style={{ background: card.lineColor }} />
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="space-y-5">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                      style={{
                        background:
                          card.title === '타로 리딩'
                            ? `linear-gradient(135deg, ${tarotColor}, #534ab7)`
                            : `linear-gradient(135deg, ${card.lineColor}, ${card.title === '운명 궁합' ? '#c2255c' : '#a61e4d'})`,
                        boxShadow:
                          card.title === '타로 리딩'
                            ? '0 12px 28px rgba(127,119,221,0.22)'
                            : '0 12px 28px rgba(240,101,149,0.18)',
                      }}
                    >
                      <span>{card.emoji}</span>
                    </div>

                    <div className="space-y-3">
                      <h3 className={`text-2xl font-black tracking-tight ${card.titleClassName ?? ''}`} style={card.titleStyle}>
                        {card.title}
                      </h3>
                      <p className="whitespace-pre-line text-sm leading-7 text-gray-500 break-keep md:text-base">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={card.href}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-white transition ${card.buttonClassName ?? ''}`}
                    style={card.buttonStyle}
                  >
                    {card.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-400">Today&apos;s Hint</p>
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

      <section className="px-6 py-8 md:py-12">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-400">Guide Match</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">어떤 게 나에게 맞을까요?</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {guideChoiceCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={card.href}
                  className="glass-card block rounded-[2rem] p-6"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.96), ${card.color === tarotColor ? 'rgba(238,237,254,0.96)' : 'rgba(255,245,247,0.96)'})`,
                  }}
                >
                  <div className="mb-5 h-1.5 w-14 rounded-full" style={{ background: card.color }} />
                  <h3 className="text-2xl font-black leading-tight text-gray-900 break-keep">{card.title}</h3>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-black" style={{ color: card.color }}>
                    {card.description}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-pink-50 bg-white/70 px-6 py-16 md:py-20">
        <div className="section-blob -right-10 top-0 h-96 w-96 bg-primary-50/70" />
        <div className="section-blob bottom-0 left-8 h-72 w-72 bg-pink-50/80" />

        <motion.div {...fadeUp} className="relative z-10 mx-auto max-w-7xl space-y-10">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Key Features</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">세 가지 도구를 함께 쓰는 이유</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="premium-card rounded-[2rem] p-7 text-left"
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.15rem] text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${card.color}, ${card.color === tarotColor ? '#534ab7' : '#a61e4d'})`,
                      boxShadow:
                        card.color === tarotColor
                          ? '0 12px 26px rgba(127,119,221,0.2)'
                          : '0 12px 26px rgba(240,101,149,0.16)',
                    }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500 break-keep">{card.description}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <motion.div {...fadeUp} className="space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Learn the Basics</p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">사주 기초를 먼저 읽어보세요</h2>
            <p className="mx-auto max-w-3xl text-base leading-8 text-gray-500 break-keep">
              결과를 읽기 전에 기본 개념을 같이 보면 해석이 훨씬 선명해집니다. 초보자도 따라갈 수 있게 핵심만 압축했습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredGuideCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.href} className="premium-card rounded-[2rem] bg-white p-8">
                  <div className="flex items-start gap-4">
                    <div className="icon-gradient-pink flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-md shadow-primary-200/40">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-primary-900">{card.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-gray-500 break-keep">{card.description}</p>
                    </div>
                  </div>
                  <div className="divider-gradient my-6" />
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-2 text-sm font-black text-primary-600 transition hover:text-primary-800"
                  >
                    자세히 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="px-6 pb-20">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-6xl overflow-hidden rounded-[3rem] border border-primary-100/50"
          style={{
            background: 'linear-gradient(135deg, #fff8fc, #ffffff, #fff0f6)',
            boxShadow: '0 20px 60px rgba(240,101,149,0.06), 0 4px 16px rgba(240,101,149,0.04)',
          }}
        >
          <div className="relative p-8 md:p-12">
            <div className="section-blob right-0 top-0 h-64 w-64 bg-primary-50/60" />
            <div className="section-blob bottom-0 left-0 h-48 w-48 bg-pink-50/80" />

            <div className="relative z-10 space-y-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-primary-500">Reading Library</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">사주 기초 읽을거리</h2>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-gray-500 break-keep">
                    사주를 처음 접할 때 자주 생기는 질문과 읽을거리를 모았습니다. 결과를 더 차분하게 이해하는 데 도움이 되는 기본 자료입니다.
                  </p>
                </div>

                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-black text-primary-600 transition hover:bg-primary-100 hover:text-primary-800"
                >
                  자주 묻는 질문 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {guides.map((guide, index) => (
                  <article
                    key={guide.slug}
                    className="rounded-[1.5rem] border border-pink-50 bg-white/85 p-6 transition hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-100/40"
                  >
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="icon-gradient-pink flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-base font-black leading-snug text-primary-900 break-keep">{guide.title}</h3>
                    </div>
                    <p className="mb-4 text-sm leading-7 text-gray-500 break-keep">{guide.description}</p>
                    <Link
                      href={`/guide/${guide.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-black text-primary-500 transition hover:text-primary-700"
                    >
                      읽어보기
                      <ArrowRight className="h-3.5 w-3.5" />
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
