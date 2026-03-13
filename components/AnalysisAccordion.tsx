'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisItem {
  title: string;
  content: string;
}

interface AnalysisAccordionProps {
  data: AnalysisItem[];
}

function renderContent(content: string) {
  const normalized = content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim());

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="whitespace-pre-wrap break-keep">
      {paragraph}
    </p>
  ));
}

export default function AnalysisAccordion({ data }: AnalysisAccordionProps) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [liveData, setLiveData] = useState<AnalysisItem[]>(() => data.map((item) => ({ ...item })));

  const dataSignature = useMemo(
    () => data.map((item, index) => `${index}:${item.title}::${item.content}`).join('\u0001'),
    [data]
  );

  useEffect(() => {
    setLiveData(data.map((item) => ({ ...item })));
  }, [dataSignature, data]);

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-5 w-full">
      {liveData.map((item, index) => (
        <article
          key={`${index}-${item.title}`}
          className="rounded-[2.5rem] border border-pink-100 bg-white/95 p-6 md:p-8 shadow-[0_18px_50px_-20px_rgba(190,24,93,0.22)]"
        >
          <div className="flex items-start gap-4 md:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-lg font-black text-white shadow-lg shadow-rose-200/70 md:h-14 md:w-14 md:text-xl">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h4 className="pr-2 text-xl font-black tracking-tight text-rose-950 break-keep md:text-2xl">
                  {item.title}
                </h4>

                <button
                  type="button"
                  onClick={() => handleSpeak(item.content || item.title, index)}
                  className={cn(
                    'mt-0.5 shrink-0 rounded-full border p-2.5 shadow-sm transition-all active:scale-95',
                    speakingIndex === index
                      ? 'border-rose-400 bg-rose-500 text-white'
                      : 'border-pink-100 bg-rose-50 text-rose-400 hover:border-rose-200 hover:text-rose-600'
                  )}
                  aria-label={speakingIndex === index ? '음성 재생 중지' : '본문 음성 재생'}
                >
                  {speakingIndex === index ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-rose-50 via-white to-pink-50 px-5 py-4 md:px-6 md:py-5">
                <div
                  className={cn(
                    'space-y-4 text-[15px] font-medium leading-8 text-slate-700 md:text-[17px]',
                    speakingIndex === index && 'text-rose-950'
                  )}
                >
                  {renderContent(item.content)}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
