'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import LoginModal from './LoginModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[#FEE500] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6 text-[#3C1E1E]" />
            </div>
            <Link href="/" className="text-2xl font-black tracking-tight text-[#3C1E1E]">
              사주 치트키
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-500">
              <Link href="/" className="hover:text-[#3C1E1E] transition-colors">사주분석</Link>
              <Link href="/privacy" className="hover:text-[#3C1E1E] transition-colors">개인정보처리방침</Link>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                    {user.displayName || '운명 개척자'} 님
                  </span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#3C1E1E] text-white px-5 py-2.5 rounded-2xl text-sm font-black hover:bg-[#2A1515] transition-all active:scale-[0.95] shadow-md shadow-brown-100"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
}
