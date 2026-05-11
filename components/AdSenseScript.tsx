import Script from 'next/script';

export default function AdSenseScript() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5293766413369655"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
