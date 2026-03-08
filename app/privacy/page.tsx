import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 overflow-x-hidden">
      <Navbar />
      
      <section className="px-6 py-16 max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 text-serif">개인정보처리방침</h1>
          <p className="text-gray-500 text-sm">최종 수정일: 2026년 3월 6일</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">1. 개인정보의 수집 항목 및 목적</h2>
            <p>
              본 서비스는 사용자의 사주 분석을 위해 성함, 생년월일, 출생 시간, 성별 정보를 입력받습니다. 
              입력된 정보는 오직 사주 분석 결과 생성 및 AI 상담을 위해서만 사용되며, 서버에 영구적으로 저장되지 않습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">2. 구글 애드센스 및 쿠키 사용</h2>
            <p>
              본 웹사이트는 Google에서 제공하는 웹 분석 서비스인 구글 애드센스(Google AdSense)를 사용합니다. 
              Google은 사용자가 본 웹사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 광고를 제공하기 위해 쿠키(Cookie)를 사용합니다.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Google은 광고 쿠키를 사용하여 사용자의 본 서비스 방문 데이터를 기반으로 맞춤형 광고를 게재합니다.</li>
              <li>사용자는 Google의 <a href="https://adssettings.google.com" className="text-gold-500 underline">광고 설정</a>을 방문하여 맞춤 설정된 광고를 해제할 수 있습니다.</li>
              <li>쿠키는 브라우저 설정을 통해 거부할 수 있으나, 서비스 이용에 일부 제한이 있을 수 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">3. 데이터 보안 및 제3자 제공</h2>
            <p>
              사용자가 입력한 정보는 사주 분석 엔진(lunar-javascript) 및 AI 모델(Google Gemini)에 전달되어 처리가 이루어집니다. 
              사주 치트키는 사용자의 개인정보를 외부에 판매하거나 무단으로 공유하지 않습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">4. 문의처</h2>
            <p>
              본 방침과 관련하여 궁금한 점이 있으시면 하단의 고객지원 이메일(support@myeongri.com)로 연락주시기 바랍니다.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
