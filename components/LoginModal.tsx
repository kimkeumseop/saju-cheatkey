'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { X, Mail, Lock, Loader2, Heart } from 'lucide-react';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth, hasFirebasePublicConfig } from '@/lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithNaver, loginWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSocialLogin = async (providerName: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    setError('');
    try {
      if (providerName === 'google') {
        await loginWithGoogle();
      } else if (providerName === 'naver') {
        await loginWithNaver();
      } else {
        // Kakao or other OIDC providers
        if (!auth || !hasFirebasePublicConfig) {
          throw new Error('Firebase auth is not configured.');
        }
        const providerId = 'oidc.kakao';
        const provider = new OAuthProvider(providerId);
        await signInWithPopup(auth, provider);
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('로그인이 취소되었습니다.');
        return;
      }
      setError(`로그인 오류: ${err.code || '알 수 없는 에러'}`);
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
      if (err.code === 'auth/email-already-in-use') setError('이미 사용 중인 이메일입니다.');
      else setError('로그인 정보가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* 상단 탭 */}
        <div className="flex border-b border-pink-50 bg-primary-50/30">
          <button 
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 py-5 text-sm font-black transition-all ${!isSignUp ? 'text-primary-900 bg-white border-b-4 border-primary-500' : 'text-gray-400'}`}
          >
            로그인
          </button>
          <button 
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 py-5 text-sm font-black transition-all ${isSignUp ? 'text-primary-900 bg-white border-b-4 border-primary-500' : 'text-gray-400'}`}
          >
            회원가입
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-pink-50 transition-colors z-10"><X className="w-5 h-5 text-primary-200" /></button>

        <div className="p-8 md:p-10 space-y-8 max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
            </div>
            <h2 className="text-2xl font-black text-primary-900 tracking-tight leading-tight">
              {isSignUp ? '반가워요! 💖' : '운명의 치트키 ✨'}
            </h2>
            <p className="text-xs text-primary-300 font-bold">로그인하고 나만의 분석 리포트를 확인하세요.</p>
          </div>

          {/* 소셜 로그인 섹션 - 로고 강화 디자인 */}
          <div className="space-y-3">
            {/* Google */}
            <button 
              onClick={() => handleSocialLogin('google')} 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Google로 시작하기</span>
            </button>

            {/* Kakao */}
            <button 
              onClick={() => handleSocialLogin('kakao')} 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] py-4 rounded-2xl font-black text-[#3C1E1E] hover:bg-[#FDD000] active:scale-[0.98] transition-all shadow-sm"
            >
              <svg className="w-5 h-5 fill-[#3C1E1E]" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.712 4.8 4.346 6.09-.193.662-.7 2.392-.802 2.748-.128.446.148.44.31.33.125-.085 1.99-1.352 2.783-1.89.773.225 1.593.34 2.363.34 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
              </svg>
              <span>카카오로 시작하기</span>
            </button>

            {/* Naver */}
            <button 
              onClick={() => handleSocialLogin('naver')} 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 bg-[#03C75A] py-4 rounded-2xl font-black text-white hover:bg-[#02b351] active:scale-[0.98] transition-all shadow-sm"
            >
              <span className="w-5 h-5 bg-white text-[#03C75A] rounded-sm flex items-center justify-center text-[12px] font-black leading-none">N</span>
              <span>네이버로 시작하기</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-pink-50"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-primary-200 bg-white px-4 tracking-widest">OR</div>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-500 text-xs font-bold text-center animate-shake">{error}</div>}

          {/* 이메일 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input type="text" placeholder="닉네임" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-primary-50 border-2 border-transparent focus:border-primary-300 focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
              <input type="email" placeholder="이메일 주소" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-primary-50 border-2 border-transparent focus:border-primary-300 focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
              <input type="password" placeholder="비밀번호" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-primary-50 border-2 border-transparent focus:border-primary-300 focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
            </div>
            <button disabled={loading} className="w-full bg-primary-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? '가입하기' : '로그인')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
