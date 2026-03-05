'use client';
import { useState, useEffect } from 'react';
import { BookOpen, User, Briefcase, Heart, MessageCircle, Lock, Sparkles } from 'lucide-react';

interface Props { sajuData: any; userName?: string; gender: string; }

export default function AiCounseling({ sajuData, userName, gender }: Props) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sajuData, userName, gender }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.details);
        setAiAnalysis(data);
      } catch (err: any) { setError(err.message); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [sajuData, userName, gender]);

  const handlePayment = () => {
    const { IMP } = window as any;
    if (!IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    IMP.init('imp00000000'); // 테스트용 가맹점 식별코드 (실제 코드로 변경 필요)

    IMP.request_pay({
      pg: 'kakaopay.TC0ONETIME', // 테스트용 카카오페이
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: '프리미엄 사주 리포트 (심층 분석 4종)',
      amount: 1900,
      buyer_name: userName || '방문자',
    }, function (rsp: any) {
      if (rsp.success) {
        setIsUnlocked(true);
        alert('결제가 완료되었습니다! 모든 분석 내용이 해제되었습니다.');
      } else {
        alert(`결제에 실패하였습니다: ${rsp.error_msg}`);
      }
    });
  };

  const tabs = [
    { id: 'basic', label: '사주 뜻풀이', icon: BookOpen, locked: false },
    { id: 'overall', label: '종합 총평', icon: User, locked: !isUnlocked },
    { id: 'career', label: '직업·재물', icon: Briefcase, locked: !isUnlocked },
    { id: 'love', label: '연애·관계', icon: Heart, locked: !isUnlocked },
    { id: 'advice', label: '올해의 조언', icon: MessageCircle, locked: !isUnlocked },
  ];

  if (isLoading) return <div className="text-center py-20 text-gray-400">AI가 명식을 정성껏 풀이하고 있습니다...</div>;
  if (error) return <div className="text-center py-20 text-red-400">오류: {error}</div>;

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl mt-12">
      <div className="flex border-b border-slate-700 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'border-gold-500 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.locked && <Lock className="w-3 h-3 text-slate-500" />}
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        <div className={`prose prose-invert max-w-none bg-slate-800/30 p-6 md:p-8 rounded-xl border border-slate-700/50 transition-all duration-500 ${currentTab?.locked ? 'blur-md select-none pointer-events-none opacity-40' : ''}`}>
          <p className="text-gray-100 leading-[2.0] text-lg whitespace-pre-wrap font-light first-letter:text-4xl first-letter:font-extrabold first-letter:text-gold-400 first-letter:mr-1">
            {aiAnalysis && aiAnalysis[activeTab]}
          </p>
        </div>

        {currentTab?.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-gold-500/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] max-w-md animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-gold-400" />
              </div>
              <h4 className="text-2xl font-bold text-gray-100 mb-2">프리미엄 심층 분석</h4>
              <p className="text-gray-400 mb-8 leading-relaxed">
                종합 총평, 재물운, 연애운, 그리고 2026년 상세 조언까지!<br/>
                단 한 번의 결제로 모든 잠금을 해제하세요.
              </p>
              <button 
                onClick={handlePayment}
                className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                1,900원으로 평생 소장하기
              </button>
              <p className="text-xs text-slate-500 mt-4 italic">
                * 결제 후 페이지를 새로고침해도 분석 내용은 유지됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Portone SDK 타입 정의
declare global {
  interface Window {
    IMP: any;
  }
}
