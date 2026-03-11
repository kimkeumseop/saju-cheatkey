import Link from 'next/link';
import { Sparkles, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-transparent border-t border-pink-50 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-primary-500 fill-primary-500" />
              </div>
              <span className="text-xl font-black text-primary-900 tracking-tight">사주 치트키</span>
            </div>
            <p className="text-primary-300 text-sm font-medium leading-relaxed max-w-sm break-keep">
              사주 치트키는 2030 세대를 위한 트렌디하고 직관적인 명리 심리 서비스입니다. 
              어려운 명리학 용어 대신 당신의 삶에 바로 와닿는 다정하고 깊이 있는 조언을 제공합니다.
            </p>
          </div>

          {/* 링크 섹션 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary-800 uppercase tracking-widest">서비스</h4>
            <ul className="space-y-2 text-sm text-primary-200 font-bold">
              <li><Link href="/" className="hover:text-primary-600 transition-colors">나의 사주 분석</Link></li>
              <li><Link href="/" className="hover:text-primary-600 transition-colors">운명 궁합 확인</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">오늘의 속삭임</Link></li>
            </ul>
          </div>

          {/* 링크 섹션 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary-800 uppercase tracking-widest">법적 고지</h4>
            <ul className="space-y-2 text-sm text-primary-200 font-bold">
              <li><Link href="/privacy" className="hover:text-primary-600 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> 개인정보처리방침</Link></li>
              <li><Link href="/terms" className="hover:text-primary-600 transition-colors">이용약관</Link></li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> 문의: sajucheatkey@google.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-pink-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-200 font-medium">
            © 2026 LifeCheatKey. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-primary-100 font-black tracking-widest uppercase italic">Your Destiny Guide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
