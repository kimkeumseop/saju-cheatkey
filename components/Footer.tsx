import Link from 'next/link';
import { Sparkles, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500" />
              <span className="text-xl font-bold text-gray-100 text-serif tracking-tight">명리커넥트</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm break-keep">
              명리커넥트는 수천 년간 축적된 명리학의 지혜를 현대적인 데이터 분석과 
              심리학적 통찰로 재해석하여, 당신의 삶에 실질적인 가이드를 제공하는 
              프리미엄 운명 분석 서비스입니다.
            </p>
          </div>

          {/* 링크 섹션 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gold-400 transition-colors">사주 분석</Link></li>
              <li><Link href="/" className="hover:text-gold-400 transition-colors">2026년 신년운세</Link></li>
              <li><Link href="/" className="hover:text-gold-400 transition-colors">AI 심층 상담</Link></li>
            </ul>
          </div>

          {/* 링크 섹션 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">법적 고지</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> 개인정보처리방침</Link></li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> 문의: support@myeongri.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2026 MyeongriConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-700 tracking-widest uppercase">Designed for Insight</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
