import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "2026년 무료 사주 & 궁합 치트키 | 내 운명 완벽 해설",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "어려운 명리학은 그만! 2026년 무료 사주, 토정비결, 운명 궁합을 현대적으로 풀어낸 프리미엄 비밀 리포트로 만나보세요. 내 사주 치트키로 숨겨진 재물운과 연애운의 흐름을 정확하게 확인하세요.",
  keywords: ["2026년 무료 사주", "무료 토정비결", "사주 치트키", "사주팔자", "명리학", "궁합", "연애운", "재물운", "무료 운세", "운명 테스트"],
  openGraph: {
    title: "2026년 무료 사주 & 궁합 치트키 | 내 운명 완벽 해설",
    description: "어려운 명리학은 그만! 2026년 무료 사주, 토정비결, 운명 궁합을 현대적으로 풀어낸 프리미엄 비밀 리포트로 만나보세요. 내 사주 치트키로 숨겨진 재물운과 연애운의 흐름을 정확하게 확인하세요.",
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
        <meta
          name="google-site-verification"
          content="0QyT_vWbOQThoWqzG6s169d7hucRibvYLSXJCLiBNTE"
        />
        <meta
          name="naver-site-verification"
          content="22ae6644d466da2adf1789aecb23aa40597c4173"
        />
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
