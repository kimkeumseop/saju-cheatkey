'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SajuModal from './SajuModal';
import GungHapInputModal from './GungHapInputModal';
import LoginModal from './LoginModal';

type Tab = {
  id: string;
  label: string;
  subLabel: string;
  emoji: string;
  accent: string;
  accentSoft: string;
  active: boolean;
  action: () => void;
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSajuModalOpen, setIsSajuModalOpen] = useState(false);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const tabs: Tab[] = [
    {
      id: 'saju',
      label: '사주',
      subLabel: '운세 분석',
      emoji: '🔮',
      accent: '#E64980',
      accentSoft: 'rgba(240,101,149,0.12)',
      active: pathname === '/saju' || pathname?.startsWith('/result'),
      action: () => setIsSajuModalOpen(true),
    },
    {
      id: 'compatibility',
      label: '궁합',
      subLabel: '인연 확인',
      emoji: '💞',
      accent: '#E64980',
      accentSoft: 'rgba(230,73,128,0.12)',
      active: pathname === '/gunghap',
      action: () => setIsGungHapModalOpen(true),
    },
    {
      id: 'tarot',
      label: '타로',
      subLabel: '오늘의 카드',
      emoji: '🌙',
      accent: '#7F77DD',
      accentSoft: 'rgba(127,119,221,0.14)',
      active: pathname === '/tarot' || pathname?.startsWith('/tarot/'),
      action: () => router.push('/tarot'),
    },
    {
      id: 'mbti',
      label: 'MBTI',
      subLabel: '성향 테스트',
      emoji: '🧠',
      accent: '#10B981',
      accentSoft: 'rgba(16,185,129,0.14)',
      active: pathname === '/mbti' || pathname?.startsWith('/mbti/'),
      action: () => router.push('/mbti'),
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 z-50 w-full pb-safe">
        <div className="mx-4 mb-4 max-w-2xl md:mx-auto">
          <div className="rounded-[2rem] border border-pink-100/60 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(240,101,149,0.12),0_8px_40px_rgba(240,101,149,0.08)]">
            <div className="flex min-h-20 items-stretch px-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className="group relative flex flex-1 flex-col items-center justify-center py-2"
                >
                  <div
                    className="flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2.5 transition-all duration-300 active:scale-95"
                    style={{
                      background: tab.active ? `linear-gradient(180deg, ${tab.accentSoft}, rgba(255,255,255,0.98))` : 'transparent',
                      boxShadow: tab.active ? `0 12px 28px ${tab.accentSoft}` : 'none',
                    }}
                  >
                    <span className="mb-0.5 text-2xl transition-transform duration-200 group-hover:scale-110">{tab.emoji}</span>
                    <div className="text-center leading-tight">
                      <p className="text-[12px] font-black tracking-tight" style={{ color: tab.active ? tab.accent : '#7a7a7a' }}>
                        {tab.label}
                      </p>
                      <p className="text-[9px] font-bold" style={{ color: tab.active ? tab.accent : '#b9b9b9' }}>
                        {tab.subLabel}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <SajuModal isOpen={isSajuModalOpen} onClose={() => setIsSajuModalOpen(false)} />
      <GungHapInputModal isOpen={isGungHapModalOpen} onClose={() => setIsGungHapModalOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
