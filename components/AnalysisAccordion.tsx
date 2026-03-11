'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 w-full">
      {data.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "group overflow-hidden rounded-[2rem] border transition-all duration-300",
            openIndex === index 
              ? "bg-white border-primary-200 shadow-[0_10px_30px_-10px_rgba(230,73,128,0.15)]" 
              : "bg-white border-pink-50/50 hover:border-pink-100"
          )}
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-2xl shadow-sm",
                openIndex === index ? "bg-primary-100 scale-110" : "bg-primary-50 group-hover:bg-primary-100"
              )}>
                {item.icon || '✨'}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest leading-none">
                  {item.theme}
                </p>
                <h4 className={cn(
                  "text-lg md:text-xl font-black tracking-tight",
                  openIndex === index ? "text-primary-900" : "text-gray-600"
                )}>
                  {item.title || item.theme}
                </h4>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-6 h-6 transition-transform duration-300 shrink-0",
              openIndex === index ? "rotate-180 text-primary-600" : "text-primary-200"
            )} />
          </button>

          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="p-6 md:p-8 pt-0 text-gray-600 leading-relaxed text-lg break-keep whitespace-pre-wrap font-medium">
                {item.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
