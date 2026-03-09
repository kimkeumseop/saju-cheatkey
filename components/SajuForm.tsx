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

  const inputClasses = "w-full bg-[#F7F8FA] text-gray-900 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-[#FEE500]/20 focus:border-[#FEE500] outline-none transition-all placeholder:text-gray-400 font-medium";

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-8 md:p-10 rounded-[2.5rem] space-y-8 w-full max-w-md mx-auto relative group"
    >
      <div className="space-y-6 relative z-10">
        <div className="text-center space-y-2 mb-4">
          <h3 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FEE500]" />
            사주 치트키 키려면 정보 입력 필수!
          </h3>
          <p className="text-sm text-gray-500 font-medium">나의 숨겨진 성격과 운명을 확인하세요!</p>
        </div>

        {/* 이름 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">이름</label>
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
          <label className="text-sm font-bold text-gray-700 ml-1">달력</label>
          <div className="flex p-1.5 bg-[#F7F8FA] rounded-2xl border border-gray-100">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, calendarType: 'solar'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-black transition-all",
                formData.calendarType === 'solar' ? 'bg-[#FEE500] text-[#3C1E1E] shadow-sm' : 'text-gray-400'
              )}
            >
              양력
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, calendarType: 'lunar'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-black transition-all",
                formData.calendarType === 'lunar' ? 'bg-[#FEE500] text-[#3C1E1E] shadow-sm' : 'text-gray-400'
              )}
            >
              음력
            </button>
          </div>
        </div>

        {/* 생년월일 & 시간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">생일</label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="date" 
                required 
                className={cn(inputClasses, "pl-11 pr-2 text-sm")} 
                value={formData.birthDate} 
                onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">시간</label>
            <div className="relative flex items-center">
              <Clock className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="time" 
                className={cn(inputClasses, "pl-11 pr-2 text-sm")} 
                value={formData.birthTime} 
                onChange={e => setFormData({...formData, birthTime: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* 성별 토글 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">성별</label>
          <div className="flex p-1.5 bg-[#F7F8FA] rounded-2xl border border-gray-100">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, gender: 'male'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-black transition-all",
                formData.gender === 'male' ? 'bg-[#3C1E1E] text-white shadow-sm' : 'text-gray-400'
              )}
            >
              남성
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, gender: 'female'})} 
              className={cn(
                "flex-1 py-3 rounded-xl font-black transition-all",
                formData.gender === 'female' ? 'bg-[#3C1E1E] text-white shadow-sm' : 'text-gray-400'
              )}
            >
              여성
            </button>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-5 rounded-2xl font-black text-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 group"
      >
        소름 돋는 결과 확인하기 💥
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-xs text-gray-400 font-medium">
        개인정보는 저장되지 않으니 안심하세요!
      </p>
    </form>
  );
}
