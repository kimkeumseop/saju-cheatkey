import Navbar from '@/components/Navbar';
import SajuForm from '@/components/SajuForm';
import RecentHistory from '@/components/RecentHistory';
import Footer from '@/components/Footer';
import { BookOpen, BarChart3, Shield, Info } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 overflow-x-hidden">
      <Navbar />
      
      {/* 히어로 섹션 */}
      <section className="relative px-6 py-16 md:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        <div className="flex-[1.2] text-center lg:text-left space-y-12 order-2 lg:order-1">
          <div className="space-y-6">
            <p className="text-gold-500/80 text-xs md:text-sm font-bold tracking-[0.3em] uppercase lg:ml-1">
              Deep Insight & Modern Analysis
            </p>
            <h1 className="font-bold text-gray-100 leading-[1.2] tracking-tight text-serif break-keep">
              <span className="block text-[7.5vw] sm:text-5xl md:text-6xl lg:text-7xl font-light opacity-90 whitespace-nowrap">
                명리학으로 다시 그리는
              </span>
              <span className="block text-[8.5vw] sm:text-6xl md:text-7xl lg:text-8xl mt-2 md:mt-4 whitespace-nowrap">
                당신의 <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600 drop-shadow-sm">인생 지도</span>
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-[1.8] font-light break-keep">
            오래된 관습을 넘어 데이터와 심리학의 관점으로 접근합니다. <br className="hidden md:block"/>
            당신이 타고난 <span className="text-gray-200 font-normal">고유한 기질</span>과 <span className="text-gray-200 font-normal">운명의 흐름</span>을 <br className="hidden md:block"/>
            현대적인 통찰로 섬세하게 큐레이션 해드립니다.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-4 pt-2">
            {['성격 분석', 'AI 심층 상담', '운세 가이드'].map((item) => (
              <div key={item} className="flex items-center gap-2 group cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-600/40 group-hover:bg-gold-50 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg order-1 lg:order-2 space-y-8">
          <div className="relative p-[1px] rounded-[2.6rem] bg-gradient-to-b from-white/15 to-transparent shadow-2xl">
            <SajuForm />
          </div>
          <RecentHistory />
        </div>
      </section>

      {/* 정적 콘텐츠 섹션 (애드센스 고품질 평가용) */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* 정보 1 */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 text-serif">명리학의 현대적 가치</h3>
              <p className="text-gray-400 leading-relaxed text-sm break-keep">
                명리학은 단순한 점술이 아닌, 생년월일시라는 데이터를 통해 인간의 기질과 환경의 상호작용을 분석하는 동양의 인문학입니다. 우리는 이를 현대 심리학과 결합하여 개인의 잠재력을 발견하는 도구로 활용합니다.
              </p>
            </div>

            {/* 정보 2 */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 text-serif">오행(五行) 분석 시스템</h3>
              <p className="text-gray-400 leading-relaxed text-sm break-keep">
                우주의 구성 요소인 목(木), 화(火), 토(土), 금(金), 수(水)의 균형을 분석합니다. 자신의 사주에 어떤 기운이 강하고 부족한지를 파악함으로써 최적의 진로와 건강, 관계의 해법을 찾을 수 있습니다.
              </p>
            </div>

            {/* 정보 3 */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 text-serif">데이터 기반 AI 통찰</h3>
              <p className="text-gray-400 leading-relaxed text-sm break-keep">
                고도화된 Gemini 2.5 AI는 방대한 명리학 텍스트를 학습하여 사용자 개개인에게 맞춤화된 심층 상담을 제공합니다. 2026년 병오년의 흐름에 맞춘 구체적인 행동 가이드를 만나보세요.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 명리학 상세 지식 섹션 (텍스트 함량 강화) */}
      <section className="py-24 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100 text-serif">삶의 지혜를 담은 8글자, 사주팔자</h2>
          <div className="w-12 h-[1px] bg-gold-500 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 gap-12 text-gray-400 leading-[1.8]">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-gray-200 font-bold">
              <Info className="w-4 h-4 text-gold-500" />
              천간(天干)과 지지(地支)의 이해
            </h4>
            <p className="text-sm break-keep">
              우리가 태어난 시간은 10개의 천간(하늘의 기운)과 12개의 지지(땅의 기운)의 조합으로 기록됩니다. 이를 사주(네 기둥)와 팔자(여덟 글자)라고 부릅니다. 각 글자는 나무, 태양, 바다와 같은 자연물에 비유되며, 이들의 조화와 갈등 속에서 우리의 인생 행로가 그려집니다. 명리커넥트는 이러한 복잡한 기호들을 일반인도 이해하기 쉬운 언어로 풀어드립니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-gray-200 font-bold">
              <Info className="w-4 h-4 text-gold-500" />
              대운(大運)과 세운(歲運)
            </h4>
            <p className="text-sm break-keep">
              인생은 고정된 것이 아니라 흐르는 강물과 같습니다. 10년마다 바뀌는 큰 환경의 변화인 '대운'과 매년 찾아오는 '세운'을 분석하는 것이 중요합니다. 2026년 병오년(丙午年)은 강렬한 불의 기운이 지배하는 해입니다. 당신의 고유한 기질이 이 뜨거운 기운과 만났을 때 어떤 변화가 일어날지 미리 파악하고 준비하시기 바랍니다.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* 배경 장식 */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 blur-[180px] rounded-full z-[-1] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold-900/5 blur-[180px] rounded-full z-[-1] pointer-events-none" />
    </main>
  );
}
