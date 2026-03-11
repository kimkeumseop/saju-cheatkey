'use client';

import { useState } from 'react';
import { X, Heart, Users, Plus, ChevronRight, Trash2, Clock } from 'lucide-react';
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
  const { profiles, deleteProfile, addProfile } = useAuth();
  
  // me: 내 프로필 선택, partner: 상대 프로필 선택, form: 새 프로필 입력
  const [view, setView] = useState<'me' | 'partner' | 'form'>('me');
  const [formType, setFormType] = useState<'me' | 'partner'>('me');
  
  const [me, setMe] = useState<SajuProfile | null>(null);
  const [partner, setPartner] = useState<SajuProfile | null>(null);
  
  const [formData, setFormData] = useState<SajuProfile>({
    name: '',
    birthDate: '',
    birthTime: 'unknown',
    isTimeKnown: false,
    isExactTime: false,
    calendarType: 'solar',
    gender: 'female'
  });

  if (!isOpen) return null;

  const handleMeSelect = (profile: SajuProfile) => {
    setMe(profile);
    setView('partner');
  };

  const handlePartnerSelect = (profile: SajuProfile) => {
    setPartner(profile);
    startAnalysis(me!, profile);
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
    try {
      await addProfile(formData);
      if (formType === 'me') {
        setMe(formData);
        setView('partner');
      } else {
        startAnalysis(me!, formData);
      }
    } catch (err) {
      alert('저장 실패');
    }
  };

  const startAnalysis = (user1: SajuProfile, user2: SajuProfile) => {
    const params = new URLSearchParams();
    params.append('type', 'compatibility');
    params.append('u1_name', user1.name);
    params.append('u1_date', user1.birthDate);
    params.append('u1_time', user1.birthTime || 'unknown');
    params.append('u1_cal', user1.calendarType);
    params.append('u1_gen', user1.gender);
    
    params.append('u2_name', user2.name);
    params.append('u2_date', user2.birthDate);
    params.append('u2_time', user2.birthTime || 'unknown');
    params.append('u2_cal', user2.calendarType);
    params.append('u2_gen', user2.gender);

    onClose();
    router.replace(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-[#FFF5F7] text-gray-900 border border-pink-50 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-200 outline-none transition-all placeholder:text-gray-300 font-medium text-sm";
  const radioBtnClasses = (active: boolean) => cn(
    "flex-1 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 border-2 text-xs",
    active ? "bg-primary-900 border-primary-900 text-white shadow-md" : "bg-white border-pink-50 text-gray-300 hover:bg-pink-50/50"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
            <h3 className="text-2xl font-black text-primary-900 tracking-tight">
              {view === 'me' ? '나는 누구인가요?' : view === 'partner' ? '상대방은 누구인가요?' : '정보 등록하기'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors"><X className="w-5 h-5 text-primary-300" /></button>
        </div>

        <div className="space-y-6">
          {(view === 'me' || view === 'partner') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                {profiles.map((p, i) => (
                  <div key={p.id || i} onClick={() => view === 'me' ? handleMeSelect(p) : handlePartnerSelect(p)} className="w-full flex items-center gap-4 p-4 bg-[#FFF5F7] hover:bg-primary-50 border border-pink-50 rounded-[1.5rem] transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary-400 font-black">👤</div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-sm text-primary-900">{p.name}</p>
                      <p className="text-[10px] text-primary-300 font-bold">{p.birthDate} · {p.gender === 'male' ? '남성' : '여성'}</p>
                    </div>
                    <button onClick={(e) => handleDelete(e, p.id)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    <ChevronRight className="w-5 h-5 text-primary-200" />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => { setFormType(view as any); setView('form'); }} 
                className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border-2 border-dashed border-pink-100 hover:border-primary-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-50 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-primary-300 group-hover:text-primary-500" />
                </div>
                <p className="font-black text-primary-900 flex-1 text-left">새로운 정보 등록하기</p>
              </button>
              
              {view === 'partner' && (
                <button onClick={() => setView('me')} className="w-full text-center text-primary-300 font-bold text-xs underline">이전 단계로</button>
              )}
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <input type="text" placeholder="성함을 알려주세요" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex p-1 bg-[#FFF5F7] rounded-xl border border-pink-50">
                    <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={radioBtnClasses(formData.gender === 'male')}>남성</button>
                    <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={radioBtnClasses(formData.gender === 'female')}>여성</button>
                  </div>
                  <div className="flex p-1 bg-[#FFF5F7] rounded-xl border border-pink-50">
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={radioBtnClasses(formData.calendarType === 'solar')}>양력</button>
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={radioBtnClasses(formData.calendarType === 'lunar')}>음력</button>
                  </div>
                </div>
                <input type="date" className={inputClasses} value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setView(formType)} className="flex-1 bg-pink-50 text-primary-300 py-4 rounded-2xl font-black">뒤로</button>
                <button type="submit" className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-black shadow-lg">저장하고 계속</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
