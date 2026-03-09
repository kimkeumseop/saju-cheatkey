'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { X, Mail, Lock, Loader2, Chrome, User as UserIcon, ArrowLeft } from 'lucide-react';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

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
      router.push('/');
    } catch (err: any) {
      console.error(`❌ [Login Error] ${providerName} Failed:`, err);
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('로그인이 취소되었습니다.');
        return;
      }
      setError(`${providerName} 로그인 설정 오류: 관리자에게 문의하세요.`);
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
      router.push('/');
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? '이미 사용 중인 이메일입니다.' : '로그인 정보가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button onClick={() => router.push('/')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#3C1E1E] transition-colors font-bold text-sm group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          메인으로 돌아가기
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-100 shrink-0">
            <button onClick={() => { setIsSignUp(false); setError(''); }} className={`flex-1 py-6 text-sm font-black transition-all ${!isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}>로그인</button>
            <button onClick={() => { setIsSignUp(true); setError(''); }} className={`flex-1 py-6 text-sm font-black transition-all ${isSignUp ? 'text-[#3C1E1E] bg-white border-b-4 border-[#FEE500]' : 'text-gray-400 bg-gray-50'}`}>회원가입</button>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-[#3C1E1E] tracking-tight leading-tight">{isSignUp ? '함께해서 기뻐요! 💖' : '다시 와주셨군요! ✨'}</h1>
              <p className="text-sm text-gray-500 font-bold break-keep">{isSignUp ? '3초 만에 가입하고 내 운명 확인하기' : '로그인하고 내 운명 치트키를 평생 소장하세요.'}</p>
            </div>

            {/* 소셜 로그인 섹션 - 로고 이미지 추가 */}
            <div className="space-y-3">
              {/* 구글 로그인 */}
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all active:scale-[0.98] shadow-sm group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>구글로 시작하기</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* 카카오 로그인 */}
                <button 
                  onClick={() => handleSocialLogin('kakao')} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-4 rounded-2xl font-bold text-[#3C1E1E] hover:bg-[#FDD000] active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 3.18-9 7 0 3.22 2.85 5.92 6.72 6.74-.24.84-1.52 5.34-1.55 5.54 0 0-.02.18.1.25.1.07.24.03.24.03.28-.04 3.2-2.16 4.44-3.01.35.03.7.05 1.05.05 4.97 0 9-3.18 9-7s-4.03-7-9-7z" />
                  </svg>
                  <span>카카오</span>
                </button>

                {/* 네이버 로그인 */}
                <button 
                  onClick={() => handleSocialLogin('naver')} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#03C75A] py-4 rounded-2xl font-bold text-white hover:bg-[#02b351] active:scale-[0.98] transition-all"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                  </svg>
                  <span>네이버</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 bg-white px-4 tracking-widest">OR</div>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold text-center leading-tight break-keep animate-shake">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="닉네임" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" placeholder="이메일 주소" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" placeholder="비밀번호" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FEE500] focus:bg-white rounded-2xl outline-none text-sm font-bold transition-all" />
              </div>
              <button disabled={loading} className="w-full bg-[#3C1E1E] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-[#2A1515] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? '가입하기' : '로그인하기')}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400 font-bold">
          로그인 시 <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
