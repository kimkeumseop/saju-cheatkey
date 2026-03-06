'use client';

import { Share2, Copy, MessageSquare, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ShareButtonsProps {
  name: string;
}

export default function ShareButtons({ name }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Kakao SDK 초기화 확인 및 실행
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          // 제공된 카카오 키 사용
          window.Kakao.init('e91f1178e0df9d98888b7290db014a32');
        }
      }
    };

    // 스크립트가 로드될 때까지 기다림
    if (typeof window !== 'undefined') {
      if (window.Kakao) {
        initKakao();
      } else {
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
        script.onload = initKakao;
        document.head.appendChild(script);
      }
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `나의 2026년 인생 지도는? (${name}님)`,
          description: `현대적 명리학으로 분석한 나의 올해 운세와 기질을 확인해보세요!`,
          imageUrl: 'https://images.unsplash.com/photo-1506704980455-b6d738199d75?q=80&w=1000&auto=format&fit=crop', // 임시 이미지
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '나도 결과 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      alert('공유 기능을 준비 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const shareBtnClasses = "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 relative group overflow-hidden";

  return (
    <div className="flex flex-col items-center gap-8 py-16 border-t border-white/5 mt-16 animate-in fade-in duration-1000">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-8 bg-gold-500/20" />
        <h3 className="text-xl font-bold text-gray-200 text-serif tracking-tight">친구에게 결과 공유하기</h3>
        <div className="h-[1px] w-8 bg-gold-500/20" />
      </div>

      <div className="flex gap-6">
        {/* 카카오톡 */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleKakaoShare}
            className={cn(shareBtnClasses, "bg-[#FEE500] hover:bg-[#FDD835] hover:shadow-[#FEE500]/20 hover:shadow-2xl")}
          >
            <MessageSquare className="w-6 h-6 text-[#3C1E1E] fill-current" />
          </button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kakao</span>
        </div>
        
        {/* 링크 복사 */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleCopyLink}
            className={cn(shareBtnClasses, "bg-white/5 hover:bg-white/10 border border-white/10 text-white")}
          >
            {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
          </button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{copied ? 'Copied' : 'Link'}</span>
        </div>

        {/* 시스템 공유 */}
        <div className="flex flex-col items-center gap-3">
          <button
            className={cn(shareBtnClasses, "bg-white/5 hover:bg-white/10 border border-white/10 text-white")}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: '명리커넥트 분석 결과',
                  text: `${name}님의 인생 분석 결과입니다.`,
                  url: window.location.href,
                });
              }
            }}
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">More</span>
        </div>
      </div>
    </div>
  );
}

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}
