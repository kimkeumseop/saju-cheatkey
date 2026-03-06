import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "명리커넥트 | 현대적 명리학 & AI 심리 분석 리포트",
  description: "데이터 기반 명리학 엔진과 Gemini AI가 제공하는 프리미엄 사주 분석. 당신의 고유한 기질과 2026년 운명의 흐름을 심리학적 통찰로 풀어드립니다.",
  keywords: ["사주", "명리학", "신년운세", "AI운세", "심리분석", "2026년운세", "무료사주"],
  openGraph: {
    title: "명리커넥트 - 현대적 명리학 심리 분석",
    description: "AI가 그려주는 당신의 인생 지도, 지금 바로 확인하세요.",
    url: "https://saju-cheatkey.vercel.app",
    siteName: "명리커넥트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1059415497859090"
          crossOrigin="anonymous"
        ></script>
        <meta name="google-adsense-account" content="ca-pub-1059415497859090" />
        
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" integrity="sha384-TiCmbV6A3JiR00k/T0AixA1A7yMceX+sUo0DtcX2mRzIfq0tN2A5Y+Z4B5B4j+u" crossOrigin="anonymous" async></script>
      </head>
      <body className="antialiased min-h-screen relative">
        <div className="fixed inset-0 bg-texture z-[-1]" />
        {children}
      </body>
    </html>
  );
}
