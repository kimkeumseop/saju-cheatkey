import Navbar from '@/components/Navbar';
import SajuForm from '@/components/SajuForm';
import { Star, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20">
      <Navbar />
      <section className="relative px-4 py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-100 text-center leading-tight tracking-tight text-balance break-keep">
            당신의 인생 지도를 <br className="hidden md:block" />
            <span className="text-gold-400">명리학</span>으로 새롭게 읽다
          </h1>
          <p className="mt-6 text-xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed text-balance break-keep">
            무속적인 관례를 넘어선 현대적 데이터 분석. 당신의 고유한 기질과 미래의 흐름을 심리학적 통찰로 섬세하게 풀어냅니다.
          </p>
        </div>
        <div className="flex-1 w-full max-w-md">
          <SajuForm />
        </div>
      </section>
    </main>
  );
}