'use client';

import { usePathname, useRouter } from 'next/navigation';

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

  const tabs: Tab[] = [
    {
      id: 'saju',
      label: '사주',
      subLabel: '운세 분석',
      emoji: '🔮',
      accent: '#d4688a',
      accentSoft: 'rgba(212,104,138,0.16)',
      active: pathname === '/saju' || pathname?.startsWith('/result'),
      action: () => router.push('/saju'),
    },
    {
      id: 'compatibility',
      label: '궁합',
      subLabel: '인연 확인',
      emoji: '💞',
      accent: '#d4688a',
      accentSoft: 'rgba(212,104,138,0.16)',
      active: pathname === '/gunghap',
      action: () => router.push('/gunghap'),
    },
    {
      id: 'tarot',
      label: '타로',
      subLabel: '오늘의 카드',
      emoji: '🌙',
      accent: '#7c6fd6',
      accentSoft: 'rgba(124,111,214,0.16)',
      active: pathname === '/tarot' || pathname?.startsWith('/tarot/'),
      action: () => router.push('/tarot'),
    },
    {
      id: 'mbti',
      label: 'MBTI',
      subLabel: '성향 테스트',
      emoji: '🧠',
      accent: '#0e9f73',
      accentSoft: 'rgba(14,159,115,0.16)',
      active: pathname === '/mbti' || pathname?.startsWith('/mbti/'),
      action: () => router.push('/mbti'),
    },
  ];

  // 웜 아이보리 라이트 컨테이너
  const containerStyle = {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(45,27,30,0.08)',
    boxShadow: '0 -4px 24px rgba(45,27,30,0.08), 0 8px 40px rgba(212,104,138,0.08)',
  };
  const labelIdle = 'rgba(45,27,30,0.55)';
  const subLabelIdle = 'rgba(45,27,30,0.4)';

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full pb-safe">
      <div className="mx-4 mb-4 max-w-2xl md:mx-auto">
        <div className="rounded-[2rem] backdrop-blur-xl" style={containerStyle}>
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
                    background: tab.active ? `linear-gradient(180deg, ${tab.accentSoft}, transparent)` : 'transparent',
                    boxShadow: tab.active ? `0 8px 24px ${tab.accentSoft}, 0 0 0 1px ${tab.accent}26 inset` : 'none',
                  }}
                >
                  <span
                    className="mb-0.5 text-2xl transition-transform duration-200 group-hover:scale-110"
                    style={tab.active ? { filter: `drop-shadow(0 0 8px ${tab.accent}aa)` } : undefined}
                  >
                    {tab.emoji}
                  </span>
                  <div className="text-center leading-tight">
                    <p
                      className="text-[12px] font-black tracking-tight"
                      style={{ color: tab.active ? tab.accent : labelIdle, textShadow: tab.active ? `0 0 10px ${tab.accent}55` : 'none' }}
                    >
                      {tab.label}
                    </p>
                    <p className="text-[9px] font-bold" style={{ color: tab.active ? tab.accent : subLabelIdle }}>
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
  );
}
