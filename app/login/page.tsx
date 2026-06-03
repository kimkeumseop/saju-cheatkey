'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { X, Mail, Lock, Loader2, Chrome, User as UserIcon, ArrowLeft } from 'lucide-react';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth, hasFirebasePublicConfig } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const { loginWithGoogle, loginWithNaver, loginWithEmail, signUpWithEmail, user } = useAuth();
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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0d0710' }}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]" style={{ background: 'rgba(232,130,154,0.12)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]" style={{ background: 'rgba(157,143,255,0.1)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button onClick={() => router.push('/')} className="mb-6 flex items-center gap-2 transition-colors font-bold text-sm group text-white/40 hover:text-white/80">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          메인으로 돌아가기
        </button>

        <div
          className="rounded-[2.5rem] overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(26,14,24,0.96), rgba(13,7,16,0.97))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(232,130,154,0.16)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 8px 40px rgba(232,130,154,0.08)',
          }}
        >
          <div className="flex shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { setIsSignUp(false); setError(''); }} className="flex-1 py-6 text-sm font-bold transition-all" style={!isSignUp ? { color: '#f5eef2', background: 'rgba(232,130,154,0.08)', borderBottom: '4px solid #e8829a' } : { color: 'rgba(240,232,238,0.4)' }}>로그인</button>
            <button onClick={() => { setIsSignUp(true); setError(''); }} className="flex-1 py-6 text-sm font-bold transition-all" style={isSignUp ? { color: '#f5eef2', background: 'rgba(232,130,154,0.08)', borderBottom: '4px solid #e8829a' } : { color: 'rgba(240,232,238,0.4)' }}>회원가입</button>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight leading-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>{isSignUp ? '함께해서 기뻐요! 💖' : '다시 와주셨군요! ✨'}</h1>
              <p className="text-sm font-bold break-keep" style={{ color: 'rgba(240,232,238,0.42)' }}>{isSignUp ? '3초 만에 가입하고 내 운명 확인하기' : '로그인하고 내 운명 치트키를 평생 소장하세요.'}</p>
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
              <div className="absolute inset-0 flex items-center"><span className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black px-4 tracking-widest" style={{ color: 'rgba(240,232,238,0.4)', background: '#160c1a' }}>OR</div>
            </div>

            {error && <div className="p-4 rounded-xl text-[13px] font-bold text-center leading-tight break-keep animate-shake" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" placeholder="닉네임" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none text-sm font-bold transition-all bg-white/[0.04] text-[#f5eef2] border border-white/10 focus:border-[#e8829a]/50 placeholder:text-white/30" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="email" placeholder="이메일 주소" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none text-sm font-bold transition-all bg-white/[0.04] text-[#f5eef2] border border-white/10 focus:border-[#e8829a]/50 placeholder:text-white/30" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="password" placeholder="비밀번호" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none text-sm font-bold transition-all bg-white/[0.04] text-[#f5eef2] border border-white/10 focus:border-[#e8829a]/50 placeholder:text-white/30" />
              </div>
              <button disabled={loading} className="w-full text-white py-5 rounded-2xl font-bold text-lg active:scale-[0.98] transition hover:brightness-110 flex items-center justify-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #e8829a, #c2255c)', boxShadow: '0 4px 24px rgba(232,130,154,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? '가입하기' : '로그인하기')}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-8 text-center text-xs font-bold" style={{ color: 'rgba(240,232,238,0.34)' }}>
          로그인 시 <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
