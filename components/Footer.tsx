import Link from 'next/link';
import { Mail, ShieldCheck, Heart } from 'lucide-react';
import { footerLinks, SITE_EMAIL, SITE_NAME, SITE_TEAM } from '@/lib/site';

interface FooterProps {
  dark?: boolean;
}

export default function Footer({ dark = false }: FooterProps) {
  if (dark) {
    return (
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,110,180,0.15)', border: '1px solid rgba(255,110,180,0.2)' }}>
                  <Heart className="w-4 h-4" style={{ color: '#ff6eb4', fill: '#ff6eb4' }} />
                </div>
                <span className="text-xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>{SITE_NAME}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-sm break-keep" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {SITE_NAME}는 사주 기초 개념, 오행과 천간지지 설명, 운세 해석 참고 가이드를 함께 제공하는 설명형 사주 안내 서비스입니다.
              </p>
              <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>{SITE_TEAM}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>안내</h4>
              <ul className="space-y-2 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <li><Link href={footerLinks.service.href} className="transition-colors hover:text-white/60">{footerLinks.service.label}</Link></li>
                <li><Link href={footerLinks.faq.href} className="transition-colors hover:text-white/60">{footerLinks.faq.label}</Link></li>
                <li><Link href={footerLinks.contact.href} className="transition-colors hover:text-white/60">{footerLinks.contact.label}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>법적 고지</h4>
              <ul className="space-y-2 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <li>
                  <Link href={footerLinks.privacy.href} className="flex items-center gap-1.5 transition-colors hover:text-white/60">
                    <ShieldCheck className="w-3.5 h-3.5" /> {footerLinks.privacy.label}
                  </Link>
                </li>
                <li><Link href={footerLinks.terms.href} className="transition-colors hover:text-white/60">{footerLinks.terms.label}</Link></li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${SITE_EMAIL}`} className="transition-colors hover:text-white/60">문의: {SITE_EMAIL}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © 2026 {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black tracking-widest uppercase italic" style={{ color: 'rgba(255,255,255,0.12)' }}>Your Destiny Guide</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-transparent border-t border-pink-50 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-primary-500 fill-primary-500" />
              </div>
              <span className="text-xl font-black text-primary-900 tracking-tight">{SITE_NAME}</span>
            </div>
            <p className="text-primary-300 text-sm font-medium leading-relaxed max-w-sm break-keep">
              {SITE_NAME}는 사주 기초 개념, 오행과 천간지지 설명, 운세 해석 참고 가이드를 함께 제공하는 설명형 사주 안내 서비스입니다.
            </p>
            <p className="text-xs text-primary-300 font-bold">{SITE_TEAM}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary-800 uppercase tracking-widest">안내</h4>
            <ul className="space-y-2 text-sm text-primary-200 font-bold">
              <li><Link href={footerLinks.service.href} className="hover:text-primary-600 transition-colors">{footerLinks.service.label}</Link></li>
              <li><Link href={footerLinks.faq.href} className="hover:text-primary-600 transition-colors">{footerLinks.faq.label}</Link></li>
              <li><Link href={footerLinks.contact.href} className="hover:text-primary-600 transition-colors">{footerLinks.contact.label}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary-800 uppercase tracking-widest">법적 고지</h4>
            <ul className="space-y-2 text-sm text-primary-200 font-bold">
              <li><Link href={footerLinks.privacy.href} className="hover:text-primary-600 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {footerLinks.privacy.label}</Link></li>
              <li><Link href={footerLinks.terms.href} className="hover:text-primary-600 transition-colors">{footerLinks.terms.label}</Link></li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <a href={`mailto:${SITE_EMAIL}`} className="hover:text-primary-600 transition-colors">문의: {SITE_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-pink-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-200 font-medium">© 2026 {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-primary-100 font-black tracking-widest uppercase italic">Your Destiny Guide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
