'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SITE_NAME } from '@/lib/site';

const serviceLinks = [
  { href: '/saju',    label: 'SAJU',    neon: '#ff6eb4', lightActive: 'bg-primary-50 text-primary-700',   lightInactive: 'text-gray-400 hover:bg-primary-50/60 hover:text-primary-600' },
  { href: '/gunghap', label: 'GUNGHAP', neon: '#ff4da6', lightActive: 'bg-rose-50 text-rose-600',         lightInactive: 'text-gray-400 hover:bg-rose-50 hover:text-rose-500' },
  { href: '/tarot',   label: 'TAROT',   neon: '#9d8fff', lightActive: 'bg-violet-50 text-violet-600',     lightInactive: 'text-gray-400 hover:bg-violet-50 hover:text-violet-500' },
  { href: '/mbti',    label: 'MBTI',    neon: '#00e5a0', lightActive: 'bg-emerald-50 text-emerald-600',   lightInactive: 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-500' },
];

const infoLinks = [
  { href: '/guide/what-is-saju', label: 'Guide' },
  { href: '/faq',                label: 'FAQ' },
  { href: '/privacy',            label: 'Privacy' },
];

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 z-50 w-full backdrop-blur-xl transition-colors"
      style={
        dark
          ? { background: 'rgba(6,4,15,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 1px 30px rgba(0,0,0,0.5)' }
          : { background: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(240,101,149,0.15)', boxShadow: '0 1px 20px rgba(240,101,149,0.06)' }
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md transition-transform hover:rotate-12"
              style={{ background: 'linear-gradient(135deg, #f783ac, #f06595)', boxShadow: dark ? '0 0 20px rgba(255,110,180,0.35)' : '0 4px 12px rgba(240,101,149,0.35)' }}
            >
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <Link href="/" className="gradient-text text-2xl font-black tracking-tight">
              {SITE_NAME}
            </Link>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {serviceLinks.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              if (dark) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-black transition-all"
                    style={
                      active
                        ? { color: item.neon, background: `${item.neon}15`, textShadow: `0 0 12px ${item.neon}60` }
                        : { color: 'rgba(255,255,255,0.45)' }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = item.neon;
                        (e.currentTarget as HTMLAnchorElement).style.background = `${item.neon}10`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition-all ${active ? item.lightActive : item.lightInactive}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className={`mx-2 h-4 w-px ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
            {infoLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  dark
                    ? 'text-white/30 hover:text-white/60 hover:bg-white/5'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={
                    dark
                      ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
                      : { background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)' }
                  }
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="h-6 w-6 rounded-full" />
                  ) : (
                    <UserIcon className={`h-5 w-5 ${dark ? 'text-white/40' : 'text-primary-300'}`} />
                  )}
                  <span className={`hidden text-sm font-bold sm:inline ${dark ? 'text-white/70' : 'text-primary-800'}`}>
                    {user.displayName || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className={`rounded-xl p-2 transition-all ${dark ? 'text-white/20 hover:bg-white/5 hover:text-red-400' : 'text-gray-300 hover:bg-red-50 hover:text-red-400'}`}
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
