'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { X, Mail, Lock, Loader2, Chrome, User as UserIcon } from 'lucide-react';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🛠️ 조치 사항 B: 환경 변수 디버깅용 로그
  useEffect(() => {
    if (isOpen) {
      console.log("🛠️ [Auth Debug] Checking Environment Variables:");
      console.log("- Firebase Config:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.log("- Kakao Key (OIDC):", !!process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "OIDC Provider expected in Firebase Console");
      console.log("- Naver Key (OIDC):", !!process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "OIDC Provider expected in Firebase Console");
      console.log("- Current Origin:", typeof window !== 'undefined' ? window.location.origin : 'N/A');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 🛠️ 조치 사항 A: 소셜 로그인 에러 완벽 대응 및 예외 처리
  const handleSocialLogin = async (providerName: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    setError('');
    try {
      if (providerName === 'google') {
        await loginWithGoogle();
      } else {
        const providerId = providerName === 'kakao' ? 'oidc.kakao' : 'oidc.naver';
        const provider = new OAuthProvider(providerId);
        await signInWithPopup(auth, provider);
      }
      onClose();
    } catch (err: any) {
      console.error(`❌ [Login Error] ${providerName} Failed:`, err);
      
      // auth/cancelled-popup-request: 사용자가 창을 닫음 (조용히 처리)
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.log("팝업이 닫혔거나 다른 요청이 진행 중입니다.");
        setError('로그인이 취소되었습니다.');
        return;
      }

      // KOE101 (카카오 특화) 등 설정 오류 대응
      if (err.message.includes('KOE101')) {
        const msg = "로그인 설정 오류(KOE101): 카카오 앱 관리자 설정(Redirect URI 등)을 확인하세요.";
        alert(msg);
        setError(msg);
      } else if (err.code === 'auth/unauthorized-domain') {
        const msg = "승인되지 않은 도메인입니다. Firebase 콘솔 설정을 확인하세요.";
        alert(msg);
        setError(msg);
      } else {
        const msg = `로그인 중 오류가 발생했습니다: ${err.code || 'Unknown'}`;
        alert(msg);
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name) throw new Error('이름을 입력해주세요.');
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError('로그인 정보가 올바르지 않거나 통신 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. 풀스크린 오버레이 모달 레이아웃 (fixed inset-0 z-[100] bg-black/60)
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 w-full h-[100dvh] backdrop-blur-sm px-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm md:max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 탭 (로그인 / 회원가입) */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button 
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 py-5 text-sm font-black transition-all ${!isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}
          >
            로그인
          </button>
          <button 
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 py-5 text-sm font-black transition-all ${isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}
          >
            회원가입
          </button>
        </div>

        {/* 닫기 버튼 (X) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-30 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* 메인 내용 (스크롤 지원) */}
        <div className="p-6 md:p-10 space-y-6 overflow-y-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#3C1E1E] tracking-tight leading-tight">
              {isSignUp ? '환영합니다! 💖' : '내 운명 치트키 ✨'}
            </h2>
            <p className="text-xs text-gray-500 font-bold break-keep">
              {isSignUp ? '3초 만에 가입하고 내 운명 확인하기' : '로그인하고 분석 리포트를 평생 소장하세요.'}
            </p>
          </div>

          {/* 소셜 로그인 섹션 (상단 배치) */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3.5 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              <span>구글로 3초 만에 시작</span>
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => handleSocialLogin('kakao')} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-3.5 rounded-2xl font-bold text-[#3C1E1E] hover:bg-[#FDD000] active:scale-[0.98] transition-all"
              >
                <span className="text-lg">🟡</span> 카카오
              </button>
              <button 
                onClick={() => handleSocialLogin('naver')} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#03C75A] py-3.5 rounded-2xl font-bold text-white hover:bg-[#02b351] active:scale-[0.98] transition-all"
              >
                <span className="text-lg">🟢</span> 네이버
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 bg-white px-2 tracking-widest">OR</div>
          </div>

          {/* 에러 피드백 영역 */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold text-center leading-tight break-keep animate-shake">
              {error}
            </div>
          )}

          {/* 이메일 폼 섹션 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="닉네임" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm transition-all" 
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                placeholder="이메일 주소" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm transition-all" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                placeholder="비밀번호" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm transition-all" 
              />
            </div>
            <button 
              disabled={loading} 
              className="w-full bg-[#3C1E1E] text-white py-4 rounded-2xl font-black text-base shadow-lg hover:bg-[#2A1515] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? '가입하기' : '로그인')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
