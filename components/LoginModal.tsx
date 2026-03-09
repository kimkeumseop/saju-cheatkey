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
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인 창이 닫혔습니다. 다시 시도해 주세요.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('승인되지 않은 도메인입니다. Firebase 콘솔 설정을 확인하세요.');
      } else {
        setError(`${providerName} 로그인 설정 오류: 관리자에게 문의하세요.`);
        alert(`로그인 오류 (${err.code}):\n${err.message}`);
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
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError('로그인 정보가 올바르지 않습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm md:max-w-md rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 탭 */}
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

        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-30">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* 내용 섹션 (스크롤 가능) */}
        <div className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#3C1E1E] tracking-tight leading-tight">
              {isSignUp ? '반가워요! 💖' : '내 운명 치트키 ✨'}
            </h2>
            <p className="text-xs text-gray-500 font-bold">3초 만에 로그인하고 결과를 소장하세요.</p>
          </div>

          {/* 소셜 버튼 (상단 고정) */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3.5 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              <span>구글로 로그인</span>
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => handleSocialLogin('kakao')} className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-3.5 rounded-2xl font-bold text-[#3C1E1E] hover:bg-[#FDD000] active:scale-[0.98] transition-all">
                <span className="text-lg">🟡</span> 카카오
              </button>
              <button onClick={() => handleSocialLogin('naver')} className="w-full flex items-center justify-center gap-2 bg-[#03C75A] py-3.5 rounded-2xl font-bold text-white hover:bg-[#02b351] active:scale-[0.98] transition-all">
                <span className="text-lg">🟢</span> 네이버
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 bg-white px-2">OR</div>
          </div>

          {error && <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold text-center leading-tight break-keep">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="닉네임" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl outline-none text-sm" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="이메일" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl outline-none text-sm" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" placeholder="비밀번호" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl outline-none text-sm" />
            </div>
            <button disabled={loading} className="w-full bg-[#3C1E1E] text-white py-4 rounded-2xl font-black text-base shadow-lg hover:bg-[#2A1515] active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? '가입하기' : '로그인')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
