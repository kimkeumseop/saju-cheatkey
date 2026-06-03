'use client';

// Deterministic star positions — safe for SSR (no Math.random)
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 37 + 13) * 997) % 10000 / 100,
  y: ((i * 53 + 7) * 1009) % 10000 / 100,
  size: [1, 1, 1.5, 1, 1, 2, 1, 1, 1, 2.5][i % 10],
  opacity: [0.10, 0.18, 0.30, 0.14, 0.24, 0.45, 0.14, 0.22, 0.34, 0.55][i % 10],
  delay: (i * 0.17) % 4,
  duration: 3 + (i % 20) / 8,
  bright: i % 9 === 0,
}));

/**
 * 사이트 전역 다크 코스믹 배경.
 * 별필드 + 오로라 오브. position: fixed, z-0, pointer-events 없음.
 * 페이지 최상위 컨테이너 배경색(#0d0710)은 각 페이지에서 지정한다.
 */
export default function CosmicBackground() {
  return (
    <>
      {/* ─── STAR FIELD ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.bright ? '#ffeef5' : 'rgba(255,238,245,0.9)',
              animation: `${star.bright ? 'cosmic-twinkle-bright' : 'cosmic-twinkle'} ${star.duration}s ease-in-out ${star.delay}s infinite`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* ─── AURORA BACKGROUND ORBS ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top center — warm rose */}
        <div
          className="absolute"
          style={{
            top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '1100px', height: '900px',
            background: 'radial-gradient(ellipse, rgba(232,130,154,0.10) 0%, rgba(180,80,120,0.04) 40%, transparent 70%)',
            animation: 'aurora-drift 16s ease-in-out infinite',
          }}
        />
        {/* Right — violet */}
        <div
          className="absolute"
          style={{
            top: '5%', right: '-20%',
            width: '800px', height: '700px',
            background: 'radial-gradient(ellipse, rgba(130,90,255,0.07) 0%, transparent 65%)',
            animation: 'aurora-drift-2 20s ease-in-out infinite',
          }}
        />
        {/* Bottom left — teal */}
        <div
          className="absolute"
          style={{
            bottom: '5%', left: '-15%',
            width: '700px', height: '600px',
            background: 'radial-gradient(ellipse, rgba(0,200,140,0.05) 0%, transparent 65%)',
            animation: 'aurora-drift 24s ease-in-out 4s infinite reverse',
          }}
        />
      </div>
    </>
  );
}
