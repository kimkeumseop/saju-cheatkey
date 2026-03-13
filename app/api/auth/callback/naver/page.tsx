'use client';

import { useEffect } from 'react';

export default function NaverCallback() {
  useEffect(() => {
    let completed = false;

    const notifyAndFinish = (message: { type: string; accessToken?: string; state?: string }) => {
      if (window.opener) {
        window.opener.postMessage(message, window.location.origin);
      }
    };

    // URL 해시(#)에서 access_token 추출
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    const state = params.get('state');

    console.log("[Naver Callback] Token found:", !!accessToken);

    if (accessToken) {
      completed = true;
      notifyAndFinish({ type: 'NAVER_AUTH_SUCCESS', accessToken, state });
      console.log("[Naver Callback] Message sent to opener");
    } else {
      console.error("[Naver Callback] No access token found in URL");
    }

    return () => {
      if (!completed) {
        notifyAndFinish({ type: 'NAVER_AUTH_CLOSED' });
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-rose-600 font-medium">네이버 로그인 확인 중...</p>
        <p className="mt-3 text-sm text-rose-400">완료되면 이 창을 닫아주세요.</p>
      </div>
    </div>
  );
}
