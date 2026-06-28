import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const runtime = 'nodejs';

const TITLE = SITE_NAME;
const SUBTITLE = '무료 사주 · 타로 · MBTI · 궁합';
const TAGLINE = '2026년 운세를 쉽고 빠르게';

// Subset only the glyphs we actually render to keep the font payload tiny.
async function loadKoreanFont(text: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error('Failed to locate Noto Sans KR font source');
  const res = await fetch(src[1]);
  if (!res.ok) throw new Error('Failed to download Noto Sans KR font');
  return res.arrayBuffer();
}

export async function GET() {
  const allText = TITLE + SUBTITLE + TAGLINE;
  const [bold, regular] = await Promise.all([
    loadKoreanFont(allText, 800),
    loadKoreanFont(allText, 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse at 50% 25%, #2a1430 0%, #14091a 55%, #0d0710 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 90,
            display: 'flex',
            fontSize: 30,
            letterSpacing: 14,
            fontWeight: 500,
            color: '#e8829a',
          }}
        >
          SAJU CHEATKEY
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 130,
            fontWeight: 800,
            color: '#f5eef2',
            letterSpacing: -2,
          }}
        >
          {TITLE}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 46,
            fontWeight: 500,
            color: 'rgba(240,232,238,0.78)',
          }}
        >
          {SUBTITLE}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            padding: '14px 34px',
            borderRadius: 999,
            fontSize: 30,
            fontWeight: 500,
            color: '#0d0710',
            background: 'linear-gradient(135deg, #ff8fb0, #9d8fff)',
          }}
        >
          {TAGLINE}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Noto Sans KR', data: bold, weight: 800, style: 'normal' },
        { name: 'Noto Sans KR', data: regular, weight: 500, style: 'normal' },
      ],
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    },
  );
}
