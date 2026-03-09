'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { X, Mail, Lock, Loader2, Chrome, User as UserIcon } from 'lucide-react';

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError('구글 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      const provider = new OAuthProvider('oidc.kakao');
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('카카오 로그인 설정이 필요합니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      const provider = new OAuthProvider('oidc.naver');
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('네이버 로그인 설정이 필요합니다.');
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
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 cursor-default"
      >
        {/* 상단 탭 */}
        <div className="flex border-b border-gray-100">
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

        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 md:p-10 pt-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-[#3C1E1E] tracking-tight">
              {isSignUp ? '환영해요! 💖' : '반가워요! ✨'}
            </h2>
            <p className="text-sm text-gray-500 font-bold break-keep">
              {isSignUp ? '3초 만에 가입하고 내 운명 확인하기' : '내 운명 치트키를 평생 소장하세요.'}
            </p>
          </div>

          {/* 소셜 로그인 버튼 (항상 노출) */}
          <div className="space-y-2.5">
            {/* 구글 로그인 버튼 - 디자인 강화 */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3.5 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              <span>구글로 시작하기</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleKakaoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-3.5 rounded-2xl font-bold text-[#3C1E1E] hover:bg-[#FDD000] transition-all active:scale-[0.98]"
              >
                <span className="text-lg">🟡</span>
                카카오
              </button>
              <button
                onClick={handleNaverLogin}
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
            <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold text-center animate-shake">
              {error}
            </div>
          )}

          {/* 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
