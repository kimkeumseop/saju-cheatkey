'use client';

import { useState } from 'react';
import { X, Heart, Users, Plus, ChevronRight } from 'lucide-react';
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
  const { profiles } = useAuth();
  const [step, setView] = useState<'me' | 'partner'>('me');
  const [me, setMe] = useState<SajuProfile | null>(null);
  const [partner, setPartner] = useState<SajuProfile | null>(null);
  
  const [partnerForm, setPartnerForm] = useState<SajuProfile>({
    name: '',
    birthDate: '',
    birthTime: 'unknown',
    isTimeKnown: false,
    isExactTime: false,
    calendarType: 'solar',
    gender: 'male'
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

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startAnalysis(me!, partnerForm);
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
    // push 대신 replace 사용하여 히스토리 방지
    router.replace(`/saju?${params.toString()}`);
  };

  const inputClasses = "w-full bg-[#FFF5F7] text-gray-900 border border-pink-50 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-200 outline-none transition-all placeholder:text-gray-300 font-medium";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-500 fill-primary-500" />
            <h3 className="text-2xl font-black text-primary-900 tracking-tight">
              {step === 'me' ? '나는 누구인가요?' : '상대방은 누구인가요?'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors"><X className="w-5 h-5 text-primary-300" /></button>
        </div>

        <div className="space-y-6">
          {step === 'me' ? (
            <div className="grid grid-cols-1 gap-3">
              {profiles.map((p, i) => (
                <button key={i} onClick={() => handleMeSelect(p)} className="w-full flex items-center gap-4 p-4 bg-[#FFF5F7] hover:bg-primary-50 border border-pink-50 rounded-[1.5rem] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary-400 font-black">👤</div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-sm text-primary-900">{p.name}</p>
                    <p className="text-[10px] text-primary-300 font-bold">{p.birthDate}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary-200" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handlePartnerSubmit} className="space-y-6">
              <input type="text" placeholder="상대방 이름" className={inputClasses} value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} required />
              <input type="date" className={inputClasses} value={partnerForm.birthDate} onChange={e => setPartnerForm({...partnerForm, birthDate: e.target.value})} required />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPartnerForm({...partnerForm, gender: 'male'})} className={cn("py-4 rounded-xl font-black border-2 transition-all", partnerForm.gender === 'male' ? "bg-primary-900 border-primary-900 text-white" : "bg-white border-pink-50 text-gray-300")}>남성</button>
                <button type="button" onClick={() => setPartnerForm({...partnerForm, gender: 'female'})} className={cn("py-4 rounded-xl font-black border-2 transition-all", partnerForm.gender === 'female' ? "bg-primary-900 border-primary-900 text-white" : "bg-white border-pink-50 text-gray-300")}>여성</button>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98]">궁합 분석 시작 💖</button>
              <button type="button" onClick={() => setView('me')} className="w-full text-primary-300 font-bold text-sm">이전 단계로</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
