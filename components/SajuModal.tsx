'use client';

import { useState, useEffect } from 'react';
import { X, User, Plus, Sparkles, ChevronRight, Calendar, Clock, Moon, Heart, ChevronDown, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, SajuProfile } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SajuModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'saju' | 'unse';
}

export default function SajuModal({ isOpen, onClose, type = 'saju' }: SajuModalProps) {
  const router = useRouter();
  const { profiles, addProfile, deleteProfile } = useAuth();
  const [view, setView] = useState<'selection' | 'form'>('selection');
  
  const [formData, setFormData] = useState<SajuProfile>({
    name: '',
    birthDate: '',
    birthTime: '',
    isTimeKnown: true,
    isExactTime: true,
    calendarType: 'solar',
    gender: 'female'
  });

  // 생년월일 분리 상태
  const [birthParts, setBirthParts] = useState({
    year: '',
    month: '',
    day: ''
  });

  // 태어난 시각 분리 상태
  const [timeParts, setTimeParts] = useState({
    ampm: 'AM',
    hour: '',
    minute: ''
  });

  useEffect(() => {
    if (isOpen) {
      setView('selection');
      // 모달 열릴 때 상태 초기화
      setBirthParts({ year: '', month: '', day: '' });
      setTimeParts({ ampm: 'AM', hour: '', minute: '' });
    }
  }, [isOpen]);

  // 분리된 상태가 변경될 때마다 formData.birthDate 업데이트하는 핸들러
  const handleBirthChange = (field: 'year' | 'month' | 'day', value: string) => {
    const newParts = { ...birthParts, [field]: value };
    
    // 월/년 변경 시 일자 유효성 체크
    if ((field === 'year' || field === 'month') && newParts.year && newParts.month && newParts.day) {
      const maxDays = new Date(Number(newParts.year), Number(newParts.month), 0).getDate();
      if (Number(newParts.day) > maxDays) {
        newParts.day = String(maxDays);
      }
    }
    
    setBirthParts(newParts);
    
    if (newParts.year && newParts.month && newParts.day) {
      const formattedMonth = newParts.month.padStart(2, '0');
      const formattedDay = newParts.day.padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        birthDate: `${newParts.year}-${formattedMonth}-${formattedDay}`
      }));
    }
  };

  // 태어난 시각 상태 변경 시 formData.birthTime 업데이트하는 핸들러
  const handleTimeChange = (field: 'ampm' | 'hour' | 'minute', value: string) => {
    const newParts = { ...timeParts, [field]: value };
    setTimeParts(newParts);
    
    if (newParts.hour && newParts.minute) {
      let h = parseInt(newParts.hour);
      if (newParts.ampm === 'PM' && h < 12) h += 12;
      if (newParts.ampm === 'AM' && h === 12) h = 0;
      
      const formattedHour = String(h).padStart(2, '0');
      const formattedMinute = newParts.minute.padStart(2, '0');
      
      setFormData(prev => ({
        ...prev,
        birthTime: `${formattedHour}:${formattedMinute}`
      }));
    }
  };

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i));
  
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  };

  const daysCount = getDaysInMonth(birthParts.year, birthParts.month);
  const days = Array.from({ length: daysCount }, (_, i) => String(i + 1));

  const handleProfileSelect = (profile: SajuProfile) => {
    const params = new URLSearchParams();
    Object.entries(profile).forEach(([key, value]) => params.append(key, String(value)));
    onClose();
    const targetPath = type === 'unse' ? '/unse/result' : '/saju';
    // push 대신 replace 사용하여 히스토리 방지
    router.replace(`${targetPath}?${params.toString()}`);
  };

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm('이 프로필을 삭제하시겠습니까?')) {
      try { await deleteProfile(id); } catch (err) { alert('삭제 실패'); }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    const finalData = { ...formData };
    if (!formData.isTimeKnown || !formData.isExactTime) {
      finalData.birthTime = 'unknown';
    }

    try {
      await addProfile(finalData);
      const params = new URLSearchParams();
      Object.entries(finalData).forEach(([key, value]) => params.append(key, String(value)));
      onClose();
      const targetPath = type === 'unse' ? '/unse/result' : '/saju';
      // push 대신 replace 사용하여 히스토리 방지
      router.replace(`${targetPath}?${params.toString()}`);
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const inputClasses = "w-full bg-black/[0.04] text-[#2D1B1E] border border-black/10 rounded-2xl py-3 sm:py-4 px-4 focus:ring-4 focus:ring-[#d4688a]/20 focus:border-[#d4688a]/50 outline-none transition-all placeholder:text-black/30 font-medium [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer appearance-none [&>option]:bg-[#FFFFFF] [&>option]:text-[#2D1B1E]";
  const radioBtnClasses = (active: boolean) => cn(
    "flex-1 py-2.5 sm:py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border text-sm",
    active ? "bg-[#d4688a] border-transparent text-white shadow-md shadow-[#d4688a]/30" : "bg-black/[0.03] border-black/10 text-black/40 hover:bg-black/[0.06]"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        style={{
          background: '#FFFFFF',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212,104,138,0.18)',
          boxShadow: '0 -8px 60px rgba(45,27,30,0.14), 0 8px 40px rgba(212,104,138,0.12)',
        }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-8 flex-shrink-0">
          <div className="flex items-center gap-2">
            {type === 'unse'
              ? <Moon className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />
              : <Sparkles className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />}
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
              {type === 'unse' ? '오늘의 속삭임' : '사주 분석'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X className="w-5 h-5 text-black/40" /></button>
        </div>

        <div className="overflow-y-auto flex-1 no-scrollbar -mx-1 px-1">
          {view === 'selection' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="font-bold text-sm ml-1 italic" style={{ color: 'rgba(212,104,138,0.7)' }}>나의 인연 정보 선택</p>
                {profiles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                    {profiles.map((profile, index) => (
                      <button key={profile.id || index} onClick={() => handleProfileSelect(profile)} className="w-full flex items-center gap-4 p-4 bg-black/[0.03] hover:bg-black/[0.06] border border-black/10 rounded-[1.5rem] transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-lg">👤</div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm" style={{ color: '#2D1B1E' }}>{profile.name || '무명'}</p>
                          <p className="text-[10px] font-bold" style={{ color: 'rgba(45,27,30,0.36)' }}>{profile.birthDate} · {profile.gender === 'male' ? '남성' : '여성'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => handleDelete(e, profile.id)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-[#d4688a] transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center rounded-[1.5rem] border-2 border-dashed border-black/10 bg-black/[0.02]">
                    <p className="font-bold text-sm" style={{ color: 'rgba(45,27,30,0.36)' }}>아직 등록된 정보가 없어요!</p>
                  </div>
                )}
                <button onClick={() => setView('form')} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-black/[0.02] border-2 border-dashed border-black/10 hover:border-[#d4688a]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-black/5 group-hover:bg-[#d4688a]/15 flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6 text-black/40 group-hover:text-[#d4688a]" />
                  </div>
                  <p className="font-bold flex-1 text-left" style={{ color: '#2D1B1E' }}>새로운 정보 등록하기</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col h-full space-y-5 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6 flex-1">
                <input type="text" placeholder="성함을 알려주세요" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex p-1 bg-black/[0.03] rounded-2xl border border-black/10">
                    <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={radioBtnClasses(formData.gender === 'male')}>남성</button>
                    <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={radioBtnClasses(formData.gender === 'female')}>여성</button>
                  </div>
                  <div className="flex p-1 bg-black/[0.03] rounded-2xl border border-black/10">
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={radioBtnClasses(formData.calendarType === 'solar')}>양력</button>
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={radioBtnClasses(formData.calendarType === 'lunar')}>음력</button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#2D1B1E] ml-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: '#d4688a' }} />태어난 생년월일
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <select 
                        className={cn(inputClasses, "pr-8")} 
                        value={birthParts.year} 
                        onChange={e => handleBirthChange('year', e.target.value)}
                        required
                      >
                        <option value="" disabled>년</option>
                        {years.map(y => <option key={y} value={y}>{y}년</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                    </div>
                    <div className="flex-1 relative">
                      <select 
                        className={cn(inputClasses, "pr-8")} 
                        value={birthParts.month} 
                        onChange={e => handleBirthChange('month', e.target.value)}
                        required
                      >
                        <option value="" disabled>월</option>
                        {months.map(m => <option key={m} value={m}>{m}월</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                    </div>
                    <div className="flex-1 relative">
                      <select 
                        className={cn(inputClasses, "pr-8")} 
                        value={birthParts.day} 
                        onChange={e => handleBirthChange('day', e.target.value)}
                        required
                      >
                        <option value="" disabled>일</option>
                        {days.map(d => <option key={d} value={d}>{d}일</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4 border-t border-black/10">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-sm font-bold text-[#2D1B1E] ml-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#d4688a' }} />태어난 시간을 아시나요?
                    </label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setFormData({...formData, isTimeKnown: true})} className={radioBtnClasses(formData.isTimeKnown)}>예</button>
                      <button type="button" onClick={() => setFormData({...formData, isTimeKnown: false})} className={radioBtnClasses(!formData.isTimeKnown)}>아니오</button>
                    </div>
                  </div>
                  {formData.isTimeKnown && (
                    <div className="space-y-2 sm:space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-bold text-[#2D1B1E] ml-1 italic">정확한 시간인가요?</label>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setFormData({...formData, isExactTime: true})} className={radioBtnClasses(formData.isExactTime)}>예</button>
                        <button type="button" onClick={() => setFormData({...formData, isExactTime: false})} className={radioBtnClasses(!formData.isExactTime)}>아니오</button>
                      </div>
                    </div>
                  )}
                  {formData.isTimeKnown && formData.isExactTime && (
                    <div className="space-y-2 sm:space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-bold text-[#2D1B1E] ml-1">태어난 시각 입력</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <select 
                            className={cn(inputClasses, "pr-8")} 
                            value={timeParts.ampm} 
                            onChange={e => handleTimeChange('ampm', e.target.value)}
                            required
                          >
                            <option value="AM">오전</option>
                            <option value="PM">오후</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                        </div>
                        <div className="flex-1 relative">
                          <select 
                            className={cn(inputClasses, "pr-8")} 
                            value={timeParts.hour} 
                            onChange={e => handleTimeChange('hour', e.target.value)}
                            required
                          >
                            <option value="" disabled>시</option>
                            {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                        </div>
                        <div className="flex-1 relative">
                          <select 
                            className={cn(inputClasses, "pr-8")} 
                            value={timeParts.minute} 
                            onChange={e => handleTimeChange('minute', e.target.value)}
                            required
                          >
                            <option value="" disabled>분</option>
                            {minutes.map(m => <option key={m} value={m}>{m.padStart(2, '0')}분</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2 sm:pt-4 sticky bottom-0 backdrop-blur-sm border-t border-black/10 pb-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.92)' }}>
                <button type="button" onClick={() => setView('selection')} className="flex-1 bg-black/5 text-black/50 py-3.5 sm:py-5 rounded-2xl font-bold text-lg hover:bg-black/10 transition-colors">뒤로</button>
                <button
                  type="submit"
                  className="flex-[2] text-white py-3.5 sm:py-5 rounded-2xl font-bold text-lg active:scale-[0.98] transition hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #d4688a, #c2255c)', boxShadow: '0 4px 24px rgba(212,104,138,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}
                >
                  {type === 'unse' ? '속삭임 듣기 ✨' : '분석 시작하기 🚀'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
