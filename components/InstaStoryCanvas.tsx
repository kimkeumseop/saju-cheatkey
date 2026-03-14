'use client';

import React, { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';

interface InstaStoryCanvasProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap';
}

const InstaStoryCanvas = forwardRef<HTMLDivElement, InstaStoryCanvasProps>(
  ({ userName, summaryContent, type = 'saju' }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          backgroundColor: '#FFF5F7',
          fontFamily: "'Pretendard', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Background Decorations */}
        <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(255,182,193,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-20%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(244,143,177,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />

        {/* Content Container */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '60px',
            padding: '100px 80px',
            width: '100%',
            boxShadow: '0 40px 100px rgba(255, 182, 193, 0.2)',
            border: '4px solid #FFE4E8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ marginBottom: '60px', padding: '20px 40px', backgroundColor: '#FFF0F3', borderRadius: '40px', color: '#D81B60', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Sparkles size={40} style={{ color: '#D81B60' }} />
            {type === 'saju' ? '사주 치트키 초핵심 요약' : '궁합 치트키 초핵심 요약'}
            <Sparkles size={40} style={{ color: '#D81B60' }} />
          </div>

          <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#880E4F', marginBottom: '80px', textAlign: 'center', wordBreak: 'keep-all', lineHeight: '1.2' }}>
            {userName}
          </h1>

          <div
            style={{
              fontSize: '44px',
              color: '#333333',
              lineHeight: '1.8',
              fontWeight: '700',
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
              letterSpacing: '-0.02em',
            }}
          >
            {summaryContent}
          </div>
        </div>

        {/* Footer / Referral */}
        <div style={{ position: 'absolute', bottom: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 10 }}>
          <div style={{ backgroundColor: '#D81B60', color: 'white', padding: '24px 60px', borderRadius: '100px', fontSize: '36px', fontWeight: '800', boxShadow: '0 20px 40px rgba(216, 27, 96, 0.3)' }}>
            👉 내 운명 확인하기 : saju-cheatkey.kr
          </div>
          <p style={{ color: '#F06292', fontSize: '28px', fontWeight: '700' }}>당신만의 사주 치트키 리포트</p>
        </div>
      </div>
    );
  }
);

InstaStoryCanvas.displayName = 'InstaStoryCanvas';
export default InstaStoryCanvas;
