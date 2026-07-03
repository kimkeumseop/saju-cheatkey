'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

// 게시자 콘텐츠가 없는 화면(로그인, 개인화 결과, 테스트 진행 화면)에서는
// 애드센스 스크립트를 로드하지 않는다. (콘텐츠 없는 화면의 광고 정책 대응)
const EXCLUDED_PREFIXES = ['/login', '/result', '/unse/result', '/mbti/test', '/api'];

export default function AdSenseScript() {
  const pathname = usePathname();

  const excluded = EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (excluded) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1059415497859090"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
