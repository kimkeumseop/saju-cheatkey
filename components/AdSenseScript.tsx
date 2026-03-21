import Script from 'next/script';

export default function AdSenseScript() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1059415497859090"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
