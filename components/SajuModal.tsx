'use client';

import { useState, useEffect } from 'react';
import { X, User, Plus, Sparkles, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SajuModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'saju' | 'compatibility';
}

export default function SajuModal({ isOpen, onClose, type = 'saju' }: SajuModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'selection' | 'form'>('selection');
  const [profiles, setProfiles] = useState<any[]>([]); // 저장된 프로필 목록 상태
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    calendarType: 'solar',
    gender: 'male'
  });

  // 모달이 열릴 때마다 저장된 프로필 로드
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('saju_profiles');
      if (saved) {
        setProfiles(JSON.parse(saved));
      } else {
        setProfiles([]); // 저장된 데이터가 없으면 빈 배열
      }
      setView('selection'); // 열릴 때는 항상 선택 화면부터
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }
    const params = new URLSearchParams(formData);
    onClose();
    router.push(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-[#F7F8FA] text-gray-900 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-[#FEE500]/20 focus:border-[#FEE500] outline-none transition-all placeholder:text-gray-400 font-medium";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#3C1E1E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-[#3C1E1E] tracking-tight">
            {type === 'saju' ? '🔮 사주 분석' : '💞 환승 궁합'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {view === 'selection' ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-500 font-bold text-sm ml-1 text-center sm:text-left">
                {profiles.length > 0 ? '저장된 프로필 선택' : '저장된 프로필이 없어요!'}
              </p>
              
              {/* 저장된 프로필 목록 (있을 때만 표시) */}
              {profiles.map((profile, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    const params = new URLSearchParams(profile);
                    router.push(`/saju?${params.toString()}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-5 bg-[#F7F8FA] hover:bg-[#FEE500]/10 border border-gray-100 rounded-[1.5rem] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FEE500] flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-[#3C1E1E]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-[#3C1E1E]">{profile.name || '무명'}</p>
                    <p className="text-xs text-gray-400 font-bold">{profile.birthDate} · {profile.gender === 'male' ? '남성' : '여성'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3C1E1E] transition-colors" />
                </button>
              ))}

              {/* 새로운 사람 추가 버튼 (데이터가 없을 땐 이게 메인이 됨) */}
              <button 
                onClick={() => setView('form')}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all group",
                  profiles.length === 0 
                    ? "bg-[#FEE500] border-none shadow-lg scale-100 hover:scale-[1.02]" 
                    : "bg-white border-2 border-dashed border-gray-200 hover:border-[#FEE500]"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  profiles.length === 0 ? "bg-white/30" : "bg-gray-50 group-hover:bg-[#FEE500]/20"
                )}>
                  <Plus className={cn(
                    "w-6 h-6 transition-colors",
                    profiles.length === 0 ? "text-[#3C1E1E]" : "text-gray-400 group-hover:text-[#3C1E1E]"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn(
                    "font-black transition-colors",
                    profiles.length === 0 ? "text-[#3C1E1E]" : "text-gray-400 group-hover:text-[#3C1E1E]"
                  )}>
                    새로운 사람 추가하기
                  </p>
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium">
              분석 결과 페이지에서 '프로필 저장'을 누르면 <br/> 여기에 자동으로 나타납니다!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <p className="text-sm text-[#3C1E1E] font-black flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FEE500]" />
                  새로운 인연의 정보 입력
                </p>
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

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setView('selection')}
                className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black text-lg transition-all"
              >
                뒤로
              </button>
              <button 
                type="submit" 
                className="flex-[2] bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-5 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-[0.98]"
              >
                결과 확인하기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
