'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ChevronRight, User, Calendar as CalendarIcon } from 'lucide-react';

interface SajuHistory {
  name: string;
  birthDate: string;
  birthTime: string;
  calendarType: string;
  isLeapMonth: string;
  gender: string;
  timestamp: number;
}

export default function RecentHistory() {
  const [history, setHistory] = useState<SajuHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('saju_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.slice(0, 3)); // 최근 3개만 표시
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-8 text-gray-100">
        <History className="w-5 h-5 text-gold-500" />
        <h2 className="text-2xl font-bold text-serif tracking-tight">최근 분석한 운명</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {history.map((item, idx) => {
          const params = new URLSearchParams({
            name: item.name,
            birthDate: item.birthDate,
            birthTime: item.birthTime,
            calendarType: item.calendarType,
            isLeapMonth: item.isLeapMonth,
            gender: item.gender,
          });

          return (
            <Link 
              key={idx}
              href={`/saju?${params.toString()}`}
              className="p-6 rounded-2xl group hover:shadow-2xl transition-all border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gold-500/20 p-2 rounded-lg text-gold-500 group-hover:scale-110 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-gray-100 text-lg mb-1">{item.name || '방문자'}님</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                {item.birthDate}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
