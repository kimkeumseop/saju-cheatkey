import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || '방문자';
    const strongElement = searchParams.get('element') || '목';
    
    const elementColors: Record<string, string> = {
      '목': '#22c55e',
      '화': '#ef4444',
      '토': '#eab308',
      '금': '#94a3b8',
      '수': '#1e293b',
    };

    const color = elementColors[strongElement] || '#758ef7';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #ebf0fe 0%, transparent 50%), radial-gradient(circle at 75% 75%, #fdfbe9 0%, transparent 50%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '60px 80px',
              borderRadius: '40px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#323a91', marginBottom: 20 }}>
              명리커넥트: 현대적 사주 분석
            </div>
            <div style={{ fontSize: 60, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 20 }}>
              {name}님의 핵심 기운은
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: color,
                padding: '10px 40px',
                borderRadius: '20px',
                display: 'flex',
              }}
            >
              {strongElement} (五行)
            </div>
            <div style={{ fontSize: 28, color: '#64748b', marginTop: 40 }}>
              지금 당신의 인생 지도를 확인해 보세요
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
