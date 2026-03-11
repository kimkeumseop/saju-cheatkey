'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Gift, Flame, Calendar, ChevronRight, Zap, Moon, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentWidget from '@/components/PaymentWidget';
import SajuModal from '@/components/SajuModal';

export default function UnsePage() {
  const router = useRouter();
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'free' | 'premium' | '2026'>('free');

  const handleFreeUnse = () => {
    // 무료 운세 버튼 클릭 시 사주 입력 모달 오픈
    setSelectedType('free');
    setIsSajuModalOpen(true);
  };

  const handlePaidUnse = (type: 'premium' | '2026') => {
    // 유료 운세 버튼 클릭 시 결제 위젯 오픈
    setSelectedType(type);
    setShowPaymentWidget(true);
  };

  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-20 pb-32 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-md mx-auto px-6 space-y-8 py-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 text-xs font-black mb-2 shadow-sm">
            <Moon className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
            운명의 속삭임
          </div>
          <h1 className="text-3xl font-black text-primary-900 tracking-tight">오늘의 운세 & 2026</h1>
          <p className="text-primary-300 font-bold text-sm">당신의 영혼을 위한 특별한 가이드</p>
        </div>

        {/* 1순위 (최상단): 오늘의 운세 (무료) - 흰색/초록색 카드 */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-50 space-y-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-xl">
                <Gift className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-gray-800">오늘의 운세 (무료)</h3>
            </div>
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse tracking-widest">FREE</span>
          </div>

          <div 
            onClick={handleFreeUnse}
            className="aspect-[16/9] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-green-50/30 transition-all group active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
              <span className="text-2xl">🪄</span>
            </div>
            <p className="text-gray-400 font-bold text-sm text-center px-4 break-keep">오늘 나에게 찾아올 <br/> 행운의 메시지를 확인하세요</p>
          </div>

          <button 
            onClick={handleFreeUnse}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-2"
          >
            지금 바로 확인하기
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        {/* 2순위 (중간): 오늘의 운세 프리미엄 - 어두운 갈색 카드 */}
        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <Star className="w-8 h-8 text-primary-300 opacity-20" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Zap className="w-5 h-5 text-primary-300 fill-primary-300" />
              </div>
              <h3 className="text-xl font-black text-white">오늘의 운세 프리미엄</h3>
            </div>
            
            <p className="text-gray-400 font-bold text-sm leading-relaxed break-keep">
              시간대별 기운의 흐름부터 <br/>
              <span className="text-primary-200">럭키 아이템 & 피해야 할 귀신(?)</span>까지 <br/>
              더 깊고 다정하게 속삭여드려요.
            </p>

            <button 
              onClick={() => handlePaidUnse('premium')}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-2"
            >
              777원으로 확인하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* 3순위 (최하단): 2026 丙午年 불바다의 해 팩폭 신년운세 - 붉은색 카드 */}
        <section className="bg-gradient-to-br from-[#E11D48] to-[#9F1239] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <Flame className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="w-5 h-5 fill-white" />
              <span className="font-black text-[10px] tracking-[0.2em] uppercase">2026 Whisper of Fate</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-3xl font-black leading-tight break-keep">
                2026 丙午年 <br/>
                <span className="text-primary-200">불바다의 해</span> <br/>
                운명의 속삭임
              </h3>
              <p className="text-white/70 font-bold text-sm">뜨거운 태양 아래, 당신의 재능과 인연이 <br/> 가장 아름답게 만개할 순간을 알려드려요.</p>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 flex justify-between items-center text-white">
              <span className="font-bold text-xs">한정 기간 신년 특별가</span>
              <span className="text-2xl font-black text-primary-200">777원</span>
            </div>

            <button 
              onClick={() => handlePaidUnse('2026')}
              className="w-full bg-white text-[#E11D48] hover:bg-gray-50 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-[0.95] flex items-center justify-center gap-2"
            >
              777원으로 확인하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      {/* 결제 위젯 */}
      {showPaymentWidget && (
        <PaymentWidget 
          resultId={`unse_${selectedType}_${Date.now()}`} 
          onCancel={() => setShowPaymentWidget(false)} 
        />
      )}

      {/* 사주 입력 모달 (무료 운세용) */}
      <SajuModal 
        isOpen={isSajuModalOpen} 
        onClose={() => setIsSajuModalOpen(false)} 
      />

      <Footer />
    </main>
  );
}
