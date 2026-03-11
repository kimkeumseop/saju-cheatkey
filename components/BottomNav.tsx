'use client';

import { useState } from 'react';
import { Sparkles, Heart, Moon } from 'lucide-react';
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
      id: 'saju', 
      label: '나의 사주', 
      subLabel: '운명의 분석',
      emoji: '🌙', 
      action: () => setIsSajuModalOpen(true)
    },
    { 
      id: 'compatibility', 
      label: '운명 궁합', 
      subLabel: '인연의 확인',
      emoji: '💖', 
      action: () => setIsGungHapModalOpen(true)
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-pink-50 z-50 shadow-[0_-10px_40px_rgba(230,73,128,0.06)] pb-safe rounded-t-[2.5rem]">
        <div className="flex h-24 items-stretch px-6 max-w-2xl mx-auto">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="flex-1 flex flex-col items-center justify-center transition-all relative"
              >
                <div className="w-[90%] py-2.5 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 hover:bg-primary-50/50">
                  <span className="text-2xl mb-0.5">{tab.emoji}</span>
                  <div className="text-center leading-tight">
                    <p className="text-[14px] font-black tracking-tighter text-primary-700">
                      {tab.label}
                    </p>
                    <p className="text-[10px] font-bold text-primary-300">
                      {tab.subLabel}
                    </p>
                  </div>
                </div>
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
