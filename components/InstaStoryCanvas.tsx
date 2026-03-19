'use client';

import React, { forwardRef } from 'react';
import { getRelationTheme } from '@/lib/relation-theme';

interface InstaStoryCanvasProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap' | 'mbti';
  relation?: string;
}

const renderTextWithBold = (text: string, emphasisColor: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} style={{ fontWeight: 900, color: emphasisColor }}>
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const T = {
  label: 30,
  name: 76,
  subtitle: 36,
  listItem: 33,
  highlight: 42,
  url: 28,
};

const S = {
  cardPaddingV: 76,
  cardPaddingH: 66,
  section: 55,
  listGap: 33,
  nameSubtitle: 44,
};

const MBTI_THEME = {
  gradient: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 45%, #A7F3D0 100%)',
  color: '#10B981',
  icon: '🧠',
  label: 'MBTI 결과 요약',
};

const SAJU_THEME = {
  gradient: 'linear-gradient(135deg, #FFD6E0 0%, #E8D5F5 100%)',
  color: '#D81B60',
  icon: '🔮',
  label: '사주 결과 요약',
};

const InstaStoryCanvas = forwardRef<HTMLDivElement, InstaStoryCanvasProps>(
  ({ userName, summaryContent, type = 'saju', relation }, ref) => {
    const relationTheme = type === 'gunghap' && relation ? getRelationTheme(relation) : null;
    const theme = type === 'mbti'
      ? MBTI_THEME
      : relationTheme
        ? { gradient: relationTheme.gradient, color: relationTheme.color, icon: relationTheme.icon, label: '궁합 결과 요약' }
        : SAJU_THEME;

    const lines = summaryContent.split('\n').map((line) => line.trim()).filter(Boolean);
    const bullets: string[] = [];
    const titleLines: string[] = [];
    let viralLine = '';

    lines.forEach((line, index) => {
      if (line.startsWith('•') || line.startsWith('-')) {
        bullets.push(line);
      } else if (index === lines.length - 1) {
        viralLine = line;
      } else {
        titleLines.push(line);
      }
    });

    if (!viralLine && bullets.length > 0) {
      viralLine = bullets[bullets.length - 1];
    }

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          background: theme.gradient,
          fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ position: 'absolute', top: '-8%', right: '-12%', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-12%', width: '1000px', height: '1000px', background: `radial-gradient(circle, ${theme.color}22 0%, rgba(255,255,255,0) 70%)`, borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '80px', left: '80px', fontSize: '120px', opacity: 0.07, lineHeight: 1 }}>{theme.icon}</div>
        <div style={{ position: 'absolute', bottom: '260px', right: '70px', fontSize: '180px', opacity: 0.09, lineHeight: 1 }}>{theme.icon}</div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.93)',
            borderRadius: '60px',
            padding: `${S.cardPaddingV}px ${S.cardPaddingH}px`,
            width: '100%',
            boxShadow: `0 40px 100px rgba(0,0,0,0.08), 0 12px 30px ${theme.color}18, inset 0 0 0 2px rgba(255,255,255,0.6)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 44px',
              backgroundColor: `${theme.color}12`,
              borderRadius: '100px',
              border: `2px solid ${theme.color}30`,
              marginBottom: `${S.section}px`,
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{theme.icon}</span>
            <span style={{ fontSize: `${T.label}px`, fontWeight: 700, color: theme.color, letterSpacing: '0.08em', opacity: 0.85, textTransform: 'uppercase' }}>
              {theme.label}
            </span>
          </div>

          <h1
            style={{
              fontSize: `${T.name}px`,
              fontWeight: 700,
              color: theme.color,
              marginBottom: 0,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              wordBreak: 'keep-all',
            }}
          >
            {userName}
          </h1>

          <div style={{ width: '80px', height: '3px', background: `linear-gradient(to right, transparent, ${theme.color}60, transparent)`, borderRadius: '2px', margin: `${S.nameSubtitle}px 0` }} />

          {titleLines.length > 0 ? (
            <div style={{ fontSize: `${T.subtitle}px`, color: '#333333', lineHeight: 1.7, fontWeight: 500, textAlign: 'center', marginBottom: `${S.section}px`, wordBreak: 'keep-all', letterSpacing: '0.01em' }}>
              {titleLines.map((line, index) => (
                <p key={index} style={{ margin: '0 0 12px 0' }}>
                  {renderTextWithBold(line, theme.color)}
                </p>
              ))}
            </div>
          ) : null}

          {bullets.length > 0 ? (
            <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.55)', borderRadius: '44px', border: '2px solid rgba(255,255,255,0.8)', padding: '50px 44px', marginBottom: `${S.section}px`, display: 'flex', flexDirection: 'column', gap: `${S.listGap}px` }}>
              {bullets.map((bullet, index) => {
                const text = bullet.replace(/^[-•]\s*/, '');
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '22px', fontSize: `${T.listItem}px`, lineHeight: 1.8, color: '#3a3a3a', fontWeight: 500, letterSpacing: '0.01em', wordBreak: 'keep-all' }}>
                    <span style={{ flexShrink: 0, fontSize: '34px', lineHeight: 1.2 }}>•</span>
                    <div style={{ flex: 1 }}>{renderTextWithBold(text, theme.color)}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {viralLine ? (
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '33px', border: '2px solid rgba(255, 255, 255, 0.9)', padding: '44px 55px', width: '100%', textAlign: 'center', boxShadow: `0 10px 30px ${theme.color}18`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '70px', opacity: 0.12, lineHeight: 1 }}>{theme.icon}</div>
              <p style={{ fontSize: `${T.highlight}px`, fontWeight: 900, color: theme.color, margin: 0, letterSpacing: '-0.01em', wordBreak: 'keep-all', lineHeight: 1.5, position: 'relative', zIndex: 2 }}>
                {renderTextWithBold(viralLine, theme.color)}
              </p>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '60px', height: '2px', background: 'rgba(255,255,255,0.4)', borderRadius: '1px' }} />
          <p style={{ fontSize: `${T.url}px`, fontWeight: 500, color: 'rgba(60,30,30,0.5)', letterSpacing: '0.05em', margin: 0, opacity: 0.7 }}>
            saju-cheatkey.kr
          </p>
        </div>
      </div>
    );
  }
);

InstaStoryCanvas.displayName = 'InstaStoryCanvas';

export default InstaStoryCanvas;
