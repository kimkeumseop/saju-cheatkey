'use client';

import { useState } from 'react';
import { Sparkles, Heart, Zap, ChevronRight, AlertCircle, Layout, BarChart3, Star, History, Coins, Moon } from 'lucide-react';
import AnalysisAccordion from './AnalysisAccordion';
import ShareButtons from './ShareButtons';
import PaymentWidget from './PaymentWidget';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/lib/auth';
import { ELEMENT_STYLE } from '@/lib/saju';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 안전하게 색상을 가져오는 헬퍼 함수
const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

function PillarChart({ pillars, title, themeColor = 'primary' }: { pillars: any[], title?: string, themeColor?: 'primary' | 'blue' | 'pink' }) {
  const borderColor = themeColor === 'blue' ? 'border-blue-200' : themeColor === 'pink' ? 'border-pink-200' : 'border-primary-200';
  
  return (
    <div className="space-y-4">
      {title && <h4 className="text-center font-black text-primary-900 text-sm md:text-base">{title}</h4>}
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          const ganStyle = p.ganColor || getSafeColor(p.ganElement);
          const zhiStyle = p.zhiColor || getSafeColor(p.zhiElement);

          return (
            <div key={colIdx} className="space-y-2">
              <div className="text-center space-y-0.5">
                <div className="text-[8px] md:text-[10px] font-black text-gray-300 tracking-tighter opacity-80 uppercase">{p.label}</div>
                <div className="text-[9px] md:text-[11px] font-black text-primary-800">{p.tenGodGan}</div>
              </div>
              
              <div className="space-y-1.5 md:space-y-3">
                <div className={cn(
                  ganStyle.bg, ganStyle.text,
                  "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border-[2px] md:border-[3px] transition-all",
                  isDayPillar ? cn("scale-105 z-10", borderColor) : "border-white"
                )}>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight">
                    {p.isUnknown ? '?' : p.ganKo}
                  </span>
                </div>
                <div className={cn(
                  zhiStyle.bg, zhiStyle.text,
                  "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border-[2px] md:border-[3px] border-white"
                )}>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight relative z-10">
                    {p.isUnknown ? '?' : p.zhiKo}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-0.5 mt-1">
                <div className="text-[9px] md:text-[11px] font-black text-primary-800">{p.tenGodZhi}</div>
                <div className="text-[8px] md:text-[10px] font-bold text-primary-300">{p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompatibilityScore({ score = 0 }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-rose-500 bg-rose-50 border-rose-100';
    if (s >= 70) return 'text-orange-500 bg-orange-50 border-orange-100';
    if (s >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-gray-500 bg-gray-50 border-gray-100';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return '천생연분';
    if (s >= 70) return '아주 좋음';
    if (s >= 50) return '노력 필요';
    return '위험 구간';
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      {/* 배경 장식 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <Heart className="w-64 h-64 text-primary-500 fill-current" />
      </div>

      <div className="relative z-10 space-y-2 text-center">
        <p className="text-[10px] font-black text-primary-300 uppercase tracking-[0.3em]">Destiny Score</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-7xl md:text-8xl font-black text-primary-900 tracking-tighter">{score}</span>
          <span className="text-2xl md:text-3xl font-black text-primary-400 mt-4">점</span>
        </div>
        <div className={cn("inline-block px-4 py-1.5 rounded-full text-xs font-black border shadow-sm", getScoreColor(score))}>
          {getScoreLabel(score)}
        </div>
      </div>

      {/* 게이지 바 */}
      <div className="w-full max-w-[200px] h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-300 to-primary-600 rounded-full transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface GungHapPreviewProps {
  data: any;
  resultId: string;
}

export default function GungHapPreview({ data, resultId }: GungHapPreviewProps) {
  const { user1, user2, saju1, saju2, aiResult, isPaid, relation } = data;
  const { userCheatKeys } = useAuth();
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  const score = aiResult?.compatibilityScore || 0;

  const relationLabels: Record<string, string> = {
    friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자',
    'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
    family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료',
    partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
  };

  return (
    <div className="space-y-10">
      {/* 1. 상단 결제 배너 (미결제 시) */}
      {!isPaid && (
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-pink-50 space-y-8 relative overflow-hidden mt-8">
          <div className="flex items-center justify-between bg-primary-50 p-6 rounded-3xl border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-500 font-black italic">P</div>
              <div>
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">필요 치트키</p>
                <p className="text-lg font-black text-primary-900">777 원</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">상태</p>
              <p className="text-lg font-black text-primary-600 flex items-center gap-1 justify-end"><Zap className="w-4 h-4 fill-primary-500" />잠금됨</p>
            </div>
          </div>

          <div className="bg-primary-900 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden group">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-center gap-2 text-primary-200">
                <Sparkles className="w-6 h-6 fill-primary-300 text-primary-300" />
                <span className="font-black text-xs tracking-widest uppercase">Premium Insight</span>
              </div>
              <h2 className="text-white text-2xl md:text-3xl font-black leading-tight">
                두 사람의 <span className="text-primary-300 underline decoration-primary-200 decoration-4 underline-offset-4">진짜 속마음</span>과 <br/>
                미래를 지금 바로 확인하세요!
              </h2>
              <button 
                onClick={() => setShowPaymentWidget(true)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3"
              >
                결제하고 분석 열기 (777원)
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentWidget && (
        <PaymentWidget resultId={resultId} onCancel={() => setShowPaymentWidget(false)} />
      )}

      {/* 2. 궁합 점수 게이지 (최상단) */}
      {isPaid && (
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-pink-50 animate-in zoom-in-95 duration-700">
          <CompatibilityScore score={score} />
        </div>
      )}

      {/* 3. 정보 요약 비교 */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { user: user1, saju: saju1, color: 'blue' },
          { user: user2, saju: saju2, color: 'pink' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", idx === 0 ? "bg-blue-400" : "bg-pink-400")} />
                <span className="text-[10px] font-black text-primary-200 uppercase tracking-widest">{idx === 0 ? '나' : '그대'}</span>
              </div>
              <span className="text-[10px] font-black text-primary-800">{item.saju.dayGanKo}일간</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-primary-900">{item.user.name}</p>
              <p className="text-[10px] text-primary-300 font-bold">{item.user.birthDate}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 bg-white py-4 rounded-2xl border border-pink-50 shadow-sm">
        <Heart className="w-5 h-5 text-rose-500 fill-current" />
        <span className="font-black text-primary-900">관계: {relationLabels[relation] || '궁합'}</span>
      </div>

      {/* 4. 양방향 만세력 표 */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-pink-50 space-y-12">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-primary-900 tracking-tight">영혼의 설계도 대조</h3>
          <p className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Destiny Matching INFOGRAPHIC</p>
        </div>

        <div className="space-y-16">
          <div className="space-y-6">
            <PillarChart pillars={saju1.pillars} title={`${user1.name}님의 기운`} themeColor="blue" />
            <div className="flex flex-wrap justify-center gap-2">
              {saju1.keyShinsal.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black border border-blue-100">#{s}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center py-2 relative">
            <div className="h-px bg-pink-100 flex-1" />
            <div className="px-6 py-2 bg-primary-50 rounded-full text-[10px] font-black text-primary-400 italic flex items-center gap-2 shadow-sm border border-pink-100">
              <Moon className="w-3 h-3 fill-primary-300" /> WHISPER OF FATE
            </div>
            <div className="h-px bg-pink-100 flex-1" />
          </div>

          <div className="space-y-6">
            <PillarChart pillars={saju2.pillars} title={`${user2.name}님의 기운`} themeColor="pink" />
            <div className="flex flex-wrap justify-center gap-2">
              {saju2.keyShinsal.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">#{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 분석 결과 */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 ml-2">
          <Moon className="w-6 h-6 text-primary-600 fill-primary-600" />
          <h3 className="text-2xl font-bold text-gray-900">운명의 속삭임 (궁합)</h3>
        </div>

        {isPaid ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {(() => {
              const result = aiResult || {};
              const themes = [
                { key: 'headline', theme: '운명의 한 줄', icon: '📢' },
                { key: 'deepAnalysis', theme: '시너지 분석', icon: '🧬' },
                { key: 'secretThought', theme: '속마음 팩폭', icon: '🧠' },
                { key: 'cheatKey', theme: '관계의 치트키', icon: '🗓️' }
              ];
              const displayData = themes.map(t => ({
                theme: t.theme,
                title: '',
                icon: t.icon,
                content: result[t.key] || '분석 중...'
              }));
              return <AnalysisAccordion data={displayData} />;
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-pink-50 space-y-10 relative overflow-hidden text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary-500 font-black text-sm uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                잠재된 인연의 비밀
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-primary-900 leading-tight break-keep">
                "두 사람의 운명이 <br/> <span className="text-rose-500 underline underline-offset-4 decoration-rose-200">뒤섞이며 생기는 변화</span>를 아시나요?"
              </h4>
              <p className="text-primary-300 font-bold leading-relaxed text-sm">
                사주 원국 대조 결과, 서로의 결핍을 채워주면서도 <br/> 때로는 강하게 충돌하는 특별한 기운이 발견되었습니다.
              </p>
            </div>
            <div className="space-y-6 opacity-30 blur-[8px] pointer-events-none select-none">
              <div className="h-4 bg-primary-50 rounded-full w-full" />
              <div className="h-4 bg-primary-50 rounded-full w-5/6" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm text-center">
        <ShareButtons name={`${user1.name} & ${user2.name}`} />
      </div>
    </div>
  );
}
