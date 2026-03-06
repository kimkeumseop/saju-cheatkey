import Navbar from '@/components/Navbar';
import SajuForm from '@/components/SajuForm';
import RecentHistory from '@/components/RecentHistory';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 overflow-x-hidden">
      <Navbar />
      
      <section className="relative px-6 py-16 md:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        {/* 히어로 텍스트 영역 */}
        <div className="flex-[1.2] text-center lg:text-left space-y-12 order-2 lg:order-1">
          <div className="space-y-6">
            {/* 상단 보조 문구 */}
            <p className="text-gold-500/80 text-xs md:text-sm font-bold tracking-[0.3em] uppercase lg:ml-1">
              Deep Insight & Modern Analysis
            </p>
            
            {/* 메인 타이틀 - 절대 깨지지 않는 2줄 고정 레이아웃 */}
            <h1 className="font-bold text-gray-100 leading-[1.2] tracking-tight text-serif break-keep">
              <span className="block text-[7.5vw] sm:text-5xl md:text-6xl lg:text-7xl font-light opacity-90 whitespace-nowrap">
                명리학으로 다시 그리는
              </span>
              <span className="block text-[8.5vw] sm:text-6xl md:text-7xl lg:text-8xl mt-2 md:mt-4 whitespace-nowrap">
                당신의 <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600 drop-shadow-sm">인생 지도</span>
              </span>
            </h1>
          </div>

          {/* 본문 설명 */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-[1.8] font-light break-keep">
            오래된 관습을 넘어 데이터와 심리학의 관점으로 접근합니다. <br className="hidden md:block"/>
            당신이 타고난 <span className="text-gray-200 font-normal">고유한 기질</span>과 <span className="text-gray-200 font-normal">운명의 흐름</span>을 <br className="hidden md:block"/>
            현대적인 통찰로 섬세하게 큐레이션 해드립니다.
          </p>
          
          {/* 하단 특징 포인트 */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-4 pt-2">
            {['성격 분석', 'AI 심층 상담', '운세 가이드'].map((item) => (
              <div key={item} className="flex items-center gap-2 group cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-600/40 group-hover:bg-gold-50 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 입력 폼 영역 */}
        <div className="flex-1 w-full max-w-lg order-1 lg:order-2 space-y-8">
          <div className="relative p-[1px] rounded-[2.6rem] bg-gradient-to-b from-white/15 to-transparent shadow-2xl">
            <SajuForm />
          </div>
          <RecentHistory />
        </div>
      </section>

      {/* 배경 장식 */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 blur-[180px] rounded-full z-[-1] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold-900/5 blur-[180px] rounded-full z-[-1] pointer-events-none" />
    </main>
  );
}
