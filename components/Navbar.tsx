'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SITE_NAME } from '@/lib/site';

const serviceLinks = [
  { href: '/saju', label: 'SAJU', activeClass: 'bg-primary-50 text-primary-700', inactiveClass: 'text-gray-400 hover:bg-primary-50/60 hover:text-primary-600' },
  { href: '/gunghap', label: 'GUNGHAP', activeClass: 'bg-rose-50 text-rose-600', inactiveClass: 'text-gray-400 hover:bg-rose-50 hover:text-rose-500' },
  { href: '/tarot', label: 'TAROT', activeClass: 'bg-violet-50 text-violet-600', inactiveClass: 'text-gray-400 hover:bg-violet-50 hover:text-violet-500' },
  { href: '/mbti', label: 'MBTI', activeClass: 'bg-emerald-50 text-emerald-600', inactiveClass: 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-500' },
];

const infoLinks = [
  { href: '/guide/what-is-saju', label: 'Guide' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-pink-100/60 bg-white/75 backdrop-blur-xl shadow-[0_1px_20px_rgba(240,101,149,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md shadow-primary-200/40 transition-transform hover:rotate-12"
              style={{ background: 'linear-gradient(135deg, #f783ac, #f06595)' }}
            >
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <Link href="/" className="gradient-text text-2xl font-black tracking-tight">
              {SITE_NAME}
            </Link>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {serviceLinks.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition-all ${active ? item.activeClass : item.inactiveClass}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mx-2 h-4 w-px bg-gray-200" />
            {infoLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="h-6 w-6 rounded-full" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-primary-300" />
                  )}
                  <span className="hidden text-sm font-bold text-primary-800 sm:inline">
                    {user.displayName || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-xl p-2 text-gray-300 transition-all hover:bg-red-50 hover:text-red-400"
                  title="Logout"
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
