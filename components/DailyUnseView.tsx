'use client';

import type { ReactNode } from 'react';
import { Star, Heart, CircleDollarSign, Briefcase, Activity, Sparkles, Sun, AlertTriangle, ArrowRight } from 'lucide-react';
import { DAILY_UNSE_CATS, DAILY_UNSE_CAT_LABELS, type DailyUnse, type DailyUnseCatKey } from '@/lib/saju-schema';

// 반 개 단위 별점 (아이보리 테마)
function Stars({ score, size = 16 }: { score: number; size?: number }) {
  const v = Math.max(0, Math.min(5, score));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`별점 ${v.toFixed(1)}/5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute left-0 top-0" style={{ width: size, height: size, color: 'rgba(45,27,30,0.14)' }} />
            <span className="absolute left-0 top-0 overflow-hidden block" style={{ width: fill * size, height: size }}>
              <Star className="block" style={{ width: size, height: size, color: '#d4688a', fill: '#d4688a' }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const CAT_META: Record<DailyUnseCatKey, { icon: ReactNode; accent: string }> = {
  love: { icon: <Heart className="w-4 h-4" />, accent: '#d4688a' },
  money: { icon: <CircleDollarSign className="w-4 h-4" />, accent: '#0e9f73' },
  work: { icon: <Briefcase className="w-4 h-4" />, accent: '#7c6fd6' },
  health: { icon: <Activity className="w-4 h-4" />, accent: '#c2883a' },
};

function fmtDate(date: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return '';
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${Number(m[2])}월 ${Number(m[3])}일 (${days[d.getDay()]})`;
}

export default function DailyUnseView({ daily }: { daily: DailyUnse }) {
  const lucky = daily.lucky;
  const luckyChips = [
    { label: '색', value: lucky.color },
    { label: '숫자', value: lucky.number != null ? String(lucky.number) : '' },
    { label: '아이템', value: lucky.item },
    { label: '방향', value: lucky.direction },
  ].filter((c) => c.value);

  return (
    <div className="space-y-6">
      {/* 오늘 총운 히어로 */}
      <section
        className="rounded-[2rem] p-6 md:p-8 space-y-4"
        style={{ background: 'rgba(212,104,138,0.06)', border: '1px solid rgba(212,104,138,0.18)', boxShadow: '0 10px 30px rgba(212,104,138,0.10)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#d4688a' }}>
            <Sun className="w-4 h-4" />
            오늘의 운세
          </div>
          {daily.date && (
            <span className="text-xs font-bold" style={{ color: 'rgba(45,27,30,0.5)' }}>{fmtDate(daily.date)}</span>
          )}
        </div>
        {daily.headline && (
          <p className="text-xl md:text-2xl font-bold leading-snug break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            {daily.headline}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Stars score={daily.overallScore} size={22} />
          <span className="text-lg font-black" style={{ color: '#d4688a' }}>{daily.overallScore.toFixed(1)}</span>
        </div>
        {daily.message && (
          <p className="text-[14px] md:text-[15px] font-medium leading-[1.85] break-keep whitespace-pre-wrap" style={{ color: 'rgba(45,27,30,0.76)' }}>
            {daily.message}
          </p>
        )}
      </section>

      {/* 카테고리별 별점 */}
      <section className="grid grid-cols-2 gap-3">
        {DAILY_UNSE_CATS.map((k) => {
          const c = daily.categories[k];
          const meta = CAT_META[k];
          return (
            <article
              key={k}
              className="rounded-2xl p-4 space-y-2"
              style={{ background: '#FFFFFF', border: `1px solid ${meta.accent}26`, boxShadow: `0 6px 18px ${meta.accent}0f` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: `${meta.accent}16`, color: meta.accent }}>{meta.icon}</span>
                  <span className="text-sm font-bold" style={{ color: '#2D1B1E' }}>{DAILY_UNSE_CAT_LABELS[k]}</span>
                </div>
                <span className="text-xs font-black" style={{ color: meta.accent }}>{c.score.toFixed(1)}</span>
              </div>
              <Stars score={c.score} size={13} />
              {c.line && (
                <p className="text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.7)' }}>{c.line}</p>
              )}
            </article>
          );
        })}
      </section>

      {/* 행운 포인트 */}
      {luckyChips.length > 0 && (
        <section className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(14,159,115,0.05)', border: '1px solid rgba(14,159,115,0.18)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: '#0e9f73' }} />
            <h3 className="text-sm font-bold" style={{ color: '#2D1B1E' }}>오늘의 행운</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {luckyChips.map((c) => (
              <div key={c.label} className="px-3 py-2 rounded-xl text-center" style={{ background: '#FFFFFF', border: '1px solid rgba(14,159,115,0.2)' }}>
                <div className="text-[10px] font-black" style={{ color: '#0e9f73' }}>{c.label}</div>
                <div className="text-sm font-bold" style={{ color: '#2D1B1E' }}>{c.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 오늘 할 것 / 피할 것 */}
      {(daily.doToday || daily.avoidToday) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {daily.doToday && (
            <div className="rounded-2xl p-4 space-y-1.5" style={{ background: 'rgba(14,159,115,0.06)', border: '1px solid rgba(14,159,115,0.2)' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-black" style={{ color: '#0e9f73' }}>
                <Sparkles className="w-3.5 h-3.5" /> 오늘 하면 좋은 것
              </div>
              <p className="text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.78)' }}>{daily.doToday}</p>
            </div>
          )}
          {daily.avoidToday && (
            <div className="rounded-2xl p-4 space-y-1.5" style={{ background: 'rgba(194,136,58,0.06)', border: '1px solid rgba(194,136,58,0.22)' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-black" style={{ color: '#c2883a' }}>
                <AlertTriangle className="w-3.5 h-3.5" /> 오늘 피할 것
              </div>
              <p className="text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.78)' }}>{daily.avoidToday}</p>
            </div>
          )}
        </section>
      )}

      {/* 내일 미리보기 */}
      {daily.tomorrow && (
        <section className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(124,111,214,0.06)', border: '1px solid rgba(124,111,214,0.2)' }}>
          <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7c6fd6' }} />
          <div className="space-y-0.5">
            <div className="text-[11px] font-black" style={{ color: '#7c6fd6' }}>내일 미리보기</div>
            <p className="text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.78)' }}>{daily.tomorrow}</p>
          </div>
        </section>
      )}
    </div>
  );
}
