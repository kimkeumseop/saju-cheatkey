'use client';

import { useState } from 'react';
import { Sparkles, Heart, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SajuModal from './SajuModal';
import GungHapInputModal from './GungHapInputModal';
import LoginModal from './LoginModal';
import { useAuth } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleTabClick = (action: () => void) => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      action();
    }
  };

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
      <nav className="fixed bottom-0 left-0 w-full z-50 pb-safe">
        <div className="mx-4 mb-4 max-w-2xl md:mx-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100/60 rounded-[2rem] shadow-[0_-4px_24px_rgba(240,101,149,0.12),0_8px_40px_rgba(240,101,149,0.08)]">
            <div className="flex h-20 items-stretch px-4">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.action)}
                    className="flex-1 flex flex-col items-center justify-center transition-all relative group"
                  >
                    <div className="w-[90%] py-2.5 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 hover:bg-gradient-to-b hover:from-primary-50 hover:to-white active:scale-95">
                      <span className="text-2xl mb-0.5 group-hover:scale-110 transition-transform duration-200">{tab.emoji}</span>
                      <div className="text-center leading-tight">
                        <p className="text-[13px] font-black tracking-tighter text-primary-700">
                          {tab.label}
                        </p>
                        <p className="text-[9px] font-bold text-primary-300">
                          {tab.subLabel}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
