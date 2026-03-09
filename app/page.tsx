import Navbar from '@/components/Navbar';
import SajuForm from '@/components/SajuForm';
import Footer from '@/components/Footer';
import { BookOpen, BarChart3, Shield, Info } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] pt-20 overflow-x-hidden">
      <Navbar />
      
      {/* 히어로 섹션 */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        <div className="flex-[1.2] text-center lg:text-left space-y-10 order-2 lg:order-1">
          <div className="space-y-6">
            <p className="text-[#3C1E1E] bg-[#FEE500] inline-block px-4 py-1.5 rounded-full text-xs md:text-sm font-black tracking-wider uppercase shadow-sm">
              Trend-Forward Saju Analysis
            </p>
            <h1 className="font-black text-gray-900 leading-[1.1] tracking-tight break-keep">
              <span className="block text-[8vw] sm:text-5xl md:text-6xl lg:text-7xl text-[#3C1E1E]">
                조선시대 MBTI로
              </span>
              <span className="block text-[10vw] sm:text-6xl md:text-7xl lg:text-8xl mt-2">
                <span className="text-[#FEE500] drop-shadow-[0_4px_0_rgba(60,30,30,1)]">팩폭 당할 준비</span> 됐나요?
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-[1.7] font-medium break-keep">
            어려운 한자는 싹 빼고, 요즘 언어로 소름 돋게 풀어주는 명리학 전문가의 풀이. <br className="hidden md:block"/>
            답답한 인생의 <span className="text-gray-900 font-bold underline decoration-[#FEE500] decoration-8 underline-offset-[-4px]">'치트키'</span>를 켜 드립니다.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
            {[
              '#소름돋는_팩폭_성격', 
              '#답답할_때_고민_해결소', 
              '#2026_버티기_가이드'
            ].map((item) => (
              <span key={item} className="px-5 py-2.5 bg-white rounded-2xl border border-gray-100 text-sm font-black text-[#3C1E1E] shadow-sm">{item}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg order-1 lg:order-2 space-y-8">
          <div className="relative p-2 rounded-[3.5rem] bg-white shadow-2xl border border-gray-100">
            <SajuForm />
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="bg-white border-y border-gray-100 py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* 정보 1 */}
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center shadow-sm">
                <BookOpen className="w-7 h-7 text-[#3C1E1E]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 text-serif tracking-tight">소름 돋는 팩폭 성격</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                내 안의 또 다른 나를 스캔. 겉바속촉 기질부터 숨겨진 똘끼까지 가차 없이 털어드립니다.
              </p>
            </div>

            {/* 정보 2 */}
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center shadow-sm">
                <BarChart3 className="w-7 h-7 text-[#3C1E1E]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 text-serif tracking-tight">답답할 때 고민 해결소</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                명리학 전문가와 1:1 심야 상담을 하듯. 연애 고민부터 퇴사 타이밍까지, 밤잠 설치게 하는 고민들을 명쾌하게 풀어보세요.
              </p>
            </div>

            {/* 정보 3 */}
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center shadow-sm">
                <Shield className="w-7 h-7 text-[#3C1E1E]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 text-serif tracking-tight">2026 버티기 가이드</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm break-keep">
                통장을 스쳐 지나가는 월급, 어떻게 묶어둘까? 2026년 병오년의 흐름을 타고 돈과 운을 끌어당기는 치트키를 확인하세요.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 사주 기초 섹션 */}
      <section className="py-24 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">인생을 바꾸는 8글자의 마법</h2>
          <div className="w-20 h-2 bg-[#FEE500] mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-600 leading-[1.8] font-medium">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-[#3C1E1E] text-xl font-black">
              <Info className="w-5 h-5 text-[#FEE500]" />
              천간과 지지란?
            </h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">
              우리가 태어난 시간은 10개의 천간(하늘 기운)과 12개의 지지(땅 기운)로 기록됩니다. 이를 사주팔자라고 하죠. 사주 치트키는 이를 나무, 태양, 바다와 같은 자연물 비유로 풀어내어 누구나 쉽게 이해할 수 있게 도와줍니다.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 text-[#3C1E1E] text-xl font-black">
              <Info className="w-5 h-5 text-[#FEE500]" />
              2026년 운명 가이드
            </h4>
            <p className="text-sm break-keep leading-relaxed text-gray-500">
              인생은 고정된 게 아닙니다. 흐르는 강물처럼 매년 새로운 기운이 찾아오죠. 2026년 병오년은 강한 불의 기운이 지배하는 해입니다. 당신의 고유한 기질이 이 기운과 만났을 때 생길 변화를 미리 체크해보세요!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
