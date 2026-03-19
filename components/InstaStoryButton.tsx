'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Camera, Loader2 } from 'lucide-react';
import InstaStoryCanvas from './InstaStoryCanvas';

interface InstaStoryButtonProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap' | 'mbti';
  relation?: string;
}

export default function InstaStoryButton({ userName, summaryContent, type = 'saju', relation }: InstaStoryButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: type === 'mbti' ? '#ECFDF5' : '#FFF5F7',
        width: 1080,
        height: 1920,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${userName}_story.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('스토리 이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!summaryContent) return null;

  return (
    <div className="my-8 flex w-full flex-col items-center">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border-2 border-blue-400/50 bg-[#3B82F6] px-6 py-4 text-lg font-black text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:bg-[#2563EB] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            스토리 생성 중...
          </>
        ) : (
          <>
            <Camera className="h-6 w-6" />
            인스타 스토리로 저장하기
          </>
        )}
      </button>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -9999, width: 0, height: 0, overflow: 'hidden' }}>
        <InstaStoryCanvas ref={canvasRef} userName={userName} summaryContent={summaryContent} type={type} relation={relation} />
      </div>
    </div>
  );
}
