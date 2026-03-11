'use client';

import { useState } from 'react';
import { Home, Sparkles, Heart, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SajuModal from './SajuModal';
import GungHapInputModal from './GungHapInputModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);

  const tabs = [
    { 
      id: 'home', 
      label: '홈', 
      subLabel: '메인',
      emoji: '🏠', 
      path: '/' 
    },
    { 
      id: 'saju', 
      label: '사주 가이드', 
      subLabel: '소름 돋는 분석',
      emoji: '🌙', 
      action: () => setIsSajuModalOpen(true)
    },
    { 
      id: 'compatibility', 
      label: '운명적 궁합', 
      subLabel: '우리 인연일까?',
      emoji: '💖', 
      action: () => setIsGungHapModalOpen(true)
    },
    { 
      id: 'unse', 
      label: '오늘의 운세', 
      subLabel: '하루의 치트키',
      emoji: '✨', 
      path: '/unse' 
    },
  ];

  const isActive = (tabPath: string | undefined) => {
    if (!tabPath) return false;
    return pathname === tabPath;
  };

  return (
    <>
      {/* 화면 전체 너비를 차지하는 하단 바 - 핑크 테마 적용 */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-pink-50 z-50 shadow-[0_-10px_40px_rgba(230,73,128,0.06)] pb-safe rounded-t-[2.5rem]">
        <div className="flex h-24 items-stretch px-2 max-w-5xl mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={tab.path ? () => router.push(tab.path) : tab.action}
                className="flex-1 flex flex-col items-center justify-center transition-all relative"
              >
                <div className={cn(
                  "w-[90%] py-2.5 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5",
                  active ? "bg-primary-100 scale-105 shadow-sm shadow-pink-50" : "hover:bg-primary-50/50"
                )}>
                  {/* 아이콘 크기 확대 */}
                  <span className="text-2xl mb-0.5">{tab.emoji}</span>
                  
                  <div className="text-center leading-tight">
                    {/* 주 텍스트: 크게 */}
                    <p className={cn(
                      "text-[13px] font-black tracking-tighter transition-colors",
                      active ? "text-primary-700" : "text-gray-400"
                    )}>
                      {tab.label}
                    </p>
                    {/* 부 텍스트: 작게 (2단 구조) */}
                    <p className={cn(
                      "text-[9px] font-bold opacity-60",
                      active ? "text-primary-600/70" : "text-gray-300"
                    )}>
                      {tab.subLabel}
                    </p>
                  </div>
                </div>
                
                {/* 활성화 표시 바 (상단) */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <SajuModal 
        isOpen={isSajuModalOpen} 
        onClose={() => setIsSajuModalOpen(false)} 
      />
      <GungHapInputModal
        isOpen={isGungHapModalOpen}
        onClose={() => setIsGungHapModalOpen(false)}
      />
    </>
  );
}
