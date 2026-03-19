'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Brain, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,#ecfdf5_0%,#f7fffb_55%,#ecfdf5_100%)] px-6 pb-28 pt-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-black tracking-[0.18em] text-emerald-700">
              <Brain className="h-3.5 w-3.5" />
              MBTI TEST
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">당신의 성향을 확인해보세요</h1>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/85 px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Progress</p>
            <p className="mt-1 text-lg font-black text-gray-900">{currentIndex + 1} / {MBTI_QUESTIONS.length}</p>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#10B981,#34D399)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        <div className="mb-6 grid gap-3 rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-[0_16px_50px_rgba(16,185,129,0.08)] md:grid-cols-4">
          {Object.entries(axisSummary).map(([axis, count]) => (
            <div key={axis} className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-black tracking-[0.18em] text-emerald-600">{axis}</p>
              <p className="mt-1 text-sm font-bold text-gray-700">{count} / 5 답변</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-white/92 shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
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
                <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                  {question.axis} 척도
                </div>
                <p className="text-sm font-bold text-gray-400">문항 {question.id}</p>
              </div>

              <h2 className="text-2xl font-black leading-tight tracking-tight text-gray-900 md:text-4xl">
                {question.statement}
              </h2>

              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between text-sm font-bold text-gray-500">
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
                        className={`rounded-[1.6rem] border px-4 py-5 text-center transition ${
                          selected
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)]'
                            : 'border-emerald-100 bg-emerald-50/70 text-gray-700 hover:border-emerald-300 hover:bg-white'
                        }`}
                      >
                        <div className={`mx-auto mb-3 h-4 rounded-full ${selected ? 'bg-white/70' : 'bg-emerald-200'}`} style={{ width: `${12 + option.value * 5}px` }} />
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
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" />
            이전 문항
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-sm font-black text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)] transition disabled:cursor-not-allowed disabled:opacity-45"
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
