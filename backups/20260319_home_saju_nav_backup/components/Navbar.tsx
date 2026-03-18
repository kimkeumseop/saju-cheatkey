'use client';

import Link from 'next/link';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SITE_NAME } from '@/lib/site';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-pink-100/60 bg-white/75 backdrop-blur-xl shadow-[0_1px_20px_rgba(240,101,149,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-2.5 group">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md shadow-primary-200/40 transition-transform group-hover:rotate-12"
              style={{ background: 'linear-gradient(135deg, #f783ac, #f06595)' }}
            >
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <Link href="/" className="gradient-text text-2xl font-black tracking-tight">
              {SITE_NAME}
            </Link>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden items-center space-x-1 text-sm font-bold text-gray-400 md:flex">
              <Link href="/" className="rounded-xl px-3 py-2 transition-all hover:bg-primary-50/60 hover:text-primary-600">
                홈
              </Link>
              <Link href="/guide/what-is-saju" className="rounded-xl px-3 py-2 transition-all hover:bg-primary-50/60 hover:text-primary-600">
                가이드
              </Link>
              <Link href="/faq" className="rounded-xl px-3 py-2 transition-all hover:bg-primary-50/60 hover:text-primary-600">
                FAQ
              </Link>
              <Link href="/privacy" className="rounded-xl px-3 py-2 transition-all hover:bg-primary-50/60 hover:text-primary-600">
                개인정보처리방침
              </Link>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="h-6 w-6 rounded-full" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-primary-300" />
                  )}
                  <span className="hidden text-sm font-bold text-primary-800 sm:inline">
                    {user.displayName || '사용자'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-xl p-2 text-gray-300 transition-all hover:bg-red-50 hover:text-red-400"
                  title="로그아웃"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
