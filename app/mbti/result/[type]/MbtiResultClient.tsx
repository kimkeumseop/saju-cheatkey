'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Brain, RefreshCw } from 'lucide-react';
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
      <main className="min-h-screen px-6 pt-28">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-black text-gray-900">존재하지 않는 MBTI 유형입니다.</p>
          <Link href="/mbti" className="mt-6 inline-flex rounded-2xl bg-[#10B981] px-5 py-3 font-black text-white">
            MBTI 홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.2),transparent_30%),linear-gradient(180deg,#ecfdf5_0%,#f7fffb_55%,#ecfdf5_100%)] px-6 pb-28 pt-24">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2.5rem] border border-emerald-100 bg-white/92 p-7 shadow-[0_20px_60px_rgba(16,185,129,0.12)] md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black tracking-[0.18em] text-emerald-700">
                <Brain className="h-3.5 w-3.5" />
                MBTI RESULT
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] text-3xl shadow-sm" style={{ backgroundColor: `${typeInfo.color}18`, color: typeInfo.color }}>
                  {typeInfo.emoji}
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight text-gray-900 md:text-6xl">{type}</p>
                  <p className="mt-1 text-xl font-black" style={{ color: typeInfo.color }}>{typeInfo.name}</p>
                </div>
              </div>
            </div>

            <Link href="/mbti/test" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700">
              <RefreshCw className="h-4 w-4" />
              다시 테스트하기
            </Link>
          </div>

          <p className="mt-8 text-base leading-8 text-gray-700 md:text-lg">
            {profile.summary || typeInfo.desc}
          </p>

          {loadingAi || aiNotice ? (
            <p className="mt-3 text-sm font-bold text-emerald-700">
              {loadingAi ? 'AI 설명을 불러오는 중이에요. 기본 결과를 먼저 보여드릴게요.' : aiNotice}
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
            <h2 className="text-xl font-black text-gray-900">척도 비율</h2>
            <div className="mt-5 space-y-5">
              {MBTI_DIMENSIONS.map((dimension) => {
                const leftScore = scores[dimension.left];
                const rightScore = scores[dimension.right];
                return (
                  <div key={dimension.label}>
                    <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-600">
                      <span>{dimension.label}</span>
                      <span>{dimension.left} {leftScore}% / {dimension.right} {rightScore}%</span>
                    </div>
                    <div className="relative h-4 overflow-hidden rounded-full bg-emerald-100">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#10B981,#34D399)]" style={{ width: `${leftScore}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-black text-gray-400">
                      <span>{dimension.left}</span>
                      <span>{dimension.right}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
              <h2 className="text-xl font-black text-gray-900">강점 3가지</h2>
              <div className="mt-4 space-y-3">
                {profile.strengths.map((item) => (
                  <div key={item} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-gray-700">{item}</div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
              <h2 className="text-xl font-black text-gray-900">약점 3가지</h2>
              <div className="mt-4 space-y-3">
                {profile.weaknesses.map((item) => (
                  <div key={item} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-gray-700">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">잘 맞는 유형</p>
            <p className="mt-3 text-3xl font-black text-gray-900">{profile.goodMatch}</p>
            <p className="mt-2 text-sm leading-7 text-gray-600">리듬이나 관점이 서로를 보완해 주는 편입니다. 차이를 장점으로 쓰면 협업과 관계에서 시너지가 납니다.</p>
          </div>
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">주의할 유형</p>
            <p className="mt-3 text-3xl font-black text-gray-900">{profile.cautionMatch}</p>
            <p className="mt-2 text-sm leading-7 text-gray-600">선호하는 속도와 표현 방식이 달라 오해가 생기기 쉽습니다. 기준을 미리 맞추면 충돌을 크게 줄일 수 있습니다.</p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
          <h2 className="text-xl font-black text-gray-900">더 이어서 보기</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Link href="/saju" className="rounded-[1.6rem] border border-pink-100 bg-[linear-gradient(135deg,#fff1f6,#ffffff)] p-5 shadow-sm">
              <p className="text-sm font-black text-pink-500">사주</p>
              <p className="mt-2 text-lg font-black text-gray-900">사주로 더 깊이 알아보기</p>
            </Link>
            <Link href="/gunghap" className="rounded-[1.6rem] border border-rose-100 bg-[linear-gradient(135deg,#fff1f2,#ffffff)] p-5 shadow-sm">
              <p className="text-sm font-black text-rose-500">궁합</p>
              <p className="mt-2 text-lg font-black text-gray-900">MBTI 궁합 확인하기</p>
            </Link>
            <Link href="/tarot" className="rounded-[1.6rem] border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#ffffff)] p-5 shadow-sm">
              <p className="text-sm font-black text-violet-500">타로</p>
              <p className="mt-2 text-lg font-black text-gray-900">오늘의 타로 받기</p>
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
