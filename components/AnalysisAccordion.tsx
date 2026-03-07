'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
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
              ? "bg-white border-[#FEE500] shadow-[0_10px_30px_-10px_rgba(254,229,0,0.3)]" 
              : "bg-[#F7F8FA] border-transparent hover:border-gray-200"
          )}
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                openIndex === index ? "bg-[#FEE500]" : "bg-gray-200 group-hover:bg-gray-300"
              )}>
                <Sparkles className={cn(
                  "w-5 h-5",
                  openIndex === index ? "text-[#3C1E1E]" : "text-gray-500"
                )} />
              </div>
              <span className={cn(
                "text-lg md:text-xl font-bold tracking-tight",
                openIndex === index ? "text-[#3C1E1E]" : "text-gray-600"
              )}>
                {item.title}
              </span>
            </div>
            <ChevronDown className={cn(
              "w-6 h-6 transition-transform duration-300",
              openIndex === index ? "rotate-180 text-[#3C1E1E]" : "text-gray-400"
            )} />
          </button>

          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="p-6 md:p-8 pt-0 text-gray-700 leading-relaxed text-lg break-keep whitespace-pre-wrap">
                {item.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
