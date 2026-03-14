'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Camera, Loader2 } from 'lucide-react';
import InstaStoryCanvas from './InstaStoryCanvas';

interface InstaStoryButtonProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap';
}

export default function InstaStoryButton({ userName, summaryContent, type = 'saju' }: InstaStoryButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      setIsGenerating(true);
      // Wait a moment for fonts/layout to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#FFF5F7',
        width: 1080,
        height: 1920,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${userName}_스토리_치트키.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!summaryContent) return null;

  return (
    <div className="w-full flex flex-col items-center my-8">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full max-w-sm py-4 px-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border-2 border-blue-400/50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            스토리 생성 중...
          </>
        ) : (
          <>
            <Camera className="w-6 h-6" />
            💖 인스타 스토리로 내 운명 자랑하기
          </>
        )}
      </button>
      
      {/* Hidden Canvas using a zero-size wrapper */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', zIndex: -9999, top: '-9999px', left: '-9999px' }}>
         <InstaStoryCanvas ref={canvasRef} userName={userName} summaryContent={summaryContent} type={type} />
      </div>
    </div>
  );
}
