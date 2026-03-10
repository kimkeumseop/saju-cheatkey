'use client';

import { Sparkles, Gift, Flame, Calendar, ChevronRight, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UnsePage() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] pt-20 pb-32 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-md mx-auto px-6 space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#3C1E1E] tracking-tight">오늘의 운세 & 2026</h1>
          <p className="text-gray-400 font-bold text-sm">당신의 하루와 일 년을 팩폭으로 스캔합니다</p>
        </div>

        {/* 섹션 A: 무료 미끼 */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-xl">
                <Gift className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-[#3C1E1E]">오늘의 운세 (무료)</h3>
            </div>
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">FREE</span>
          </div>

          <div className="aspect-[16/9] bg-[#F7F8FA] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-green-50/30 transition-colors group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
              <span className="text-2xl">🃏</span>
            </div>
            <p className="text-gray-400 font-bold text-sm text-center px-4 break-keep">카드를 터치해서 오늘의 팩폭을 확인하세요</p>
          </div>

          <button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            무료로 확인하기
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        {/* 섹션 B: 신년운세 결제 유도 */}
        <section className="bg-gradient-to-br from-[#FF4D4D] to-[#FF8080] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <Flame className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="w-5 h-5 fill-white" />
              <span className="font-black text-xs tracking-widest uppercase">2026 New Year Special</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-3xl font-black leading-tight break-keep">
                2026 丙午年 <br/>
                <span className="text-[#FEE500]">불바다의 해</span> <br/>
                팩폭 신년운세
              </h3>
              <p className="text-white/80 font-bold text-sm">당신의 통장과 연애운, 타버릴까요? 살아남을까요?</p>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-center text-white">
                <span className="font-bold text-sm">한정 기간 할인가</span>
                <span className="text-2xl font-black text-[#FEE500]">777원</span>
              </div>
            </div>

            <button className="w-full bg-[#3C1E1E] hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              지금 바로 확인하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* 섹션 C: 프리미엄 운세 */}
        <section className="bg-[#3C1E1E] rounded-[2.5rem] p-8 shadow-lg space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <Zap className="w-8 h-8 text-[#FEE500] opacity-20" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <Calendar className="w-5 h-5 text-[#FEE500]" />
              </div>
              <h3 className="text-xl font-black text-white">오늘의 운세 프리미엄</h3>
            </div>
            
            <p className="text-gray-400 font-bold text-sm leading-relaxed break-keep">
              시간대별 기운의 흐름부터 <br/>
              <span className="text-white">오늘의 럭키 아이템 & 피해야 할 사람</span>까지 <br/>
              디테일하게 털어드립니다.
            </p>

            <button className="w-full bg-white/10 hover:bg-white/20 text-[#FEE500] border border-[#FEE500]/30 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2">
              1 치트키로 확인하기
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
