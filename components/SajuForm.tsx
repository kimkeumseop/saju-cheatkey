'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, ChevronRight, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SajuForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    calendarType: 'solar', // 'solar' | 'lunar'
    gender: 'male' // 'male' | 'female'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }
    const params = new URLSearchParams(formData);
    router.push(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-white/5 text-gray-100 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all placeholder:text-gray-500";

  return (
    <form 
      onSubmit={handleSubmit} 
      className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8 w-full max-w-md mx-auto relative overflow-hidden group"
    >
      {/* 장식용 빛 효과 */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/10 blur-[80px] rounded-full group-hover:bg-gold-500/20 transition-colors" />
      
      <div className="space-y-6 relative z-10">
        <div className="text-center space-y-2 mb-4">
          <h3 className="text-xl font-bold text-gray-100 text-serif flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            분석 정보 입력
          </h3>
          <p className="text-sm text-gray-400">정확한 분석을 위해 상세히 입력해주세요.</p>
        </div>

        {/* 이름 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">성함</label>
          <div className="relative flex items-center">
            <User className="w-5 h-5 absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="이름 (선택사항)" 
              className={inputClasses}
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
        </div>
        
        {/* 양력/음력 토글 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">구분</label>
          <div className="flex p-1.5 bg-black/30 rounded-2xl border border-white/5">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, calendarType: 'solar'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.calendarType === 'solar' ? 'bg-gold-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              양력
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, calendarType: 'lunar'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.calendarType === 'lunar' ? 'bg-gold-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              음력
            </button>
          </div>
        </div>

        {/* 생년월일 & 시간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">생년월일</label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="date" 
                required 
                className={cn(inputClasses, "pl-11 pr-2 text-sm [&::-webkit-calendar-picker-indicator]:invert")} 
                value={formData.birthDate} 
                onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">태어난 시간</label>
            <div className="relative flex items-center">
              <Clock className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="time" 
                className={cn(inputClasses, "pl-11 pr-2 text-sm [&::-webkit-calendar-picker-indicator]:invert")} 
                value={formData.birthTime} 
                onChange={e => setFormData({...formData, birthTime: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* 성별 토글 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">성별</label>
          <div className="flex p-1.5 bg-black/30 rounded-2xl border border-white/5">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, gender: 'male'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.gender === 'male' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              남성
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, gender: 'female'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                formData.gender === 'female' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              여성
            </button>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-gold-600 hover:bg-gold-500 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-gold-900/20 active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 group"
      >
        내 운명 분석하기 
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-xs text-gray-500 relative z-10">
        입력하신 정보는 분석 목적 외에 저장되지 않습니다.
      </p>
    </form>
  );
}
