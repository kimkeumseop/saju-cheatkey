import Link from 'next/link';
import { Sparkles, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FEE500] rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-[#3C1E1E]" />
              </div>
              <span className="text-xl font-black text-[#3C1E1E] tracking-tight">사주 치트키</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm break-keep">
              사주 치트키는 2030 세대를 위한 트렌디하고 직관적인 AI 사주 분석 서비스입니다. 
              어려운 명리학 용어 대신 당신의 삶에 바로 와닿는 뼈 때리는 조언을 제공합니다.
            </p>
          </div>

          {/* 링크 섹션 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-bold">
              <li><Link href="/column/1" className="hover:text-[#3C1E1E] transition-colors">명리 심리 칼럼</Link></li>
              <li><Link href="/column/2" className="hover:text-[#3C1E1E] transition-colors">2030 운세 트렌드</Link></li>
              <li><Link href="/column/3" className="hover:text-[#3C1E1E] transition-colors">2026년 대비 가이드</Link></li>
            </ul>
          </div>

          {/* 링크 섹션 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">법적 고지</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-bold">
              <li><Link href="/privacy" className="hover:text-[#3C1E1E] transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> 개인정보처리방침</Link></li>
              <li><Link href="/terms" className="hover:text-[#3C1E1E] transition-colors">이용약관</Link></li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> 문의: support@myeongri.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © 2026 LifeCheatKey. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-300 font-black tracking-widest uppercase">Trendy Life Coaching AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
