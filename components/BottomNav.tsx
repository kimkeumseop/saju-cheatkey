'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openTeaserModal', handleOpenModal);
    return () => window.removeEventListener('openTeaserModal', handleOpenModal);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* 하단 고정 내비게이션 바 */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex h-20 items-stretch">
          {/* 1번 메뉴: 팩폭 사주 (활성화) */}
          <button 
            className="flex-1 flex flex-col items-center justify-center bg-[#FEE500] transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-2xl mb-1">🦊</span>
            <div className="text-center">
              <p className="text-[13px] font-black text-[#3C1E1E] leading-none">팩폭 사주</p>
              <p className="text-[10px] font-bold text-[#3C1E1E]/60 mt-1 leading-none">(소름 주의)</p>
            </div>
          </button>

          {/* 2번 메뉴: 환승 궁합 (미끼) */}
          <button 
            onClick={openModal}
            className="flex-1 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors border-x border-gray-50"
          >
            <span className="text-2xl mb-1">💘</span>
            <div className="text-center">
              <p className="text-[13px] font-bold text-gray-700 leading-none">환승 궁합</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 leading-none">(우리 만날까?)</p>
            </div>
          </button>

          {/* 3번 메뉴: 2026 운세 (미끼) */}
          <button 
            onClick={openModal}
            className="flex-1 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-1">✨</span>
            <div className="text-center">
              <p className="text-[13px] font-bold text-gray-700 leading-none">2026 운세</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 leading-none">(돈벼락 맞을까?)</p>
            </div>
          </button>
        </div>
      </nav>

      {/* 티저 팝업 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#3C1E1E]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* 장식용 아이콘 */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FEE500]/20 rounded-full blur-2xl" />
            
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center space-y-6 pt-4 relative z-10">
              <div className="w-20 h-20 bg-[#FEE500] rounded-[2rem] flex items-center justify-center mx-auto shadow-lg rotate-3">
                <Zap className="w-10 h-10 text-[#3C1E1E] fill-[#3C1E1E]" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-[#3C1E1E] tracking-tight">앗! 조금만 기다려주세요</h3>
                <p className="text-gray-500 font-bold leading-relaxed break-keep">
                  이 기능은 현재 AI가 <span className="text-[#3C1E1E] underline decoration-[#FEE500] decoration-4 underline-offset-2">열심히 수련(?) 중</span>이에요. <br/>
                  조만간 엄청난 팩폭으로 돌아올게요! <br/>
                  기대해 주세요 😎
                </p>
              </div>

              <button 
                onClick={closeModal}
                className="w-full bg-[#3C1E1E] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                확인 (기다릴게요!)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
