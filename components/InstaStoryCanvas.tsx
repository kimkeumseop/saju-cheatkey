'use client';

import React, { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';

interface InstaStoryCanvasProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap';
}

const renderTextWithBold = (text: string) => {
  // Bold markers are usually **text**
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => (
    i % 2 === 1 ? <strong key={i} style={{ fontWeight: 900, color: '#D81B60' }}>{part}</strong> : <span key={i}>{part}</span>
  ));
};

const InstaStoryCanvas = forwardRef<HTMLDivElement, InstaStoryCanvasProps>(
  ({ userName, summaryContent, type = 'saju' }, ref) => {
    
    // Parse content into title, bullets, viral
    const lines = summaryContent.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets: string[] = [];
    const titleLines: string[] = [];
    let viralLine = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Identify bullet points by common emojis or dash
      if (line.startsWith('💡') || line.startsWith('✅') || line.startsWith('💖') || line.startsWith('📌') || line.startsWith('-')) {
        bullets.push(line);
      } else if (i === lines.length - 1 || line.includes('2026년') || line.includes('대폭발') || line.includes('💸')) {
        // Last line or matching keywords typically indicates the viral point
        viralLine = line;
      } else {
        titleLines.push(line);
      }
    }

    // Fallback if viralLine was caught early but was not the last line
    if (!viralLine && bullets.length > 0) {
        viralLine = bullets.pop() || '';
    }

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          background: 'linear-gradient(135deg, #FFD1D1 0%, #E6E6FA 100%)', // Coral pink to Lavender
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
        {/* Glows and decorative backgrounds (Moon & Traditional Glow) */}
        <div style={{ position: 'absolute', top: '-5%', right: '-15%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-15%', width: '1200px', height: '1200px', background: 'radial-gradient(circle, rgba(255, 200, 210, 0.8) 0%, rgba(255, 182, 193, 0) 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(230, 230, 250, 0.9) 0%, rgba(255, 255, 255, 0) 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />

        {/* Traditional/Premium accents - Abstract text shapes representing moon and energy */}
        <div style={{ position: 'absolute', top: '60px', left: '60px', fontSize: '120px', opacity: 0.15, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}>🌸</div>
        <div style={{ position: 'absolute', bottom: '250px', right: '60px', fontSize: '150px', opacity: 0.15, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}>🌕</div>

        {/* Content Container */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '60px',
            padding: '90px 70px',
            width: '100%',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.1), inset 0 0 0 2px rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Top Badge */}
          <div style={{ 
            marginBottom: '50px', 
            padding: '20px 40px', 
            backgroundColor: '#FFF0F3', 
            borderRadius: '40px', 
            color: '#D81B60', 
            fontSize: '34px', 
            fontWeight: '800', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            letterSpacing: '-0.05em',
            boxShadow: '0 10px 20px rgba(216, 27, 96, 0.1)'
          }}>
            <Sparkles size={40} style={{ color: '#D81B60' }} />
            {type === 'saju' ? '사주 치트키 초핵심 요약' : '궁합 치트키 초핵심 요약'}
            <Sparkles size={40} style={{ color: '#D81B60' }} />
          </div>

          {/* User Name */}
          <h1 style={{ 
            fontSize: '90px', 
            fontWeight: '900', 
            color: '#880E4F', 
            marginBottom: '40px', 
            textAlign: 'center', 
            letterSpacing: '-0.03em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.05)'
          }}>
            {userName}
          </h1>

          {/* Title / Intro */}
          {titleLines.length > 0 && (
            <div style={{
              fontSize: '46px',
              color: '#333333',
              lineHeight: '1.6',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '60px',
              wordBreak: 'keep-all',
              letterSpacing: '-0.02em',
            }}>
              {titleLines.map((line, idx) => (
                <p key={idx} style={{ margin: '0 0 10px 0' }}>{renderTextWithBold(line)}</p>
              ))}
            </div>
          )}

          {/* Bullet Points */}
          {bullets.length > 0 && (
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(255, 245, 247, 0.7)',
              borderRadius: '40px',
              padding: '50px 40px',
              marginBottom: '60px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}>
              {bullets.map((bullet, idx) => {
                // Extract emoji if present
                const match = bullet.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\S)\s*(.*)/);
                const emoji = match ? match[1] : '✨';
                const text = match ? match[2] : bullet;

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '24px',
                    fontSize: '40px',
                    lineHeight: '1.5',
                    color: '#444444',
                    fontWeight: '600',
                    letterSpacing: '-0.02em',
                    wordBreak: 'keep-all'
                  }}>
                    <span style={{ fontSize: '48px', lineHeight: '1.2' }}>{emoji}</span>
                    <div>{renderTextWithBold(text)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Golden Box (Viral Point) */}
          {viralLine && (
            <div style={{
              backgroundColor: '#FFF9C4', // Light gold
              border: '4px solid #FFF176',
              borderRadius: '40px',
              padding: '45px 50px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(255, 235, 59, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '90px', opacity: 0.25 }}>💸</div>
              <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', fontSize: '90px', opacity: 0.25 }}>✨</div>
              <p style={{
                fontSize: '54px',
                fontWeight: '900',
                color: '#F57F17',
                margin: 0,
                letterSpacing: '-0.04em',
                wordBreak: 'keep-all',
                position: 'relative',
                zIndex: 2,
                textShadow: '1px 1px 0px rgba(255,255,255,0.8)'
              }}>
                {renderTextWithBold(viralLine)} {viralLine.includes('💸') ? '' : '💸'}
              </p>
            </div>
          )}
        </div>

        {/* Footer / Referral */}
        <div style={{ 
          marginTop: '70px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '24px', 
          zIndex: 10 
        }}>
          <div style={{ 
            backgroundColor: '#D81B60', 
            color: 'white', 
            padding: '28px 70px', 
            borderRadius: '100px', 
            fontSize: '44px', 
            fontWeight: '800', 
            letterSpacing: '-0.05em',
            boxShadow: '0 20px 40px rgba(216, 27, 96, 0.4)',
            border: '4px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            👉 내 운명 확인하기 : saju-cheatkey.kr
          </div>
        </div>
      </div>
    );
  }
);

InstaStoryCanvas.displayName = 'InstaStoryCanvas';
export default InstaStoryCanvas;
