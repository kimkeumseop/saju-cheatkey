'use client';

import { useState, useEffect } from 'react';
import { X, User, Plus, Sparkles, ChevronRight, Calendar, Clock, Heart, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, SajuProfile } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GungHapInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GungHapInputModal({ isOpen, onClose }: GungHapInputModalProps) {
  const router = useRouter();
  const { profiles, addProfile } = useAuth();
  const [view, setView] = useState<'main' | 'selection' | 'form'>('main');
  
  // 궁합 상태
  const [person1, setPerson1] = useState<SajuProfile | null>(null);
  const [person2, setPerson2] = useState<SajuProfile | null>(null);
  const [relation, setRelation] = useState<string>('');
  const [role1, setRole1] = useState<string>('');
  const [role2, setRole2] = useState<string>('');
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<SajuProfile>({
    name: '',
    birthDate: '',
    birthTime: '',
    isTimeKnown: true,
    isExactTime: true,
    calendarType: 'solar',
    gender: 'male'
  });

  useEffect(() => {
    if (isOpen) setView('main');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProfileSelect = (profile: SajuProfile) => {
    if (selectingFor === 1) setPerson1(profile);
    else setPerson2(profile);
    setView('main');
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
      // 1. 전역 상태 및 DB에 저장
      await addProfile(finalData);

      // 2. 선택 상태 반영
      if (selectingFor === 1) setPerson1(finalData);
      else setPerson2(finalData);
      setView('main');
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const handleFinalSubmit = () => {
    if (!person1 || !person2 || !relation) {
      alert('두 사람의 정보와 관계를 모두 선택해 주세요.');
      return;
    }

    const params = new URLSearchParams();
    const serialize = (p: SajuProfile, prefix: string) => {
      Object.entries(p).forEach(([key, value]) => params.append(`${prefix}_${key}`, String(value)));
    };
    serialize(person1, 'u1');
    serialize(person2, 'u2');
    params.append('relation', relation);
    params.append('role1', role1);
    params.append('role2', role2);
    params.append('type', 'compatibility');

    onClose();
    router.push(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-[#F7F8FA] text-gray-900 border border-gray-100 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-[#FEE500]/20 focus:border-[#FEE500] outline-none transition-all placeholder:text-gray-400 font-medium";
  const radioBtnClasses = (active: boolean) => cn(
    "flex-1 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 border-2 text-sm",
    active ? "bg-[#3C1E1E] border-[#3C1E1E] text-white shadow-md" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
  );

  const relations = [
    { id: 'friend', label: '친구', emoji: '🤝' },
    { id: 'some', label: '썸남 썸녀', emoji: '☁️' },
    { id: 'couple', label: '연인', emoji: '❤️' },
    { id: 'spouse', label: '배우자', emoji: '💍' },
    { id: 'ex-couple', label: '전여친 전남친', emoji: '💔' },
    { id: 'ex-spouse', label: '전아내 전남편', emoji: '🥀' },
    { id: 'family', label: '부모와 자녀', emoji: '👨‍👩‍👧' },
    { id: 'siblings', label: '형제/자매', emoji: '👦👧' },
    { id: 'colleague', label: '직장 동료', emoji: '💻' },
    { id: 'partner', label: '사업 파트너', emoji: '🤝' },
    { id: 'idol', label: '아이돌과 팬', emoji: '✨' },
    { id: 'etc', label: '직접 입력', emoji: '📝' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#3C1E1E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <h3 className="text-2xl font-black text-[#3C1E1E] tracking-tight">환승 궁합 입력</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {view === 'main' ? (
          <div className="space-y-8 pb-4">
            <div className="space-y-4">
              <label className="text-sm font-black text-[#3C1E1E] ml-1">1. 첫 번째 사람을 선택해주세요</label>
              <button onClick={() => { setSelectingFor(1); setView('selection'); }} className={cn("w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all", person1 ? "bg-[#FEE500]/5 border-[#FEE500]" : "bg-[#F7F8FA] border-gray-100")}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", person1 ? "bg-[#FEE500]" : "bg-white")}><User className={cn("w-6 h-6", person1 ? "text-[#3C1E1E]" : "text-gray-300")} /></div>
                <div className="flex-1 text-left">{person1 ? (<><p className="font-black text-[#3C1E1E]">{person1.name || '무명'}</p><p className="text-xs text-gray-400 font-bold">{person1.birthDate}</p></>) : <p className="font-bold text-gray-400">인물 선택 또는 추가</p>}</div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <label className="text-sm font-black text-[#3C1E1E] ml-1 block mt-6">2. 두 번째 사람을 선택해주세요</label>
              <button onClick={() => { setSelectingFor(2); setView('selection'); }} className={cn("w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all", person2 ? "bg-[#FEE500]/5 border-[#FEE500]" : "bg-[#F7F8FA] border-gray-100")}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", person2 ? "bg-[#FEE500]" : "bg-white")}><Users className={cn("w-6 h-6", person2 ? "text-[#3C1E1E]" : "text-gray-300")} /></div>
                <div className="flex-1 text-left">{person2 ? (<><p className="font-black text-[#3C1E1E]">{person2.name || '무명'}</p><p className="text-xs text-gray-400 font-bold">{person2.birthDate}</p></>) : <p className="font-bold text-gray-400">인물 선택 또는 추가</p>}</div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-[#3C1E1E] ml-1">3. 두 사람은 어떤 관계인가요? (필수)</label>
              <div className="grid grid-cols-2 gap-2">
                {relations.map((rel) => (
                  <button key={rel.id} onClick={() => setRelation(rel.id)} className={cn("py-3.5 px-4 rounded-2xl border-2 text-[13px] font-black transition-all flex items-center gap-3", relation === rel.id ? "bg-[#FEE500]/10 border-[#FEE500] text-[#3C1E1E]" : "bg-white border-gray-50 text-gray-400")}>
                    <span className="text-lg">{rel.emoji}</span>{rel.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-[#3C1E1E] ml-1">4. 각자의 역할을 입력해주세요 (선택)</label>
              <div className="space-y-3">
                <input type="text" placeholder="1번 사람 역할 (예: 나, 신청자)" className={cn(inputClasses, "py-3.5")} value={role1} onChange={e => setRole1(e.target.value)} />
                <input type="text" placeholder="2번 사람 역할 (예: 그분, 상대방)" className={cn(inputClasses, "py-3.5")} value={role2} onChange={e => setRole2(e.target.value)} />
              </div>
            </div>

            <button onClick={handleFinalSubmit} disabled={!person1 || !person2 || !relation} className={cn("w-full py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3", (person1 && person2 && relation) ? "bg-[#FEE500] text-[#3C1E1E]" : "bg-gray-100 text-gray-300 cursor-not-allowed")}>💞 궁합 보기<ChevronRight className="w-6 h-6" /></button>
          </div>
        ) : view === 'selection' ? (
          <div className="space-y-6">
            <p className="text-gray-500 font-bold text-sm ml-1">저장된 프로필 선택</p>
            <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2">
              {profiles.map((profile, index) => (
                <button key={profile.id || index} onClick={() => handleProfileSelect(profile)} className="w-full flex items-center gap-4 p-4 bg-[#F7F8FA] hover:bg-[#FEE500]/10 border border-gray-100 rounded-[1.5rem] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE500] flex items-center justify-center shadow-sm"><User className="w-5 h-5 text-[#3C1E1E]" /></div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-sm text-[#3C1E1E]">{profile.name || '무명'}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{profile.birthDate} · {profile.gender === 'male' ? '남성' : '여성'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3C1E1E] transition-colors" />
                </button>
              ))}
            </div>
            <button onClick={() => setView('form')} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border-2 border-dashed border-gray-200 hover:border-[#FEE500] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#FEE500]/20 flex items-center justify-center transition-colors"><Plus className="w-6 h-6 text-gray-400 group-hover:text-[#3C1E1E]" /></div>
              <p className="font-black text-[#3C1E1E] flex-1 text-left">새로운 사람 정보 입력하기</p>
            </button>
            <button onClick={() => setView('main')} className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-black">뒤로가기</button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="text-center mb-4"><p className="text-sm text-[#3C1E1E] font-black flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-[#FEE500]" />정보 입력</p></div>
            <div className="space-y-6">
              <input type="text" placeholder="이름" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex p-1 bg-[#F7F8FA] rounded-2xl border border-gray-100">
                  <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={radioBtnClasses(formData.gender === 'male')}>남성</button>
                  <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={radioBtnClasses(formData.gender === 'female')}>여성</button>
                </div>
                <div className="flex p-1 bg-[#F7F8FA] rounded-2xl border border-gray-100">
                  <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={radioBtnClasses(formData.calendarType === 'solar')}>양력</button>
                  <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={radioBtnClasses(formData.calendarType === 'lunar')}>음력</button>
                </div>
              </div>
              <input type="date" className={inputClasses} value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
              
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <label className="text-sm font-black text-[#3C1E1E] ml-1 flex items-center gap-2"><Clock className="w-4 h-4 text-[#FEE500]" />태어난 시간을 아시나요?</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setFormData({...formData, isTimeKnown: true})} className={radioBtnClasses(formData.isTimeKnown)}>예</button>
                    <button type="button" onClick={() => setFormData({...formData, isTimeKnown: false})} className={radioBtnClasses(!formData.isTimeKnown)}>아니오</button>
                  </div>
                </div>
                {formData.isTimeKnown && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-black text-[#3C1E1E] ml-1">정확한 시간을 아시나요?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setFormData({...formData, isExactTime: true})} className={radioBtnClasses(formData.isExactTime)}>예</button>
                      <button type="button" onClick={() => setFormData({...formData, isExactTime: false})} className={radioBtnClasses(!formData.isExactTime)}>아니오</button>
                    </div>
                  </div>
                )}
                {formData.isTimeKnown && formData.isExactTime && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-black text-[#3C1E1E] ml-1">태어난 시간 입력</label>
                    <input type="time" className={inputClasses} value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} required={formData.isExactTime} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setView('selection')} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black">취소</button>
              <button type="submit" className="flex-[2] bg-[#FEE500] text-[#3C1E1E] py-4 rounded-2xl font-black shadow-lg">확인</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
