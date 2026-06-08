'use client';

import { useState } from 'react';
import { X, Heart, Users, Plus, ChevronRight, Trash2, Clock, Smile, Flame, Users2 } from 'lucide-react';
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

const RELATIONSHIPS = [
  { id: 'couple', label: '연인', icon: '💖' },
  { id: 'some', label: '썸남/썸녀', icon: '✨' },
  { id: 'spouse', label: '배우자', icon: '💍' },
  { id: 'ex-couple', label: '전연인', icon: '💔' },
  { id: 'friend', label: '친구', icon: '🤝' },
  { id: 'colleague', label: '직장/사업', icon: '💼' },
  { id: 'idol', label: '팬심/덕질', icon: '⭐' },
  { id: 'etc', label: '기타', icon: '🔮' },
];

export default function GungHapInputModal({ isOpen, onClose }: GungHapInputModalProps) {
  const router = useRouter();
  const { profiles, deleteProfile, addProfile } = useAuth();
  
  // me: 나 선택, partner: 상대 선택, relation: 관계 선택, form: 새 정보 입력
  const [view, setView] = useState<'me' | 'partner' | 'relation' | 'form'>('me');
  const [formType, setFormType] = useState<'me' | 'partner'>('me');
  
  const [me, setMe] = useState<SajuProfile | null>(null);
  const [partner, setPartner] = useState<SajuProfile | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<string>('couple');
  
  const [formData, setFormData] = useState<SajuProfile>({
    name: '',
    birthDate: '',
    birthTime: '',
    isTimeKnown: true,
    isExactTime: true,
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
    setView('relation'); // 관계 선택 화면으로 이동
  };

  const handleRelationSelect = (relId: string) => {
    setSelectedRelation(relId);
    startAnalysis(me!, partner!, relId);
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
    const finalData = { ...formData };
    if (!formData.isTimeKnown || !formData.isExactTime) {
      finalData.birthTime = 'unknown';
    }

    try {
      await addProfile(finalData);
      if (formType === 'me') {
        setMe(finalData);
        setView('partner');
      } else {
        setPartner(finalData);
        setView('relation');
      }
    } catch (err) {
      alert('저장 실패');
    }
  };

  const startAnalysis = (user1: SajuProfile, user2: SajuProfile, rel: string) => {
    const params = new URLSearchParams();
    params.append('type', 'compatibility');
    params.append('relation', rel); // 관계 정보 추가
    
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
    router.replace(`/gunghap?${params.toString()}`);
  };

  const inputClasses = "w-full bg-white/[0.04] text-[#f5eef2] border border-white/10 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-[#d4688a]/20 focus:border-[#d4688a]/50 outline-none transition-all placeholder:text-white/30 font-medium text-sm [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer";
  const radioBtnClasses = (active: boolean) => cn(
    "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border text-xs",
    active ? "bg-[#d4688a] border-transparent text-white shadow-md shadow-[#d4688a]/30" : "bg-white/[0.03] border-white/10 text-white/40 hover:bg-white/[0.06]"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(26,14,24,0.96), rgba(13,7,16,0.97))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212,104,138,0.18)',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.6), 0 8px 40px rgba(212,104,138,0.10), 0 1px 0 rgba(255,255,255,0.05) inset',
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
              {view === 'me' ? '나는 누구인가요?' : view === 'partner' ? '상대방은 누구인가요?' : view === 'relation' ? '어떤 관계인가요?' : '정보 등록하기'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-white/40" /></button>
        </div>

        <div className="space-y-6">
          {/* 1. 나/상대 프로필 선택 뷰 */}
          {(view === 'me' || view === 'partner') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                {profiles.map((p, i) => (
                  <div key={p.id || i} onClick={() => view === 'me' ? handleMeSelect(p) : handlePartnerSelect(p)} className="w-full flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-[1.5rem] transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">👤</div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm" style={{ color: '#f5eef2' }}>{p.name}</p>
                      <p className="text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.36)' }}>{p.birthDate} · {p.gender === 'male' ? '남성' : '여성'}</p>
                    </div>
                    <button onClick={(e) => handleDelete(e, p.id)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setFormType(view as any); setView('form'); }}
                className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-[#d4688a]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-[#d4688a]/15 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-white/40 group-hover:text-[#d4688a]" />
                </div>
                <p className="font-bold flex-1 text-left" style={{ color: '#f5eef2' }}>새로운 정보 등록하기</p>
              </button>

              {view === 'partner' && (
                <button onClick={() => setView('me')} className="w-full text-center font-bold text-xs underline" style={{ color: 'rgba(212,104,138,0.7)' }}>이전 단계로</button>
              )}
            </div>
          )}

          {/* 2. 관계 선택 뷰 */}
          {view === 'relation' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-6">
              <p className="text-center font-bold text-sm" style={{ color: 'rgba(212,104,138,0.7)' }}>두 사람의 인연을 정의해주세요</p>
              <div className="grid grid-cols-2 gap-3">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => handleRelationSelect(rel.id)}
                    className="flex flex-col items-center gap-2 p-5 bg-white/[0.03] border border-white/10 rounded-[1.5rem] hover:border-[#d4688a]/50 hover:bg-[#d4688a]/10 transition-all group active:scale-95"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{rel.icon}</span>
                    <span className="font-bold text-sm" style={{ color: '#f5eef2' }}>{rel.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setView('partner')} className="w-full text-center font-bold text-xs underline mt-4" style={{ color: 'rgba(212,104,138,0.7)' }}>이전 단계로</button>
            </div>
          )}

          {/* 3. 새 정보 등록 폼 */}
          {view === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6 pb-10">
              <div className="space-y-4">
                <input type="text" placeholder="성함을 알려주세요" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/10">
                    <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={radioBtnClasses(formData.gender === 'male')}>남성</button>
                    <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={radioBtnClasses(formData.gender === 'female')}>여성</button>
                  </div>
                  <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/10">
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'solar'})} className={radioBtnClasses(formData.calendarType === 'solar')}>양력</button>
                    <button type="button" onClick={() => setFormData({...formData, calendarType: 'lunar'})} className={radioBtnClasses(formData.calendarType === 'lunar')}>음력</button>
                  </div>
                </div>
                <input type="date" className={inputClasses} value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold ml-1 flex items-center gap-2" style={{ color: '#f5eef2' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: '#d4688a' }} />태어난 시간을 아시나요?
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, isTimeKnown: true})} className={radioBtnClasses(formData.isTimeKnown)}>예</button>
                      <button type="button" onClick={() => setFormData({...formData, isTimeKnown: false})} className={radioBtnClasses(!formData.isTimeKnown)}>아니오</button>
                    </div>
                  </div>
                  
                  {formData.isTimeKnown && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-bold ml-1 italic" style={{ color: '#f5eef2' }}>정확한 시간인가요?</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, isExactTime: true})} className={radioBtnClasses(formData.isExactTime)}>예</button>
                        <button type="button" onClick={() => setFormData({...formData, isExactTime: false})} className={radioBtnClasses(!formData.isExactTime)}>아니오</button>
                      </div>
                    </div>
                  )}

                  {formData.isTimeKnown && formData.isExactTime && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-bold ml-1 uppercase tracking-widest" style={{ color: '#f5eef2' }}>Birth Time</label>
                      <input type="time" className={inputClasses} value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} required={formData.isExactTime} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setView(formType)} className="flex-1 bg-white/5 text-white/50 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors">뒤로</button>
                <button
                  type="submit"
                  className="flex-[2] text-white py-4 rounded-2xl font-bold transition hover:brightness-110 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #d4688a, #9e1c4e)', boxShadow: '0 4px 24px rgba(212,104,138,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}
                >
                  저장하고 계속
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
