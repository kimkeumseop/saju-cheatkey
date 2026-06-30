'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import GungHapInputModal from '@/components/GungHapInputModal';

export default function GunghapCTA() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #d4688a, #9e1c4e)',
            boxShadow: '0 4px 24px rgba(212,104,138,0.32)',
          }}
        >
          <Sparkles className="h-4 w-4" />
          무료 궁합 분석 시작하기
        </button>
      </div>
      <GungHapInputModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
