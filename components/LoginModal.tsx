'use client';

import React, { useState } from 'react';
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

  if (!isOpen) return null;

  // 공통 소셜 로그인 핸들러 (에러 로깅 강화)
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
      console.error(`❌ [Login Error] ${providerName} Login Failed:`, err);
      // 사용자에게 구체적인 에러 코드 알림
      const errorMsg = `로그인 설정 오류 (${err.code}): 관리자에게 문의하세요.\n${err.message}`;
      alert(errorMsg);
      setError(errorMsg);
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
      console.error("❌ [Login Error] Email Login Failed:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 틀렸습니다.');
      } else if (err.code === 'auth/user-not-found') {
        setError('가입되지 않은 이메일입니다.');
      } else {
        setError(err.message || '로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. 전체 화면을 덮는 고정 위치 모달 (화면 쪼개짐 현상 해결)
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* 2. 깔끔한 흰색/파스텔 배경의 단독 페이지급 카드 */}
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 탭 구분 */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-5 text-sm font-black transition-all ${!isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}
          >
            로그인
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-5 text-sm font-black transition-all ${isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}
          >
            회원가입
          </button>
        </div>

        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 md:p-10 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-[#3C1E1E] tracking-tight">
              {isSignUp ? '함께해서 기뻐요! 💖' : '다시 와주셨군요! ✨'}
            </h2>
            <p className="text-sm text-gray-500 font-bold break-keep">
              {isSignUp ? '지금 가입하면 나만의 사주 결과가 저장돼요.' : '로그인하고 내 운명 치트키를 다시 확인하세요.'}
            </p>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3.5 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              <span>구글로 시작하기</span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-3.5 rounded-2xl font-bold text-[#3C1E1E] hover:bg-[#FDD000] transition-all active:scale-[0.98]"
              >
                <span className="text-lg">🟡</span>
                카카오
              </button>
              <button
                onClick={() => handleSocialLogin('naver')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#03C75A] py-3.5 rounded-2xl font-bold text-white hover:bg-[#02b351] transition-all active:scale-[0.98]"
              >
                <span className="text-lg">🟢</span>
                네이버
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-3 text-gray-400 font-black tracking-widest">또는 이메일</span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold text-center leading-tight">
              {error}
            </div>
          )}

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="닉네임"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
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
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="비밀번호"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-[#3C1E1E] text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-brown-100 hover:bg-[#2A1515] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? '무료 가입하기' : '로그인하기')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
