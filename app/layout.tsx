import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 사주 정보와 해석 가이드`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "사주 치트키는 사주 기초 개념, 오행과 천간지지 해설, 운세 읽는 법을 함께 제공하는 설명형 사주 안내 사이트입니다.",
  keywords: ["사주", "명리학", "신년운세", "인생상담", "심리분석", "2026년운세", "무료사주"],
  openGraph: {
    title: `${SITE_NAME} | 사주 정보와 해석 가이드`,
    description: "사주 기초 개념부터 운세 해석 참고 가이드까지 한곳에서 읽을 수 있는 설명형 콘텐츠를 제공합니다.",
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
        <AuthProvider>
          <div className="fixed inset-0 bg-texture z-[-1]" />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
