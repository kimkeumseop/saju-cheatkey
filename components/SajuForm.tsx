'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';

export default function SajuForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', birthDate: '', birthTime: '', calendarType: 'solar', gender: 'male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(formData);
    router.push(`/saju?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <div className="space-y-4">
        {/* 이름 입력 */}
        <div className="relative flex items-center">
          <User className="w-5 h-5 absolute left-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="이름 (선택사항)" 
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 outline-none" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        
        {/* 양력/음력 토글 */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={`flex-1 py-2 rounded-lg font-bold ${formData.calendarType === 'solar' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-gray-400'}`}>양력</button>
          <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={`flex-1 py-2 rounded-lg font-bold ${formData.calendarType === 'lunar' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-gray-400'}`}>음력</button>
        </div>

        {/* 생년월일 */}
        <div className="relative flex items-center">
          <Calendar className="w-5 h-5 absolute left-4 text-gray-400" />
          <input 
            type="date" 
            required 
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 outline-none block" 
            value={formData.birthDate} 
            onChange={e => setFormData({...formData, birthDate: e.target.value})} 
          />
        </div>

        {/* 시간 */}
        <div className="relative flex items-center">
          <Clock className="w-5 h-5 absolute left-4 text-gray-400" />
          <input 
            type="time" 
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 outline-none block" 
            value={formData.birthTime} 
            onChange={e => setFormData({...formData, birthTime: e.target.value})} 
          />
        </div>

        {/* 성별 토글 */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 py-2 rounded-lg font-bold ${formData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>남성</button>
          <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 py-2 rounded-lg font-bold ${formData.gender === 'female' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-gray-400'}`}>여성</button>
        </div>
      </div>

      <button type="submit" className="w-full bg-yellow-500 text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
        내 운명 분석하기 <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  );
}
