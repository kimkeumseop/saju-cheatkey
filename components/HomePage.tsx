'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SajuModal from '@/components/SajuModal';
import {
  Heart,
  ChevronRight,
  Loader2,
  Star,
  Moon,
  BookOpen,
  Compass,
  Layers3,
  CircleHelp,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { guides } from '@/lib/site';
import AdSenseScript from '@/components/AdSenseScript';

const featuredGuideCards = [
  {
    title: '사주란 무엇인가',
    description:
      '사주가 어떤 원리로 읽히는지, 왜 생년월일시 정보가 필요한지 가장 큰 틀부터 정리했습니다.',
    href: '/guide/what-is-saju',
    icon: BookOpen,
  },
  {
    title: '천간/지지 기초',
    description:
      '천간과 지지가 각각 무엇을 뜻하는지, 초보자가 먼저 이해해야 할 역할 중심으로 설명합니다.',
    href: '/guide/heavenly-stems-earthly-branches',
    icon: Layers3,
  },
  {
    title: '오행의 의미',
    description:
      '목화토금수가 많고 적다는 말이 실제로 무엇을 뜻하는지, 균형 개념과 함께 읽어봅니다.',
    href: '/guide/five-elements',
    icon: Compass,
  },
  {
    title: '운세 해석 가이드',
    description:
      '연운과 월운을 볼 때 어디까지 참고해야 하는지, 자극적인 표현 없이 현실적으로 정리했습니다.',
    href: '/guide/how-to-read-yearly-fortune',
    icon: CircleHelp,
  },
];

export default function HomePage() {
  const { profiles } = useAuth();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [isFreeLoading, setIsFreeLoading] = useState(false);
  const [freeResult, setFreeResult] = useState<{ keyword: string; message: string } | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchFreeUnse = async (name: string) => {
    setIsFreeLoading(true);
    try {
      const profile = profiles[0] || { birthDate: '1995-01-01', calendarType: 'solar', gender: 'female' };
      const res = await fetch('/api/unse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || '익명',
          birthDate: profile.birthDate,
          birthTime: 'unknown',
          calendarType: profile.calendarType,
          gender: profile.gender,
          isLite: true,
        }),
      });
      const data = await res.json();
      if (data.success) setFreeResult(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFreeLoading(false);
    }
  };

  const handleFreeStart = () => {
    if (profiles.length > 0) {
      fetchFreeUnse(profiles[0].name);
    } else {
      setShowInput(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-20 pb-32 overflow-x-hidden">
      <AdSenseScript />
      <Navbar />

      <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="w-full text-center space-y-8">
          <div className="space-y-6">
            <p className="text-primary-700 bg-primary-100 inline-block px-4 py-1.5 rounded-full text-xs md:text-sm font-black tracking-wider uppercase shadow-sm">
              Premium Destiny Analysis
            </p>
            <h1 className="font-black text-gray-900 leading-[1.1] tracking-tight break-keep">
              <span className="block text-[10vw] sm:text-5xl md:text-6xl lg:text-7xl text-primary-900">
                가장 완벽한
              </span>
              <span className="block text-[12vw] sm:text-6xl md:text-7xl lg:text-8xl mt-2">
                <span className="text-primary-500 drop-shadow-[0_4px_0_rgba(255,192,203,1)] text-serif">인생 팩폭 리포트</span>
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-[1.7] font-medium break-keep">
            어려운 명리학 용어 대신, 당신의 성향과 흐름을 읽기 쉬운 언어로 풀어드립니다.
            <br className="hidden md:block" />
            간단한 운세 확인은 물론, 사주란 무엇인지부터 오행과 천간지지 기초까지 함께 살펴볼 수 있습니다.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="relative p-1 rounded-[3rem] bg-gradient-to-br from-primary-200 to-primary-400 shadow-2xl overflow-hidden">
            <div className="bg-white rounded-[2.8rem] p-8 md:p-10 min-h-[320px] flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full blur-2xl" />
              <AnimatePresence mode="wait">
                {!freeResult ? (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 relative z-10"
                  >
                    <div className="flex items-center gap-2 text-primary-600">
                      <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                      <span className="font-black text-sm uppercase tracking-widest">Today's Whisper</span>
                    </div>

                    {!showInput ? (
                      <>
                        <div className="space-y-4">
                          <h2 className="text-2xl font-black text-gray-800 leading-tight break-keep">
                            오늘 당신에게 찾아올
                            <br />
                            흐름의 힌트는 무엇일까요?
                          </h2>
                          <p className="text-gray-400 font-medium text-sm">
                            별도 이동 없이 오늘의 간단한 참고 메시지를 바로 확인할 수 있습니다.
                          </p>
                        </div>
                        <button
                          onClick={handleFreeStart}
                          disabled={isFreeLoading}
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-2"
                        >
                          {isFreeLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : '무료로 확인하기'}
                          {!isFreeLoading && <ChevronRight className="w-5 h-5" />}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-primary-900 font-black text-lg">성함이 어떻게 되시나요?</p>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="이름을 입력해주세요"
                          className="w-full bg-primary-50 border border-primary-100 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-primary-300 font-bold"
                        />
                        <button
                          onClick={() => fetchFreeUnse(userName)}
                          className="w-full bg-primary-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl"
                        >
                          운세 확인하기
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 relative z-10 text-center"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="bg-primary-50 px-4 py-1.5 rounded-full text-primary-600 text-xs font-black">오늘의 운세</div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-black text-primary-900 break-keep leading-tight">
                        {freeResult.keyword}
                      </h2>
                      <div className="w-12 h-1 bg-primary-100 mx-auto rounded-full" />
                      <p className="text-gray-600 font-medium text-lg leading-relaxed break-keep px-2">
                        {freeResult.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setFreeResult(null)}
                      className="text-primary-300 font-bold text-xs underline underline-offset-4 hover:text-primary-500 transition-colors"
                    >
                      다시 확인하기
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-center mt-6 text-primary-400 text-xs font-bold">
            아래에서 사주 기초 가이드와 읽을거리를 함께 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-pink-50 py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">당신이 놓치고 있는 특별한 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Heart className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">소름 돋는 본질</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                성향과 관계 패턴을 읽을 때 무엇을 참고해야 하는지, 감정적인 표현보다 이해 중심으로 정리합니다.
              </p>
            </div>
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Moon className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">인연의 맥락</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                상대를 단정하기보다 서로 다른 기질과 생활 리듬을 이해하는 참고 정보로 활용할 수 있습니다.
              </p>
            </div>
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Star className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">흐름 읽기</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                해마다 달라지는 운세를 결과 예측보다 준비 방향으로 읽는 법을 안내합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight text-serif">사주 기초를 먼저 읽어보세요</h2>
          <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed break-keep">
            사주 치트키는 결과 확인만을 위한 페이지가 아니라, 기초 개념을 함께 이해할 수 있는 설명형 콘텐츠를 제공합니다.
            처음 보는 분도 부담 없이 읽을 수 있도록 핵심 개념을 짧게 정리했습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredGuideCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.href} className="bg-white p-8 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-primary-900">{card.title}</h3>
                  <p className="text-sm break-keep leading-relaxed text-gray-500">{card.description}</p>
                </div>
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 text-sm font-black text-primary-700 hover:text-primary-900 transition-colors"
                >
                  자세히 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-8">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div className="space-y-3">
              <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Reading Library</p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">사주 기초 읽을거리</h2>
              <p className="text-gray-500 leading-relaxed max-w-2xl break-keep">
                사주를 처음 접할 때 자주 생기는 질문을 중심으로 정리했습니다. 오해를 줄이고, 결과 페이지를 더 차분하게 읽는 데 도움이 되는 기초 자료입니다.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-black text-primary-700 hover:text-primary-900 transition-colors"
            >
              자주 묻는 질문 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <article key={guide.slug} className="rounded-[2rem] bg-[#FFF5F7] border border-pink-50 p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-primary-900 break-keep">{guide.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed break-keep">{guide.description}</p>
                </div>
                <Link
                  href={`/guide/${guide.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-black text-primary-700 hover:text-primary-900 transition-colors"
                >
                  읽어보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SajuModal isOpen={isSajuModalOpen} onClose={() => setIsSajuModalOpen(false)} />
      <Footer />
    </main>
  );
}
