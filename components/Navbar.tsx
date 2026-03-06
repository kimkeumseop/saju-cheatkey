import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-2 group">
            <Sparkles className="w-6 h-6 text-gold-500 group-hover:rotate-12 transition-transform" />
            <Link href="/" className="text-2xl font-bold tracking-tight text-gray-100 text-serif">
              명리커넥트
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-gold-400 transition-colors">사주분석</Link>
            <Link href="/privacy" className="hover:text-gold-400 transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
