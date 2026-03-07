import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[#FEE500] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6 text-[#3C1E1E]" />
            </div>
            <Link href="/" className="text-2xl font-black tracking-tight text-[#3C1E1E]">
              명리커넥트
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-500">
            <Link href="/" className="hover:text-[#3C1E1E] transition-colors">사주분석</Link>
            <Link href="/privacy" className="hover:text-[#3C1E1E] transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
