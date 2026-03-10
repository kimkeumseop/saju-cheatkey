'use client';

import { useState, useEffect } from 'react';
import { X, User, Plus, Sparkles, ChevronRight, Calendar, Clock, Heart, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SajuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Profile = {
  name: string;
  birthDate: string;
  birthTime: string;
  isTimeKnown: boolean;
  isExactTime: boolean;
  calendarType: 'solar' | 'lunar';
  gender: 'male' | 'female';
};

export default function SajuModal({ isOpen, onClose }: SajuModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'selection' | 'form'>('selection');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [formData, setFormData] = useState<Profile>({
    name: '',
    birthDate: '',
    birthTime: '',
    isTimeKnown: true,
    isExactTime: true,
    calendarType: 'solar',
    gender: 'male'
  });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('saju_profiles');
      if (saved) setProfiles(JSON.parse(saved));
      setView('selection');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProfileSelect = (profile: Profile) => {
    const params = new URLSearchParams();
    Object.entries(profile).forEach(([key, value]) => params.append(key, String(value)));
    onClose();
    router.push(`/saju?${params.toString()}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    // 시간 모를 경우 처리
    const finalData = { ...formData };
    if (!formData.isTimeKnown || !formData.isExactTime) {
      finalData.birthTime = 'unknown';
    }

    const params = new URLSearchParams();
    Object.entries(finalData).forEach(([key, value]) => params.append(key, String(value)));
    
    // 프로필 저장
    const newProfiles = [...profiles, finalData].slice(-5); // 최근 5개 유지
    localStorage.setItem('saju_profiles', JSON.stringify(newProfiles));

    onClose();
    router.push(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-[#F7F8FA] text-gray-900 border border-gray-100 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-[#FEE500]/20 focus:border-[#FEE500] outline-none transition-all placeholder:text-gray-400 font-medium";
  const radioBtnClasses = (active: boolean) => cn(
    "flex-1 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 border-2",
    active ? "bg-[#3C1E1E] border-[#3C1E1E] text-white shadow-md" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#3C1E1E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-[#3C1E1E] tracking-tight">🔮 사주 분석</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {view === 'selection' ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-500 font-bold text-sm ml-1">저장된 프로필 선택</p>
              {profiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {profiles.map((profile, index) => (
                    <button key={index} onClick={() => handleProfileSelect(profile)} className="w-full flex items-center gap-4 p-4 bg-[#F7F8FA] hover:bg-[#FEE500]/10 border border-gray-100 rounded-[1.5rem] transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[#FEE500] flex items-center justify-center shadow-sm"><User className="w-5 h-5 text-[#3C1E1E]" /></div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-sm text-[#3C1E1E]">{profile.name || '무명'}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{profile.birthDate} · {profile.gender === 'male' ? '남성' : '여성'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3C1E1E] transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-[1.5rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold text-sm">아직 저장된 프로필이 없어요!</p>
                </div>
              )}

              <button onClick={() => setView('form')} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border-2 border-dashed border-gray-200 hover:border-[#FEE500] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#FEE500]/20 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#3C1E1E]" />
                </div>
                <p className="font-black text-[#3C1E1E] flex-1 text-left">새로운 사람 분석하기</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#3C1E1E] ml-1">분석받을 분의 이름</label>
                <input type="text" placeholder="이름을 입력하세요" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              {/* 성별 & 달력 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#3C1E1E] ml-1">성별</label>
                  <div className="flex p-1 bg-[#F7F8FA] rounded-2xl border border-gray-100">
                    <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={radioBtnClasses(formData.gender === 'male')}>남성</button>
                    <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={radioBtnClasses(formData.gender === 'female')}>여성</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#3C1E1E] ml-1">달력</label>
                  <div className="flex p-1 bg-[#F7F8FA] rounded-2xl border border-gray-100">
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={radioBtnClasses(formData.calendarType === 'solar')}>양력</button>
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={radioBtnClasses(formData.calendarType === 'lunar')}>음력</button>
                  </div>
                </div>
              </div>

              {/* 생년월일 */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#3C1E1E] ml-1">태어난 날짜</label>
                <input type="date" className={inputClasses} value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
              </div>

              {/* 시간 입력 로직 (3단계) */}
              <div className="space-y-6 pt-2 border-t border-gray-100">
                {/* 1단계: 시간 아는지? */}
                <div className="space-y-3">
                  <label className="text-sm font-black text-[#3C1E1E] ml-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FEE500]" />
                    태어난 시간을 아시나요?
                  </label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setFormData({...formData, isTimeKnown: true})} className={radioBtnClasses(formData.isTimeKnown)}>예</button>
                    <button type="button" onClick={() => setFormData({...formData, isTimeKnown: false})} className={radioBtnClasses(!formData.isTimeKnown)}>아니오</button>
                  </div>
                </div>

                {/* 2단계: 정확한 시간 아는지? (1단계 '예'일 때만) */}
                {formData.isTimeKnown && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-black text-[#3C1E1E] ml-1">정확한 시간을 아시나요?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setFormData({...formData, isExactTime: true})} className={radioBtnClasses(formData.isExactTime)}>예</button>
                      <button type="button" onClick={() => setFormData({...formData, isExactTime: false})} className={radioBtnClasses(!formData.isExactTime)}>아니오</button>
                    </div>
                  </div>
                )}

                {/* 3단계: 시간 입력 (2단계 '예'일 때만) */}
                {formData.isTimeKnown && formData.isExactTime && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-black text-[#3C1E1E] ml-1">태어난 시간 입력</label>
                    <input type="time" className={inputClasses} value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} required={formData.isExactTime} />
                    <p className="text-[11px] text-gray-400 font-bold ml-1 italic">* 시간을 모를 경우 사주 분석의 정확도가 떨어질 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setView('selection')} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black text-lg transition-all">뒤로</button>
              <button type="submit" className="flex-[2] bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98]">분석 시작하기 🚀</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
