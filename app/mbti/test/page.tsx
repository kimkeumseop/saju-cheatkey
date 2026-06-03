'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Brain, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CosmicBackground from '@/components/CosmicBackground';
import { MBTI_QUESTIONS } from '@/src/data/mbtiQuestions';
import { calculateMbtiResult, MBTI_RESULT_STORAGE_KEY } from '@/lib/mbti';
import { MBTI_TYPES } from '@/src/data/mbtiTypes';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const OPTIONS = [
  { value: 4, short: '매우 동의' },
  { value: 3, short: '동의' },
  { value: 2, short: '보통' },
  { value: 1, short: '비동의' },
  { value: 0, short: '매우 비동의' },
];

export default function MbtiTestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = MBTI_QUESTIONS[currentIndex];
  const progress = Math.round((Object.keys(answers).length / MBTI_QUESTIONS.length) * 100);
  const currentValue = answers[question.id];
  const canGoNext = currentValue !== undefined;

  const axisSummary = useMemo(() => {
    const map: Record<string, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
    MBTI_QUESTIONS.forEach((item) => {
      if (answers[item.id] !== undefined) map[item.axis] += 1;
    });
    return map;
  }, [answers]);

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = async () => {
    if (!canGoNext || submitting) return;

    if (currentIndex < MBTI_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    try {
      setSubmitting(true);
      const { type, scores } = calculateMbtiResult(answers);
      const typeInfo = MBTI_TYPES[type as keyof typeof MBTI_TYPES];

      let profile = null;
      try {
        const response = await fetch('/api/mbti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, scores }),
        });
        const data = await response.json();
        profile = data?.profile ?? null;
      } catch {
        profile = null;
      }

      const payload = {
        userId: user?.uid || 'anonymous',
        mbtiType: type,
        scores,
        createdAt: new Date().toISOString(),
        typeInfo,
        profile,
      };

      sessionStorage.setItem(MBTI_RESULT_STORAGE_KEY, JSON.stringify(payload));

      if (db) {
        try {
          await addDoc(collection(db, 'mbtiResults'), {
            userId: payload.userId,
            mbtiType: type,
            scores,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to save mbtiResults:', error);
        }
      }

      router.push(`/mbti/result/${type}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 pb-28 pt-24" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-[0.18em]" style={{ background: 'rgba(0,229,160,0.10)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0' }}>
              <Brain className="h-3.5 w-3.5" />
              MBTI TEST
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>당신의 성향을 확인해보세요</h1>
          </div>
          <div className="rounded-2xl px-4 py-3 text-right" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,229,160,0.16)' }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#00e5a0' }}>Progress</p>
            <p className="mt-1 text-lg font-black" style={{ color: '#f5eef2' }}>{currentIndex + 1} / {MBTI_QUESTIONS.length}</p>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full" style={{ background: 'rgba(0,229,160,0.12)' }}>
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#00e5a0,#34D399)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        <div className="mb-6 grid gap-3 rounded-[2rem] p-5 md:grid-cols-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,229,160,0.14)', boxShadow: '0 4px 24px rgba(0,0,0,0.22)' }}>
          {Object.entries(axisSummary).map(([axis, count]) => (
            <div key={axis} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.12)' }}>
              <p className="text-xs font-black tracking-[0.18em]" style={{ color: '#00e5a0' }}>{axis}</p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'rgba(240,232,238,0.7)' }}>{count} / 5 답변</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2.2rem]" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,229,160,0.14)', boxShadow: '0 8px 40px rgba(0,229,160,0.08)' }}>
          <AnimatePresence mode="wait">
            <motion.section
              key={question.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="p-7 md:p-10"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="rounded-full px-4 py-2 text-sm font-black" style={{ background: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}>
                  {question.axis} 척도
                </div>
                <p className="text-sm font-bold" style={{ color: 'rgba(240,232,238,0.4)' }}>문항 {question.id}</p>
              </div>

              <h2 className="text-lg font-bold leading-relaxed tracking-tight md:text-2xl break-keep" style={{ color: '#f5eef2' }}>
                {question.statement}
              </h2>

              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between text-sm font-bold" style={{ color: 'rgba(240,232,238,0.5)' }}>
                  <span>매우 동의</span>
                  <span>매우 비동의</span>
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  {OPTIONS.map((option) => {
                    const selected = currentValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className="rounded-[1.6rem] border px-4 py-5 text-center transition"
                        style={
                          selected
                            ? { borderColor: 'transparent', background: 'linear-gradient(135deg, #00e5a0, #059669)', color: 'white', boxShadow: '0 14px 30px rgba(0,229,160,0.25)' }
                            : { borderColor: 'rgba(0,229,160,0.16)', background: 'rgba(0,229,160,0.05)', color: 'rgba(240,232,238,0.7)' }
                        }
                      >
                        <div className="mx-auto mb-3 h-4 rounded-full" style={{ width: `${12 + option.value * 5}px`, background: selected ? 'rgba(255,255,255,0.7)' : 'rgba(0,229,160,0.35)' }} />
                        <p className="text-sm font-black">{option.short}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || submitting}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-white/5"
            style={{ border: '1px solid rgba(0,229,160,0.2)', color: 'rgba(0,229,160,0.85)' }}
          >
            <ChevronLeft className="h-4 w-4" />
            이전 문항
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || submitting}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #00e5a0, #059669)', boxShadow: '0 8px 32px rgba(0,229,160,0.24), 0 1px 0 rgba(255,255,255,0.16) inset' }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {currentIndex === MBTI_QUESTIONS.length - 1 ? '결과 보기' : '다음 문항'}
            {!submitting ? <ChevronRight className="h-4 w-4" /> : null}
          </button>
        </div>
      </div>
    </main>
  );
}
