'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GungHapInputModal from '@/components/GungHapInputModal';

export default function GunghapPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(250,162,193,0.18),transparent_28%),linear-gradient(180deg,#fff5f7_0%,#fffafb_60%,#fff5f7_100%)] pt-20">
      <Navbar />

      <section className="px-6 py-20">
        <div className="glass-panel mx-auto max-w-3xl rounded-[2.5rem] p-8 text-center md:p-12">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-primary-400">Destiny Compatibility</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-5xl">운명 궁합을 시작해보세요</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-gray-500 break-keep">
            두 사람의 정보를 선택하면 관계의 흐름과 궁합 포인트를 바로 확인할 수 있어요.
          </p>
        </div>
      </section>

      <GungHapInputModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Footer />
    </main>
  );
}
