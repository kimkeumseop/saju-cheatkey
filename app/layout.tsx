import "./globals.css";
import localFont from "next/font/local";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
  fallback: ["-apple-system", "BlinkMacSystemFont", "system-ui", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "무료 사주 · 타로 · MBTI · 궁합 | 사주 치트키",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "생년월일로 무료 사주, AI 타로 카드, MBTI 성격유형 테스트, 궁합까지 한 번에 확인하세요. 2026년 운세를 쉽고 빠르게 알아보는 사주 치트키.",
  keywords: ["무료 사주", "무료 타로", "MBTI 테스트", "무료 궁합", "사주 치트키", "2026년 운세", "사주팔자", "타로 카드", "MBTI 성격유형", "무료 운세"],
  openGraph: {
    title: "무료 사주 · 타로 · MBTI · 궁합 | 사주 치트키",
    description: "생년월일로 무료 사주, AI 타로 카드, MBTI 성격유형 테스트, 궁합까지 한 번에 확인하세요. 2026년 운세를 쉽고 빠르게 알아보는 사주 치트키.",
    url: SITE_URL,
    siteName: SITE_NAME,
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
    <html lang="ko" className={pretendard.variable}>
      <head>
        <meta
          name="google-site-verification"
          content="0QyT_vWbOQThoWqzG6s169d7hucRibvYLSXJCLiBNTE"
        />
        <meta
          name="naver-site-verification"
          content="22ae6644d466da2adf1789aecb23aa40597c4173"
        />
        {/* Firebase / Google API preconnect */}
        <link rel="preconnect" href="https://firebaseapp.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${pretendard.className} antialiased min-h-screen relative pb-20`}>
        <AuthProvider>
          <div className="fixed inset-0 bg-texture z-[-1]" />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
