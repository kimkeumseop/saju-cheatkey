'use client';

import { Check, Copy, MessageSquare, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ShareButtonsProps {
  name: string;
  service?: 'saju' | 'gunghap' | 'mbti';
  shareTitle?: string;
  shareDescription?: string;
}

const DEFAULT_SHARE_META = {
  saju: {
    title: '사주 결과',
    description: '사주 분석 결과를 확인해보세요.',
  },
  gunghap: {
    title: '궁합 결과',
    description: '궁합 분석 결과를 확인해보세요.',
  },
  mbti: {
    title: 'MBTI 결과',
    description: 'MBTI 테스트 결과를 확인해보세요.',
  },
};

export default function ShareButtons({
  name,
  service = 'saju',
  shareTitle,
  shareDescription,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('e91f1178e0df9d98888b7290db014a32');
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

  const meta = DEFAULT_SHARE_META[service];
  const title = shareTitle || `${name} ${meta.title}`;
  const description = shareDescription || meta.description;

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
          title,
          description,
          imageUrl: 'https://images.unsplash.com/photo-1506704980455-b6d738199d75?q=80&w=1000&auto=format&fit=crop',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '결과 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      handleCopyLink();
    }
  };

  const shareBtnClasses = 'relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] shadow-md transition-all active:scale-90';

  return (
    <div className="mt-10 flex flex-col items-center gap-6 border-t border-gray-100 py-10">
      <h3 className="text-lg font-black tracking-tight text-[#3C1E1E]">친구에게 결과 공유하기</h3>

      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleKakaoShare}
            className={cn(shareBtnClasses, 'bg-[#FEE500] shadow-yellow-100 hover:bg-[#FDD835]')}
          >
            <MessageSquare className="h-7 w-7 fill-current text-[#3C1E1E]" />
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Kakao</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={cn(shareBtnClasses, 'border border-gray-100 bg-white text-gray-700')}
          >
            {copied ? <Check className="h-7 w-7 text-green-500" /> : <Copy className="h-7 w-7" />}
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{copied ? 'Copied' : 'Link'}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className={cn(shareBtnClasses, 'border border-gray-100 bg-white text-gray-700')}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title,
                  text: description,
                  url: window.location.href,
                });
              } else {
                handleCopyLink();
              }
            }}
          >
            <Share2 className="h-7 w-7" />
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">More</span>
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
