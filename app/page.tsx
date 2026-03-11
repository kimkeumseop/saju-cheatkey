'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SajuModal from '@/components/SajuModal';
import { BookOpen, BarChart3, Shield, Info, Sparkles, Quote, Heart, ChevronRight } from 'lucide-react';

export default function Home() {
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);

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
                <span className="text-primary-500 drop-shadow-[0_4px_0_rgba(255,192,203,1)]">인생 팩폭 리포트</span>
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-[1.7] font-medium break-keep">
            어려운 명리학 용어 대신, 당신의 성향과 미래를 감각적으로 풀어드립니다. <br className="hidden md:block"/>
            답답한 일상에 소름 돋는 <span className="text-primary-600 font-bold underline decoration-primary-200 decoration-8 underline-offset-[-4px]">'치트키'</span>를 선물할게요.
          </p>
        </div>

        {/* 오늘의 무료 팩폭 한 줄 (클릭 시 사주 분석 시작) */}
        <div className="w-full max-w-md mx-auto">
          <div 
            onClick={() => setIsSajuModalOpen(true)}
            className="relative p-1 rounded-[3rem] bg-gradient-to-br from-primary-200 to-primary-400 shadow-2xl group transition-all hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
          >
            <div className="bg-white rounded-[2.8rem] p-8 md:p-10 space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full blur-2xl" />
              <Quote className="absolute top-6 right-8 w-12 h-12 text-primary-100" />
              
              <div className="flex items-center gap-2 text-primary-600">
                <Sparkles className="w-5 h-5 fill-primary-400 text-primary-400" />
                <span className="font-black text-sm uppercase tracking-widest">Today's Fortune</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl font-black text-gray-800 leading-tight break-keep">
                  "오늘은 지갑 단속 필수! <br/> 홧김 비용이 당신의 통장을 스캔 중입니다."
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                  현재 당신의 기운은 '불'의 기운이 강하게 요동치고 있어요. 열정은 좋지만, 소비 요정이 강림하기 딱 좋은 날입니다. (더 자세한 내용은 터치해서 확인)
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-400">👤</div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-[10px] font-black text-white">
                    +1.2k
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary-500 font-black text-xs">
                  분석 시작하기 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center mt-6 text-primary-400 text-xs font-bold animate-bounce">
            👇 지금 바로 나의 운명을 확인해보세요!
          </p>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="bg-white border-y border-pink-50 py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 p-6 rounded-3xl hover:bg-primary-50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Heart className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">소름 돋는 성격 분석</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">내 안의 또 다른 나를 스캔. 겉바속촉 기질부터 숨겨진 매력까지 가차 없이 털어드립니다.</p>
            </div>
            <div className="space-y-4 p-6 rounded-3xl hover:bg-primary-50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <BarChart3 className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">연애와 인간관계 치트키</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">내 마음도 모르겠는데 상대방 마음은? 연애 고민부터 귀인 판별까지 명쾌하게 풀어보세요.</p>
            </div>
            <div className="space-y-4 p-6 rounded-3xl hover:bg-primary-50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <Shield className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">2026 인생 가이드</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">다가오는 병오년의 흐름을 미리 체크하세요. 돈과 운을 끌어당기는 구체적인 행동 요령을 알려드립니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 명리학 가이드 섹션 */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">운명을 바꾸는 8글자의 비밀</h2>
          <div className="w-20 h-2 bg-primary-200 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 leading-[1.8] font-medium">
          <div className="bg-white p-8 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-primary-800 text-xl font-black"><Info className="w-5 h-5 text-primary-400" />천간과 지지란?</h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">우리가 태어난 시간은 10개의 천간(하늘 기운)과 12개의 지지(땅 기운)로 기록됩니다. 사주 치트키는 이를 현대적 감성으로 풀어냅니다.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-primary-800 text-xl font-black"><Info className="w-5 h-5 text-primary-400" />2026년 운세 미리보기</h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">인생은 고정된 게 아닙니다. 2026년 병오년은 강한 불의 기운이 지배하는 해입니다. 당신의 기운과 만났을 때 생길 변화를 준비하세요.</p>
          </div>
        </div>
      </section>

      {/* 모달 */}
      <SajuModal isOpen={isSajuModalOpen} onClose={() => setIsSajuModalOpen(false)} />

      <Footer />
    </main>
  );
}
