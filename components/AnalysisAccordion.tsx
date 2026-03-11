'use client';

import { useState } from 'react';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
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

export default function AnalysisAccordion({ data }: AnalysisAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSpeak = (e: React.MouseEvent, text: string, index: number) => {
    e.stopPropagation();
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 w-full">
      {data.map((item, index) => {
        // 제목에서 첫 번째 이모지 추출 (없으면 기본값)
        const emojiMatch = item.title.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/u);
        const emoji = emojiMatch ? emojiMatch[0] : '✨';
        const cleanTitle = item.title.replace(emoji, '').trim();

        return (
          <div 
            key={`${index}-${item.title}`} 
            className={cn(
              "group overflow-hidden rounded-[2.5rem] border transition-all duration-500",
              openIndex === index 
                ? "bg-white border-rose-200 shadow-[0_20px_50px_-12px_rgba(230,73,128,0.15)]" 
                : "bg-white border-pink-50/50 hover:border-pink-100"
            )}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 text-2xl md:text-3xl shadow-sm",
                  openIndex === index ? "bg-rose-100 scale-110 rotate-3" : "bg-pink-50 group-hover:bg-pink-100"
                )}>
                  {emoji}
                </div>
                <h4 className={cn(
                  "text-lg md:text-xl font-bold tracking-tight break-keep pr-4",
                  openIndex === index ? "text-rose-900" : "text-gray-700"
                )}>
                  {cleanTitle}
                </h4>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleSpeak(e, item.content, index)}
                  className={cn(
                    "p-2.5 rounded-full transition-all active:scale-90 shadow-sm border",
                    speakingIndex === index 
                      ? "bg-rose-500 text-white border-rose-400 animate-pulse" 
                      : "bg-white text-rose-200 border-pink-50 hover:text-rose-500 hover:border-rose-200"
                  )}
                >
                  {speakingIndex === index ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-500",
                  openIndex === index ? "rotate-180 text-rose-600" : "text-pink-200"
                )} />
              </div>
            </button>

            <div className={cn(
              "grid transition-all duration-500 ease-in-out",
              openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="p-6 md:p-8 pt-0 text-gray-600 leading-[1.8] text-base md:text-lg break-keep whitespace-pre-wrap font-medium">
                  <div className={cn(
                    "transition-colors duration-1000",
                    speakingIndex === index ? "text-rose-950" : ""
                  )}>
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
