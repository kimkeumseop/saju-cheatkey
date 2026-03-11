'use client';

import { useState } from 'react';
import { ChevronDown, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisItem {
  theme: string;
  icon?: string;
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

  // TTS 기능 구현
  const handleSpeak = (e: React.MouseEvent, text: string, index: number) => {
    e.stopPropagation(); // 아코디언 토글 방지

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // 기존 재생 중인 음성 취소
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // 살짝 천천히 다정하게
    utterance.pitch = 1.1; // 약간 높은 톤으로 신비롭게

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4 w-full">
      {data.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "group overflow-hidden rounded-[2.5rem] border transition-all duration-500",
            openIndex === index 
              ? "bg-white border-primary-200 shadow-[0_20px_50px_-12px_rgba(230,73,128,0.15)]" 
              : "bg-white border-pink-50/50 hover:border-pink-100"
          )}
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex items-center justify-between p-6 md:p-10 text-left outline-none"
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 text-3xl shadow-sm",
                openIndex === index ? "bg-primary-100 scale-110 rotate-3" : "bg-primary-50 group-hover:bg-primary-100"
              )}>
                {item.icon || '✨'}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-[0.2em] leading-none">
                  {item.theme}
                </p>
                <h4 className={cn(
                  "text-xl md:text-2xl font-black tracking-tight",
                  openIndex === index ? "text-primary-900" : "text-gray-600"
                )}>
                  {item.title || item.theme}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 스피커 버튼 추가 */}
              <button
                onClick={(e) => handleSpeak(e, item.content, index)}
                className={cn(
                  "p-3 rounded-full transition-all active:scale-90 shadow-sm border",
                  speakingIndex === index 
                    ? "bg-primary-500 text-white border-primary-400 animate-pulse" 
                    : "bg-white text-primary-200 border-pink-50 hover:text-primary-500 hover:border-primary-200"
                )}
                title={speakingIndex === index ? "읽기 중단" : "목소리로 듣기"}
              >
                {speakingIndex === index ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <ChevronDown className={cn(
                "w-6 h-6 transition-transform duration-500 shrink-0",
                openIndex === index ? "rotate-180 text-primary-600" : "text-primary-200"
              )} />
            </div>
          </button>

          <div className={cn(
            "grid transition-all duration-500 ease-in-out",
            openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="p-6 md:p-10 pt-0 text-gray-600 leading-[1.8] text-lg break-keep whitespace-pre-wrap font-medium">
                {/* 읽기 중일 때 텍스트 하이라이트 효과 (옵션) */}
                <div className={cn(
                  "transition-colors duration-1000",
                  speakingIndex === index ? "text-primary-900" : ""
                )}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
