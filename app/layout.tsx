import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "명리커넥트 - 현대적 명리학 심리 분석",
  description: "당신의 사주를 현대적인 심리 분석으로 풀어드립니다.",
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
