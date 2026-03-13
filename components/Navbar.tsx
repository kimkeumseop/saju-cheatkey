'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User as UserIcon, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SITE_NAME } from '@/lib/site';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-pink-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
              <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
            </div>
            <Link href="/" className="text-2xl font-black tracking-tight text-primary-900">
              {SITE_NAME}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-400">
              <Link href="/" className="hover:text-primary-600 transition-colors">홈</Link>
              <Link href="/guide/what-is-saju" className="hover:text-primary-600 transition-colors">가이드</Link>
              <Link href="/faq" className="hover:text-primary-600 transition-colors">FAQ</Link>
              <Link href="/privacy" className="hover:text-primary-600 transition-colors">개인정보처리방침</Link>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-primary-300" />
                  )}
                  <span className="text-sm font-bold text-primary-800 hidden sm:inline">
                    {user.displayName || '운명 개척자'} 님
                  </span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/login')}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-sm font-black hover:bg-primary-700 transition-all active:scale-[0.95] shadow-lg shadow-pink-100"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
