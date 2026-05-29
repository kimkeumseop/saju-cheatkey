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
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          무료 궁합 분석 시작하기
        </button>
      </div>
      <GungHapInputModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
