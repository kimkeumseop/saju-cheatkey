'use client';

import { useEffect } from 'react';

export default function NaverCallback() {
  useEffect(() => {
    // URL 해시(#)에서 access_token 추출
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    const state = params.get('state');

    console.log("[Naver Callback] Token found:", !!accessToken);

    if (accessToken) {
      // 부모 창으로 토큰 전달
      if (window.opener) {
        window.opener.postMessage(
          { type: 'NAVER_AUTH_SUCCESS', accessToken, state },
          window.location.origin
        );
        console.log("[Naver Callback] Message sent to opener");
        
        // 전달 후 아주 잠시 대기 후 팝업 닫기 (통신 안정성 확보)
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        console.error("[Naver Callback] No opener found");
        window.close();
      }
    } else {
      console.error("[Naver Callback] No access token found in URL");
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-rose-600 font-medium">네이버 로그인 확인 중...</p>
      </div>
    </div>
  );
}
