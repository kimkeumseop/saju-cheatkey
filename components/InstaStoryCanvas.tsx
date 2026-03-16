'use client';

import React, { forwardRef } from 'react';
import { getRelationTheme } from '@/lib/relation-theme';

interface InstaStoryCanvasProps {
  userName: string;
  summaryContent: string;
  type?: 'saju' | 'gunghap';
  /** 궁합 관계 유형 (DB 저장 키: couple | some | spouse | … ) */
  relation?: string;
}

// 굵은 텍스트 렌더링 (**bold**)
const renderTextWithBold = (text: string, emphasisColor: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 900, color: emphasisColor }}>
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

// 1080px 캔버스 기준 타이포 스케일 (디자인 기준값 × 2.75)
const T = {
  label: 30,           // 11px × 2.75
  name: 76,            // 28px × 2.75
  subtitle: 36,        // 13px × 2.75
  listItem: 33,        // 12px × 2.75
  highlight: 42,       // 14px × 3.0 (강조)
  url: 28,             // 10px × 2.75
};

// 1080px 캔버스 기준 간격 스케일
const S = {
  cardPaddingV: 76,    // 28px
  cardPaddingH: 66,    // 24px
  section: 55,         // 20px
  listGap: 33,         // 12px
  nameSubtitle: 44,    // 16px
};

const InstaStoryCanvas = forwardRef<HTMLDivElement, InstaStoryCanvasProps>(
  ({ userName, summaryContent, type = 'saju', relation }, ref) => {

    // ── 테마 색상 결정 ───────────────────────────────────────────
    const DEFAULT_GRADIENT = 'linear-gradient(135deg, #FFD6E0 0%, #E8D5F5 100%)';
    const DEFAULT_COLOR = '#D81B60';

    const theme = type === 'gunghap' && relation
      ? getRelationTheme(relation)
      : null;

    const bgGradient = theme ? theme.gradient : DEFAULT_GRADIENT;
    const themeColor = theme ? theme.color : DEFAULT_COLOR;
    const themeIcon = theme ? theme.icon : '🌸';

    // ── 콘텐츠 파싱 ──────────────────────────────────────────────
    const lines = summaryContent.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets: string[] = [];
    const titleLines: string[] = [];
    let viralLine = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.startsWith('💡') ||
        line.startsWith('✅') ||
        line.startsWith('💖') ||
        line.startsWith('📌') ||
        line.startsWith('-')
      ) {
        bullets.push(line);
      } else if (
        i === lines.length - 1 ||
        line.includes('2026년') ||
        line.includes('대폭발') ||
        line.includes('💸')
      ) {
        viralLine = line;
      } else {
        titleLines.push(line);
      }
    }

    if (!viralLine && bullets.length > 0) {
      viralLine = bullets.pop() || '';
    }

    // ── 렌더링 ───────────────────────────────────────────────────
    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          background: bgGradient,
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
        {/* ── 배경 블롭 장식 ── */}
        <div style={{
          position: 'absolute', top: '-8%', right: '-12%',
          width: '900px', height: '900px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8%', left: '-12%',
          width: '1000px', height: '1000px',
          background: `radial-gradient(circle, ${themeColor}22 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: '50%', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: '5%',
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%', filter: 'blur(20px)',
        }} />

        {/* ── 배경 테마 아이콘 장식 ── */}
        <div style={{
          position: 'absolute', bottom: '260px', right: '70px',
          fontSize: '180px', opacity: 0.09,
          filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.6))',
          lineHeight: 1,
        }}>
          {themeIcon}
        </div>
        <div style={{
          position: 'absolute', top: '80px', left: '80px',
          fontSize: '120px', opacity: 0.07,
          lineHeight: 1,
        }}>
          {type === 'saju' ? '🌙' : themeIcon}
        </div>

        {/* ── 메인 콘텐츠 카드 ── */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.93)',
          borderRadius: '60px',
          padding: `${S.cardPaddingV}px ${S.cardPaddingH}px`,
          width: '100%',
          boxShadow: `0 40px 100px rgba(0,0,0,0.08), 0 12px 30px ${themeColor}18, inset 0 0 0 2px rgba(255,255,255,0.6)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}>

          {/* ── 작업 1·5: 상단 라벨 배지 ── */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 44px',
            backgroundColor: `${themeColor}12`,
            borderRadius: '100px',
            border: `2px solid ${themeColor}30`,
            marginBottom: `${S.section}px`,
          }}>
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{themeIcon}</span>
            <span style={{
              fontSize: `${T.label}px`,
              fontWeight: 700,
              color: themeColor,
              letterSpacing: '0.08em',
              opacity: 0.85,
              textTransform: 'uppercase' as const,
            }}>
              {type === 'saju' ? '사주 치트키 핵심 요약' : '궁합 치트키 핵심 요약'}
            </span>
          </div>

          {/* ── 작업 1: 이름 ── */}
          <h1 style={{
            fontSize: `${T.name}px`,
            fontWeight: 700,
            color: themeColor,
            marginBottom: 0,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            wordBreak: 'keep-all' as const,
            textShadow: `0 2px 8px ${themeColor}25`,
          }}>
            {userName}
          </h1>

          {/* 이름과 부제 사이 구분선 */}
          <div style={{
            width: '80px',
            height: '3px',
            background: `linear-gradient(to right, transparent, ${themeColor}60, transparent)`,
            borderRadius: '2px',
            margin: `${S.nameSubtitle}px 0`,
          }} />

          {/* ── 작업 1: 부제 한 줄 요약 ── */}
          {titleLines.length > 0 && (
            <div style={{
              fontSize: `${T.subtitle}px`,
              color: '#333333',
              lineHeight: 1.7,
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: `${S.section}px`,
              wordBreak: 'keep-all' as const,
              letterSpacing: '0.01em',
            }}>
              {titleLines.map((line, idx) => (
                <p key={idx} style={{ margin: '0 0 12px 0' }}>
                  {renderTextWithBold(line, themeColor)}
                </p>
              ))}
            </div>
          )}

          {/* ── 작업 1·2: 핵심 특징 리스트 ── */}
          {bullets.length > 0 && (
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
              borderRadius: '44px',
              border: '2px solid rgba(255,255,255,0.8)',
              padding: '50px 44px',
              marginBottom: `${S.section}px`,
              display: 'flex',
              flexDirection: 'column' as const,
              gap: `${S.listGap}px`,
            }}>
              {bullets.map((bullet, idx) => {
                const match = bullet.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u{1F000}-\u{1FFFF}]|\S)\s*(.*)/u);
                const emoji = match ? match[1] : '·';
                const text = match ? match[2] : bullet;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '22px',
                    fontSize: `${T.listItem}px`,
                    lineHeight: 1.8,
                    color: '#3a3a3a',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    wordBreak: 'keep-all' as const,
                  }}>
                    <span style={{ fontSize: '40px', lineHeight: 1.3, flexShrink: 0 }}>{emoji}</span>
                    <div style={{ flex: 1 }}>{renderTextWithBold(text, themeColor)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 작업 3: 하단 강조 박스 (흰색 반투명 frosted) ── */}
          {viralLine && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '33px',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              padding: '44px 55px',
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 10px 30px ${themeColor}18`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-15px', right: '-15px',
                fontSize: '70px', opacity: 0.12, lineHeight: 1,
              }}>
                {themeIcon}
              </div>
              <p style={{
                fontSize: `${T.highlight}px`,
                fontWeight: 900,
                color: themeColor,
                margin: 0,
                letterSpacing: '-0.01em',
                wordBreak: 'keep-all' as const,
                lineHeight: 1.5,
                position: 'relative',
                zIndex: 2,
              }}>
                {renderTextWithBold(viralLine, themeColor)}
              </p>
            </div>
          )}
        </div>

        {/* ── 작업 5: URL 하단 텍스트 (버튼 없이 심플하게) ── */}
        <div style={{
          marginTop: '60px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '60px', height: '2px',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '1px',
          }} />
          <p style={{
            fontSize: `${T.url}px`,
            fontWeight: 500,
            color: 'rgba(60,30,30,0.5)',
            letterSpacing: '0.05em',
            margin: 0,
            opacity: 0.7,
          }}>
            saju-cheatkey.kr
          </p>
        </div>
      </div>
    );
  }
);

InstaStoryCanvas.displayName = 'InstaStoryCanvas';
export default InstaStoryCanvas;
