'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, User, ChevronRight, X } from 'lucide-react';

interface HistoryItem {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  calendarType: string;
  gender: string;
  timestamp: number;
}

export default function RecentHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 기록 불러오기
    const saved = localStorage.getItem('saju_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 3));
      } catch (e) {
        console.error('History parsing error', e);
      }
    }
  }, []);

  const removeHistory = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('saju_history', JSON.stringify(newHistory));
  };

  if (history.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">
        <History className="w-3.5 h-3.5" />
        최근 분석한 기록
      </div>
      
      <div className="space-y-3">
        {history.map((item) => (
          <Link 
            key={item.id}
            href={`/saju?name=${item.name}&birthDate=${item.birthDate}&birthTime=${item.birthTime}&calendarType=${item.calendarType}&gender=${item.gender}`}
            className="group block relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/10 transition-all overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold group-hover:bg-gold-500 group-hover:text-white transition-all">
                  {item.name ? item.name[0] : '무'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">{item.name || '무명'}</div>
                  <div className="text-xs text-gray-500">{item.birthDate} ({item.calendarType === 'solar' ? '양' : '음'})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                <button 
                  onClick={(e) => removeHistory(item.id, e)}
                  className="p-1 hover:text-rose-400 text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
