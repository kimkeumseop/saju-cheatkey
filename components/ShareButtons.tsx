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
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('e91f1178e0df9d98888b7290db014a32');
        }
      }
    };

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
          title: `나의 사주 치트키 결과는? (${name}님)`,
          description: `명리학 전문가가 분석한 나의 소름 돋는 팩폭 리포트를 확인해보세요!`,
          imageUrl: 'https://images.unsplash.com/photo-1506704980455-b6d738199d75?q=80&w=1000&auto=format&fit=crop',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '나도 팩폭 당하기 💥',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      handleCopyLink();
      alert('카카오 공유를 사용할 수 없어 현재 페이지 링크를 복사했습니다.');
    }
  };

  const shareBtnClasses = "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-md transition-all active:scale-90 relative group overflow-hidden";

  return (
    <div className="flex flex-col items-center gap-6 py-10 border-t border-gray-100 mt-10">
      <h3 className="text-lg font-black text-[#3C1E1E] tracking-tight">친구에게 결과 공유하기</h3>

      <div className="flex gap-6">
        {/* 카카오톡 */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleKakaoShare}
            className={cn(shareBtnClasses, "bg-[#FEE500] hover:bg-[#FDD835] shadow-yellow-100")}
          >
            <MessageSquare className="w-7 h-7 text-[#3C1E1E] fill-current" />
          </button>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Kakao</span>
        </div>
        
        {/* 링크 복사 */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={cn(shareBtnClasses, "bg-white border border-gray-100 text-gray-700")}
          >
            {copied ? <Check className="w-7 h-7 text-green-500" /> : <Copy className="w-7 h-7" />}
          </button>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{copied ? 'Copied' : 'Link'}</span>
        </div>

        {/* 시스템 공유 */}
        <div className="flex flex-col items-center gap-2">
          <button
            className={cn(shareBtnClasses, "bg-white border border-gray-100 text-gray-700")}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: '사주 치트키 분석 결과',
                  text: `${name}님의 인생 분석 결과입니다.`,
                  url: window.location.href,
                });
              } else {
                handleCopyLink();
              }
            }}
          >
            <Share2 className="w-7 h-7" />
          </button>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">More</span>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Kakao: any;
  }
}
