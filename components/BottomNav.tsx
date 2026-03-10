'use client';

import { useState } from 'react';
import { Home, Sparkles, Heart, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SajuModal from './SajuModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'saju' | 'compatibility'>('saju');

  const tabs = [
    { id: 'home', label: '홈', emoji: '🏠', path: '/' },
    { id: 'saju', label: '팩폭 사주', emoji: '🦊', action: () => openModal('saju') },
    { id: 'compatibility', label: '환승 궁합', emoji: '💞', action: () => openModal('compatibility') },
    { id: 'unse', label: '2026 운세', emoji: '✨', path: '/unse' },
  ];

  const openModal = (type: 'saju' | 'compatibility') => {
    setModalType(type);
    setIsSajuModalOpen(true);
  };

  const isActive = (tabPath: string | undefined) => {
    if (!tabPath) return false;
    return pathname === tabPath;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe rounded-t-[2.5rem]">
        <div className="flex h-20 items-stretch px-4">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={tab.path ? () => router.push(tab.path) : tab.action}
                className="flex-1 flex flex-col items-center justify-center transition-all relative"
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 flex flex-col items-center min-w-[64px]",
                  active ? "bg-[#FEE500] scale-105 shadow-md" : "hover:bg-gray-50"
                )}>
                  <span className="text-xl mb-0.5">{tab.emoji}</span>
                  <span className={cn(
                    "text-[10px] font-black tracking-tighter transition-colors whitespace-nowrap",
                    active ? "text-[#3C1E1E]" : "text-gray-400"
                  )}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <SajuModal 
        isOpen={isSajuModalOpen} 
        onClose={() => setIsSajuModalOpen(false)} 
        type={modalType} 
      />
    </>
  );
}
