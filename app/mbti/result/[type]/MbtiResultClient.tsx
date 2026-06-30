'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Brain, RefreshCw } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';
import InstaStoryButton from '@/components/InstaStoryButton';
import ShareButtons from '@/components/ShareButtons';
import { buildMbtiFallbackProfile, getDefaultScoresForType, MBTI_DIMENSIONS, MBTI_RESULT_STORAGE_KEY, type MbtiAiProfile, type MbtiScores } from '@/lib/mbti';
import { MBTI_TYPES, type MbtiTypeCode } from '@/src/data/mbtiTypes';

type StoredMbtiResult = {
  mbtiType: string;
  scores: MbtiScores;
  profile?: MbtiAiProfile | null;
};

const AI_FETCH_TIMEOUT_MS = 8000;

function isFallbackProfile(profile: MbtiAiProfile, fallbackProfile: MbtiAiProfile) {
  return (
    profile.summary === fallbackProfile.summary
    && profile.goodMatch === fallbackProfile.goodMatch
    && profile.cautionMatch === fallbackProfile.cautionMatch
  );
}

export default function MbtiResultClient() {
  const params = useParams<{ type: string }>();
  const type = String(params?.type || '').toUpperCase() as MbtiTypeCode;
  const typeInfo = MBTI_TYPES[type];
  const fallbackProfile = useMemo(() => buildMbtiFallbackProfile(type), [type]);
  const [scores, setScores] = useState<MbtiScores>(() => getDefaultScoresForType(type));
  const [profile, setProfile] = useState<MbtiAiProfile>(fallbackProfile);
  const [loadingAi, setLoadingAi] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  useEffect(() => {
    setScores(getDefaultScoresForType(type));
    setProfile(buildMbtiFallbackProfile(type));
    setLoadingAi(false);
    setStorageChecked(false);
    setAiNotice(null);
  }, [type]);

  useEffect(() => {
    try {
      const savedRaw = sessionStorage.getItem(MBTI_RESULT_STORAGE_KEY);
      if (!savedRaw) return;

      const saved = JSON.parse(savedRaw) as StoredMbtiResult;
      if (saved.mbtiType === type) {
        if (saved.scores) setScores(saved.scores);
        if (saved.profile) setProfile(saved.profile);
      }
    } catch {
      return;
    } finally {
      setStorageChecked(true);
    }
  }, [type]);

  useEffect(() => {
    if (!typeInfo || !storageChecked || !isFallbackProfile(profile, fallbackProfile)) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS);

    const load = async () => {
      try {
        setLoadingAi(true);
        setAiNotice('AI 설명을 불러오는 중이에요. 기본 결과를 먼저 보여드릴게요.');
        const response = await fetch('/api/mbti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, scores }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load MBTI AI profile: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled && data?.profile) {
          setProfile(data.profile);
          setAiNotice(null);

          try {
            const savedRaw = sessionStorage.getItem(MBTI_RESULT_STORAGE_KEY);
            const saved = savedRaw ? JSON.parse(savedRaw) : {};
            sessionStorage.setItem(MBTI_RESULT_STORAGE_KEY, JSON.stringify({
              ...saved,
              mbtiType: type,
              scores,
              profile: data.profile,
            }));
          } catch {
            // Ignore sessionStorage write failures and keep the loaded result in memory.
          }
        }
      } catch {
        if (!cancelled) {
          setAiNotice('AI 설명이 지연되어 기본 결과를 먼저 보여드리고 있어요.');
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setLoadingAi(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    fallbackProfile.cautionMatch,
    fallbackProfile.goodMatch,
    fallbackProfile.summary,
    profile.cautionMatch,
    profile.goodMatch,
    profile.summary,
    scores,
    storageChecked,
    type,
    typeInfo,
  ]);

  const storySummary = useMemo(() => {
    return [
      `${type} ${typeInfo?.name || ''}`,
      profile.summary,
      `• 강점: ${profile.strengths[0]}`,
      `• 강점: ${profile.strengths[1]}`,
      `• 강점: ${profile.strengths[2]}`,
      `${profile.goodMatch}와는 비교적 호흡이 잘 맞고, ${profile.cautionMatch}와는 속도 조절이 중요해요.`,
    ].join('\n');
  }, [profile, type, typeInfo]);

  if (!typeInfo) {
    return (
      <main className="relative min-h-screen overflow-x-hidden px-6 pt-28" style={{ background: '#FBF7F2' }}>
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-xl rounded-[2rem] p-8 text-center" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.16)' }}>
          <p className="text-xl font-bold" style={{ color: '#2D1B1E' }}>존재하지 않는 MBTI 유형입니다.</p>
          <Link href="/mbti" className="mt-6 inline-flex rounded-2xl px-5 py-3 font-bold text-white" style={{ background: 'linear-gradient(135deg, #0e9f73, #059669)' }}>
            MBTI 홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 pb-28 pt-24" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-5xl">
        <section className="rounded-[2.5rem] p-7 md:p-10" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.16)', boxShadow: '0 8px 40px rgba(14,159,115,0.08)' }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-[0.18em]" style={{ background: 'rgba(14,159,115,0.12)', border: '1px solid rgba(14,159,115,0.25)', color: '#0e9f73' }}>
                <Brain className="h-3.5 w-3.5" />
                MBTI RESULT
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] text-3xl" style={{ backgroundColor: `${typeInfo.color}26`, color: typeInfo.color, border: `1px solid ${typeInfo.color}40` }}>
                  {typeInfo.emoji}
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight md:text-6xl" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{type}</p>
                  <p className="mt-1 text-xl font-black" style={{ color: typeInfo.color }}>{typeInfo.name}</p>
                </div>
              </div>
            </div>

            <Link href="/mbti/test" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition hover:bg-black/5" style={{ border: '1px solid rgba(14,159,115,0.2)', color: 'rgba(14,159,115,0.85)' }}>
              <RefreshCw className="h-4 w-4" />
              다시 테스트하기
            </Link>
          </div>

          <p className="mt-8 text-base leading-8 md:text-lg" style={{ color: 'rgba(45,27,30,0.7)' }}>
            {profile.summary || typeInfo.desc}
          </p>

          {loadingAi || aiNotice ? (
            <p className="mt-3 text-sm font-bold" style={{ color: '#0e9f73' }}>
              {loadingAi ? 'AI 설명을 불러오는 중이에요. 기본 결과를 먼저 보여드릴게요.' : aiNotice}
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
            <h2 className="text-xl font-bold text-[#2D1B1E]">척도 비율</h2>
            <div className="mt-5 space-y-5">
              {MBTI_DIMENSIONS.map((dimension) => {
                const leftScore = scores[dimension.left];
                const rightScore = scores[dimension.right];
                return (
                  <div key={dimension.label}>
                    <div className="mb-2 flex items-center justify-between text-sm font-bold" style={{ color: 'rgba(45,27,30,0.6)' }}>
                      <span>{dimension.label}</span>
                      <span>{dimension.left} {leftScore}% / {dimension.right} {rightScore}%</span>
                    </div>
                    <div className="relative h-4 overflow-hidden rounded-full" style={{ background: 'rgba(14,159,115,0.12)' }}>
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#0e9f73,#34D399)]" style={{ width: `${leftScore}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-black" style={{ color: 'rgba(45,27,30,0.4)' }}>
                      <span>{dimension.left}</span>
                      <span>{dimension.right}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
              <h2 className="text-xl font-bold text-[#2D1B1E]">강점 3가지</h2>
              <div className="mt-4 space-y-3">
                {profile.strengths.map((item) => (
                  <div key={item} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: 'rgba(14,159,115,0.08)', border: '1px solid rgba(14,159,115,0.14)', color: 'rgba(45,27,30,0.78)' }}>{item}</div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
              <h2 className="text-xl font-bold text-[#2D1B1E]">약점 3가지</h2>
              <div className="mt-4 space-y-3">
                {profile.weaknesses.map((item) => (
                  <div key={item} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: 'rgba(212,104,138,0.08)', border: '1px solid rgba(212,104,138,0.16)', color: 'rgba(45,27,30,0.78)' }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: '#0e9f73' }}>잘 맞는 유형</p>
            <p className="mt-3 text-3xl font-bold" style={{ color: '#2D1B1E' }}>{profile.goodMatch}</p>
            <p className="mt-2 text-sm leading-7" style={{ color: 'rgba(45,27,30,0.5)' }}>리듬이나 관점이 서로를 보완해 주는 편입니다. 차이를 장점으로 쓰면 협업과 관계에서 시너지가 납니다.</p>
          </div>
          <div className="rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(212,104,138,0.7)' }}>주의할 유형</p>
            <p className="mt-3 text-3xl font-bold" style={{ color: '#2D1B1E' }}>{profile.cautionMatch}</p>
            <p className="mt-2 text-sm leading-7" style={{ color: 'rgba(45,27,30,0.5)' }}>선호하는 속도와 표현 방식이 달라 오해가 생기기 쉽습니다. 기준을 미리 맞추면 충돌을 크게 줄일 수 있습니다.</p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-emerald-400/15 bg-black/[0.025] p-6 shadow-[0_4px_24px_rgba(45,27,30,0.22)]">
          <h2 className="text-xl font-bold text-[#2D1B1E]">더 이어서 보기</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Link href="/saju" className="rounded-[1.6rem] p-5 transition hover:-translate-y-1" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(255,255,255,0.6) 70%)', border: '1px solid rgba(212,104,138,0.18)' }}>
              <p className="text-sm font-black" style={{ color: '#d4688a' }}>사주</p>
              <p className="mt-2 text-lg font-bold" style={{ color: '#2D1B1E' }}>사주로 더 깊이 알아보기</p>
            </Link>
            <Link href="/gunghap" className="rounded-[1.6rem] p-5 transition hover:-translate-y-1" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(255,255,255,0.6) 70%)', border: '1px solid rgba(212,104,138,0.18)' }}>
              <p className="text-sm font-black" style={{ color: '#d4688a' }}>궁합</p>
              <p className="mt-2 text-lg font-bold" style={{ color: '#2D1B1E' }}>MBTI 궁합 확인하기</p>
            </Link>
            <Link href="/tarot" className="rounded-[1.6rem] p-5 transition hover:-translate-y-1" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,111,214,0.12), rgba(255,255,255,0.6) 70%)', border: '1px solid rgba(124,111,214,0.18)' }}>
              <p className="text-sm font-black" style={{ color: '#7c6fd6' }}>타로</p>
              <p className="mt-2 text-lg font-bold" style={{ color: '#2D1B1E' }}>오늘의 타로 받기</p>
            </Link>
          </div>
        </section>

        <ShareButtons
          name={`${type} ${typeInfo.name}`}
          service="mbti"
          shareTitle={`${type} ${typeInfo.name} MBTI 결과`}
          shareDescription={profile.summary}
        />
        <InstaStoryButton userName={`${type} ${typeInfo.name}`} summaryContent={storySummary} type="mbti" />
      </div>
    </main>
  );
}
