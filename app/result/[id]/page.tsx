'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import InstaStoryButton from '@/components/InstaStoryButton';
import GungHapPreview from '@/components/GungHapPreview';
import GungHapInputModal from '@/components/GungHapInputModal';
import LoginModal from '@/components/LoginModal';
import { Loader2, BarChart3, Star, History, Moon, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ELEMENT_STYLE } from '@/lib/saju';
import { normalizeSajuAiResult } from '@/lib/ai-result';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

// ── 나이 계산 ────────────────────────────────────────────────────
function calcAge(birthDate: string): number {
  if (!birthDate) return 25;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

// ── 만세력 차트 ──────────────────────────────────────────────────
function PillarChart({ pillars, title, isTimeUnknown }: { pillars: any[]; title?: string; isTimeUnknown?: boolean }) {
  return (
    <div className="space-y-6">
      {title && <h4 className="text-center font-black text-primary-900 text-lg">{title}</h4>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          const isTimePillar = p.label === '시주';
          const forceHide = isTimePillar && isTimeUnknown;
          const showDash = p.isUnknown || forceHide;
          const ganStyle = p.ganColor || getSafeColor(p.ganElement);
          const zhiStyle = p.zhiColor || getSafeColor(p.zhiElement);

          return (
            <div key={colIdx} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-primary-200 tracking-tighter opacity-80 uppercase">{p.label}</div>
                <div className="text-[11px] font-black text-primary-800">{showDash ? '-' : p.tenGodGan}</div>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className={cn('relative transition-all duration-500', isDayPillar ? 'scale-105 z-20' : '')}>
                  <div className={cn(ganStyle.bg, ganStyle.text, 'p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px]', isDayPillar ? 'border-primary-300 shadow-xl shadow-primary-200/20' : 'border-white shadow-sm')}>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight">{showDash ? '-' : p.ganKo}</span>
                  </div>
                </div>
                <div className="relative transition-all duration-500">
                  <div className={cn(zhiStyle.bg, zhiStyle.text, 'p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px] border-white shadow-sm overflow-hidden relative')}>
                    {!showDash && <span className="text-xl absolute top-1 right-1 opacity-20">{p.zodiacIcon}</span>}
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight relative z-10">{showDash ? '-' : p.zhiKo}</span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1 mt-2">
                <div className="text-[11px] font-black text-primary-800">{showDash ? '-' : p.tenGodZhi}</div>
                <div className="text-[10px] font-bold text-primary-300">{showDash ? '-' : p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 오행 분포 차트 ────────────────────────────────────────────────
function ElementsChart({ counts }: { counts: any }) {
  const elements = [
    { label: '목', key: '木', color: getSafeColor('木').color, bg: 'bg-[#E8F5E9]' },
    { label: '화', key: '火', color: getSafeColor('火').color, bg: 'bg-[#FFEBEE]' },
    { label: '토', key: '土', color: getSafeColor('土').color, bg: 'bg-[#FFF8E1]' },
    { label: '금', key: '金', color: getSafeColor('金').color, bg: 'bg-[#FAFAFA]' },
    { label: '수', key: '水', color: getSafeColor('水').color, bg: 'bg-[#E3F2FD]' },
  ];
  const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;
  return (
    <div className="grid grid-cols-5 gap-2">
      {elements.map((el) => {
        const count = counts[el.key] || counts[el.label] || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={el.key} className={cn(el.bg, 'p-3 rounded-2xl space-y-2 border border-white/50 text-center')}>
            <span className="text-[10px] font-black text-gray-500">{el.label}</span>
            <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: el.color }} />
            </div>
            <span className="text-xs font-black" style={{ color: el.color }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── 오행 정보 ────────────────────────────────────────────────────
const ELEMENT_INFO: Record<string, { emoji: string; keyword: string; desc: string }> = {
  '木': { emoji: '🌱', keyword: '성장', desc: '새로운 시작과 성장의 에너지' },
  '火': { emoji: '🔥', keyword: '열정', desc: '확산하는 에너지와 빛나는 열정' },
  '土': { emoji: '⛰️', keyword: '안정', desc: '든든한 기반과 중심의 안정' },
  '金': { emoji: '💎', keyword: '결실', desc: '단호한 결단과 빛나는 결실' },
  '水': { emoji: '💧', keyword: '지혜', desc: '깊은 통찰과 유연한 지혜' },
};

const KO_TO_ZH: Record<string, string> = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

// ── 결과 페이지 ──────────────────────────────────────────────────
export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDaeunIdx, setSelectedDaeunIdx] = useState<number | null>(null);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => { window.location.href = '/'; };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData = null;
        if (id.startsWith('local_')) {
          const localData = localStorage.getItem(`saju_result_${id}`);
          if (localData) fetchedData = JSON.parse(localData);
        } else {
          const docSnap = await getDoc(doc(db, 'sajuResults', id));
          if (docSnap.exists()) fetchedData = docSnap.data();
        }
        if (fetchedData) {
          setData(fetchedData);
          // 실제 생년월일로 현재 대운 찾기
          const userAge = fetchedData.birthDate ? calcAge(fetchedData.birthDate) : 25;
          const daeunList: any[] = fetchedData.sajuData?.daYun || [];
          const currentIdx = daeunList.findIndex((dy: any, i: number) => {
            const nextAge = daeunList[i + 1]?.age ?? 100;
            return userAge >= dy.age && userAge < nextAge;
          });
          setSelectedDaeunIdx(currentIdx !== -1 ? currentIdx : 0);
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-12 h-12 text-primary-400 animate-spin stroke-[3]" />
      <p className="mt-4 text-primary-400 font-bold">운명의 속삭임을 듣는 중...</p>
    </div>
  );

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';
  const saju = isCompatibility ? data.saju1 : data.sajuData;
  const isTimeUnknown = data.birthTime === 'unknown' || !data.birthTime;

  const getFilteredElements = (sajuObj: any, unknown: boolean) => {
    if (!unknown) return sajuObj.elementsCount;
    const counts: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
    const ELE_MAP: Record<string, string> = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
    sajuObj.pillars.forEach((p: any) => {
      if (p.label === '시주') return;
      if (ELE_MAP[p.ganElement]) counts[ELE_MAP[p.ganElement]]++;
      if (ELE_MAP[p.zhiElement]) counts[ELE_MAP[p.zhiElement]]++;
    });
    return counts;
  };

  const filteredElements = saju ? getFilteredElements(saju, isTimeUnknown) : null;

  // 주도 오행 키워드 (헤더 서브타이틀용)
  const dominantElementInfo = filteredElements ? (() => {
    const sorted = Object.entries(filteredElements as Record<string, number>).sort(([, a], [, b]) => b - a);
    const topKey = sorted[0]?.[0];
    const zhKey = KO_TO_ZH[topKey] || topKey;
    return ELEMENT_INFO[zhKey] || null;
  })() : null;

  // 현재 대운 인덱스 (스타일 강조용)
  const userAge = data.birthDate ? calcAge(data.birthDate) : 25;
  const daeunList: any[] = saju?.daYun || [];
  const currentDaeunIdx = daeunList.findIndex((dy: any, i: number) => {
    const nextAge = daeunList[i + 1]?.age ?? 100;
    return userAge >= dy.age && userAge < nextAge;
  });

  const handleGungHapClick = () => {
    if (user) setIsGungHapModalOpen(true);
    else setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 px-3 sm:px-4 md:px-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{ ...data, isPaid: true }} resultId={id} />
        ) : (
          <div className="space-y-12">

            {/* ══ 작업 1: 헤더 카피 개선 ══ */}
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shadow-sm">
                <Moon className="w-4 h-4 fill-primary-400 text-primary-400" />
                신비로운 영혼의 리포트
              </div>
              <div className="space-y-3">
                <h1 className="font-black text-gray-900 tracking-tight break-keep leading-tight text-3xl md:text-5xl">
                  <span className="gradient-text">{data.userName}</span>
                  <span className="text-gray-800">, 당신이 아직 모르는</span>
                  <br />
                  <span className="text-primary-900">진짜 자신</span>
                </h1>
                {dominantElementInfo && (
                  <p className="text-primary-500 font-bold text-sm md:text-base">
                    {dominantElementInfo.emoji} 핵심 기운 ·{' '}
                    <span className="text-primary-700 font-black">{dominantElementInfo.keyword}</span>
                    {' '}— {dominantElementInfo.desc}
                  </p>
                )}
                <p className="text-xs font-bold text-primary-300 italic opacity-70">
                  {data.birthDate}
                  {data.birthTime && data.birthTime !== 'unknown' ? ` ${data.birthTime}` : ''}
                </p>
              </div>
            </div>

            {/* 만세력 설계도 */}
            <div className="bg-white p-5 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-pink-50 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="text-center space-y-1 relative z-10">
                <h3 className="text-2xl font-black text-primary-900 tracking-tight text-serif">인생 설계도 (만세력)</h3>
                <p className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Manseyrok INFOGRAPHIC</p>
              </div>
              {saju && <PillarChart pillars={saju.pillars} isTimeUnknown={isTimeUnknown} />}
              <div className="pt-8 border-t border-pink-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <BarChart3 className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-black text-primary-800">오행 분포</span>
                  </div>
                  {filteredElements && <ElementsChart counts={filteredElements} />}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <Star className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-black text-primary-800">핵심 귀인 & 신살</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {saju?.keyShinsal?.map((s: string) => (
                      <div key={s} className="px-4 py-2 rounded-2xl bg-primary-50 text-primary-600 text-[11px] font-black border border-primary-100 shadow-sm">
                        #{s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 작업 5: 대운 세로 타임라인 ══ */}
            <div className="bg-white p-5 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-lg border border-pink-50 space-y-8 relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-500" />
                  <h3 className="text-xl font-black text-primary-900">대운 (10년 주기의 흐름)</h3>
                </div>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed ml-7 break-keep">
                  대운(大運)은 내 인생의 계절이 바뀌는 시점입니다. 각 시기를 눌러 에너지를 확인해보세요.
                </p>
              </div>

              <div className="relative space-y-2">
                {/* 세로 타임라인 선 */}
                <div className="absolute left-[1.2rem] top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary-100 via-primary-300 to-primary-100 opacity-40 pointer-events-none" />

                {daeunList.map((dy: any, idx: number) => {
                  const isCurrent = currentDaeunIdx === idx;
                  const isSelected = selectedDaeunIdx === idx;
                  const ganInfo = ELEMENT_INFO[dy.ganElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const zhiInfo = ELEMENT_INFO[dy.zhiElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const ganStyle = dy.ganColor || getSafeColor(dy.ganElement);
                  const zhiStyle = dy.zhiColor || getSafeColor(dy.zhiElement);

                  return (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {/* 타임라인 도트 */}
                      <div className={cn(
                        'relative z-10 mt-3.5 w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 bg-white',
                        isCurrent
                          ? 'border-primary-500 shadow-lg shadow-primary-200/60 scale-110'
                          : 'border-pink-200'
                      )}>
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-primary-500" />
                        ) : (
                          <span className="text-[10px] font-black text-gray-300">{idx + 1}</span>
                        )}
                      </div>

                      {/* 카드 버튼 */}
                      <button
                        onClick={() => setSelectedDaeunIdx(isSelected ? null : idx)}
                        className={cn(
                          'flex-1 text-left rounded-[1.5rem] border-2 p-4 transition-all duration-300 mb-2',
                          isCurrent
                            ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-md shadow-primary-100/50'
                            : isSelected
                            ? 'border-pink-200 bg-white shadow-sm'
                            : 'border-pink-50 bg-white/80 hover:border-pink-200 hover:bg-white'
                        )}
                      >
                        {/* 카드 상단 행 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-black', isCurrent ? 'text-primary-600' : 'text-gray-400')}>
                              {dy.age}세~
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-black rounded-full leading-none">
                                현재
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <div className={cn(ganStyle.bg, ganStyle.text, 'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm border border-white')}>
                              {dy.ganKo}
                            </div>
                            <div className={cn(zhiStyle.bg, zhiStyle.text, 'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm border border-white')}>
                              {dy.zhiKo}
                            </div>
                          </div>
                        </div>

                        {/* 키워드 행 */}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 font-medium">{ganInfo.emoji} {ganInfo.keyword}</span>
                          <span className="text-gray-300 text-xs">+</span>
                          <span className="text-xs text-gray-500 font-medium">{zhiInfo.emoji} {zhiInfo.keyword}</span>
                        </div>

                        {/* 선택 시 상세 설명 (툴팁 패널) */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-pink-100 space-y-1.5">
                            <p className="text-sm font-bold text-rose-700 break-keep leading-relaxed">
                              &ldquo;<span className="text-primary-600">{ganInfo.keyword}</span>&rdquo;를 바탕으로{' '}
                              &ldquo;<span className="text-primary-600">{zhiInfo.keyword}</span>&rdquo;을 꽃피우는 시기
                            </p>
                            <p className="text-xs text-gray-400">
                              {dy.age}세부터 10년간 흐르는 주된 에너지 · {ganInfo.desc} / {zhiInfo.desc}
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ══ 작업 2·3: 운명의 속삭임 리포트 (AnalysisAccordion) ══ */}
            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2">
                <Moon className="w-6 h-6 text-primary-600 fill-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900">운명의 속삭임 리포트</h3>
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const result = normalizeSajuAiResult(data.aiResult);
                  const storySection = result.sections.find(
                    (s) => s.title.includes('인스타 스토리') || s.title.includes('스토리 요약')
                  );
                  const accordionSections = result.sections.filter((s) => s !== storySection);
                  return (
                    <>
                      <AnalysisAccordion data={accordionSections} />
                      {storySection && (
                        <InstaStoryButton
                          userName={data.userName}
                          summaryContent={storySection.content}
                          type="saju"
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ══ 작업 4: 공유/바이럴 CTA ══ */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-8">
              {/* 친구 궁합 보기 CTA */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-[0.3em]">더 알아보기</p>
                <h4 className="text-xl font-black text-gray-900 break-keep">
                  소중한 인연과의 궁합도 확인해보세요
                </h4>
                <p className="text-sm text-gray-400 break-keep max-w-sm mx-auto">
                  나의 사주를 확인했다면, 운명의 파트너와의 에너지 궁합을 함께 살펴보세요.
                </p>
                <button
                  onClick={handleGungHapClick}
                  className="btn-shimmer text-white px-8 py-4 rounded-2xl font-black text-base shadow-lg shadow-primary-200/40 hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  운명 궁합 보기
                </button>
              </div>

              <div className="divider-gradient" />

              {/* 내 사주 공유하기 */}
              <ShareButtons name={data.userName} />
            </div>

          </div>
        )}
      </div>

      <GungHapInputModal isOpen={isGungHapModalOpen} onClose={() => setIsGungHapModalOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
