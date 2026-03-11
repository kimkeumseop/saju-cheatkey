'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SajuModal from '@/components/SajuModal';
import { BookOpen, BarChart3, Shield, Info, Sparkles, Quote, Heart, ChevronRight, Loader2, Star, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { profiles } = useAuth();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  
  // 무료 운세용 상태
  const [isFreeLoading, setIsFreeLoading] = useState(false);
  const [freeResult, setFreeResult] = useState<{keyword: string, message: string} | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchFreeUnse = async (name: string) => {
    setIsFreeLoading(true);
    try {
      // 기본 프로필 정보나 입력된 이름을 사용 (나머지는 기본값으로 처리)
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
          isLite: true 
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
      <Navbar />
      
      {/* 히어로 섹션 */}
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

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-[1.7] font-medium break-keep">
            어려운 명리학 용어 대신, 당신의 성향과 미래를 감각적으로 풀어드립니다. <br className="hidden md:block"/>
            답답한 일상에 소름 돋는 <span className="text-primary-600 font-bold underline decoration-primary-200 decoration-8 underline-offset-[-4px]">'치트키'</span>를 선물할게요.
          </p>
        </div>

        {/* 오늘의 무료 운세 섹션 (개편됨) */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative p-1 rounded-[3rem] bg-gradient-to-br from-primary-200 to-primary-400 shadow-2xl overflow-hidden">
            <div className="bg-white rounded-[2.8rem] p-8 md:p-10 min-h-[320px] flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full blur-2xl" />
              <AnimatePresence mode="wait">
                {!freeResult ? (
                  <motion.div 
                    key="initial"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-6 relative z-10"
                  >
                    <div className="flex items-center gap-2 text-primary-600">
                      <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                      <span className="font-black text-sm uppercase tracking-widest">Today's Whisper</span>
                    </div>
                    
                    {!showInput ? (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-black text-gray-800 leading-tight break-keep">
                            오늘 당신에게 찾아올 <br/> 행운은 무엇일까요?
                          </h3>
                          <p className="text-gray-400 font-medium text-sm">별도의 페이지 이동 없이 바로 확인하세요.</p>
                        </div>
                        <button 
                          onClick={handleFreeStart}
                          disabled={isFreeLoading}
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-2"
                        >
                          {isFreeLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "무료로 확인하기"}
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
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
          <p className="text-center mt-6 text-primary-400 text-xs font-bold animate-bounce">
            👇 더 깊은 분석은 아래 탭을 눌러보세요!
          </p>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="bg-white border-y border-pink-50 py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">당신이 놓치고 있는 특별한 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Heart className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">소름 돋는 본질</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">내 안의 또 다른 나를 스캔. 숨겨진 매력까지 다정하게 읽어드려요.</p>
            </div>
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Moon className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">인연의 향기</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">내 곁을 채워줄 소중한 인연과 귀인의 특징을 로맨틱하게 알려드려요.</p>
            </div>
            <div className="space-y-4 p-8 rounded-[2.5rem] bg-[#FFF5F7] hover:scale-[1.02] transition-transform group">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Star className="w-7 h-7 text-primary-500 fill-primary-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">2026 인생 지도</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">다가오는 병오년의 흐름을 미리 체크하고 마법 같은 순간을 준비하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 명리학 가이드 섹션 */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight text-serif">운명을 바꾸는 8글자의 비밀</h2>
          <div className="w-20 h-2 bg-primary-200 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 leading-[1.8] font-medium">
          <div className="bg-white p-8 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-primary-800 text-xl font-black leading-none"><Info className="w-5 h-5 text-primary-400" />천간과 지지란?</h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">우리가 태어난 시간은 10개의 천간(하늘 기운)과 12개의 지지(땅 기운)로 기록됩니다. 사주 치트키는 이를 현대적 감성으로 풀어냅니다.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-primary-800 text-xl font-black leading-none"><Info className="w-5 h-5 text-primary-400" />2026년 운세 미리보기</h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">인생은 고정된 게 아닙니다. 2026년 병오년은 강한 불의 기운이 지배하는 해입니다. 당신의 기운과 만났을 때 생길 변화를 준비하세요.</p>
          </div>
        </div>
      </section>

      <SajuModal isOpen={isSajuModalOpen} onClose={() => setIsSajuModalOpen(false)} />
      <Footer />
    </main>
  );
}
