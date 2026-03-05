'use client';

import { Share2, Copy, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShareButtonsProps {
  name: string;
  element: string;
}

export default function ShareButtons({ name, element }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init('e91f1178e0df9d98888b7290db014a32');
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
          title: `나의 2026년 사주 결과는? (${name}님)`,
          description: `핵심 기운: ${element}. 현대적 명리학으로 분석한 나의 올해 조언을 확인해보세요!`,
          imageUrl: `${window.location.origin}/api/og?name=${encodeURIComponent(name)}&element=${encodeURIComponent(element)}`,
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
      alert('카카오 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-12 border-t border-primary-100 mt-12">
      <h3 className="text-xl font-bold text-primary-950 text-serif">결과 공유하기</h3>
      <div className="flex gap-4">
        <button
          onClick={handleKakaoShare}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 bg-[#FEE500] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6 text-[#3C1E1E] fill-current" />
          </div>
          <span className="text-xs font-medium text-primary-600">카카오톡</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary-100 group-hover:scale-110 transition-transform">
            <Copy className="w-6 h-6 text-primary-600" />
          </div>
          <span className="text-xs font-medium text-primary-600">{copied ? '복사됨!' : '링크 복사'}</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 group"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: '명리커넥트 분석 결과',
                text: `${name}님의 핵심 기운은 ${element}입니다.`,
                url: window.location.href,
              });
            }
          }}
        >
          <div className="w-14 h-14 bg-primary-950 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-primary-600">기타 공유</span>
        </button>
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
