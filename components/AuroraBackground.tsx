'use client';

/**
 * 라이트(웜 아이보리 럭셔리) 전역 배경.
 * 아이보리 베이스 위에 아주 옅은 로즈·골드·피치 오로라 오브 + 미세한 별가루.
 * position: fixed, z-0, pointer-events 없음. 컨테이너 배경색(#FBF7F2)은 각 페이지에서 지정한다.
 * (다크 CosmicBackground의 라이트 대응. 테마 이행이 끝나면 CosmicBackground를 대체한다.)
 */

// Deterministic sparkle positions — SSR-safe (no Math.random)
const SPARKLES = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 41 + 17) * 997) % 10000 / 100,
  y: ((i * 59 + 11) * 1009) % 10000 / 100,
  size: [1, 1, 1.5, 1, 2][i % 5],
  opacity: [0.10, 0.16, 0.22, 0.12, 0.28][i % 5],
  delay: (i * 0.19) % 4,
  duration: 4 + (i % 16) / 8,
}));

export default function AuroraBackground() {
  return (
    <>
      {/* ─── SPARKLE DUST (옅은 골드빛) ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {SPARKLES.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: 'rgba(185,138,60,0.9)',
              animation: `cosmic-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* ─── SOFT AURORA ORBS ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top center — warm rose */}
        <div
          className="absolute"
          style={{
            top: '-22%', left: '50%', transform: 'translateX(-50%)',
            width: '1100px', height: '900px',
            background: 'radial-gradient(ellipse, rgba(212,104,138,0.10) 0%, rgba(212,104,138,0.04) 40%, transparent 70%)',
            animation: 'aurora-drift 16s ease-in-out infinite',
          }}
        />
        {/* Right — soft gold */}
        <div
          className="absolute"
          style={{
            top: '6%', right: '-20%',
            width: '800px', height: '700px',
            background: 'radial-gradient(ellipse, rgba(185,138,60,0.08) 0%, transparent 65%)',
            animation: 'aurora-drift-2 20s ease-in-out infinite',
          }}
        />
        {/* Bottom left — peach */}
        <div
          className="absolute"
          style={{
            bottom: '4%', left: '-15%',
            width: '760px', height: '640px',
            background: 'radial-gradient(ellipse, rgba(236,160,140,0.07) 0%, transparent 65%)',
            animation: 'aurora-drift 24s ease-in-out 4s infinite reverse',
          }}
        />
      </div>
    </>
  );
}
