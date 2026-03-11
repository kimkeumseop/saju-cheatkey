import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "사주 치트키 | 현대적 명리학 심층 분석 리포트",
  description: "데이터 기반 명리학 엔진과 정통 명리학의 내공이 담긴 프리미엄 사주 분석. 당신의 고유한 기질과 2026년 운명의 흐름을 심리학적 통찰로 풀어드립니다.",
  keywords: ["사주", "명리학", "신년운세", "인생상담", "심리분석", "2026년운세", "무료사주"],
  openGraph: {
    title: "사주 치트키 - 현대적 명리학 심리 분석",
    description: "명리학 전문가가 그려주는 당신의 인생 지도, 지금 바로 확인하세요.",
    url: "https://saju-cheatkey.kr",
    siteName: "사주 치트키",
    locale: "ko_KR",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-1059415497859090",
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
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased min-h-screen relative pb-20">
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1059415497859090"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Kakao SDK */}
        <Script 
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
          strategy="afterInteractive"
        />

        <AuthProvider>
          <div className="fixed inset-0 bg-texture z-[-1]" />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
