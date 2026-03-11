'use client';

import { useEffect } from 'react';

export default function NaverCallback() {
  useEffect(() => {
    // URL 해시(#)에서 access_token 추출 (네이버는 token 방식일 때 hash로 전달)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (accessToken) {
      // 부모 창으로 토큰 전달
      window.opener.postMessage(
        { type: 'NAVER_AUTH_SUCCESS', accessToken, state },
        window.location.origin
      );
      // 전달 후 팝업 닫기
      window.close();
    } else {
      console.error('네이버 엑세스 토큰을 찾을 수 없습니다.');
      window.close();
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-rose-600 font-medium">네이버 로그인 처리 중...</p>
      </div>
    </div>
  );
}
