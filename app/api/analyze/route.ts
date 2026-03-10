import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { birthDate, birthTime, calendarType } = body;

    if (!birthDate) {
      return NextResponse.json({ success: false, error: '생년월일이 필요합니다.' }, { status: 400 });
    }

    const analysis = calculateSaju(birthDate, birthTime || "00:00", calendarType || 'solar');

    return NextResponse.json({ 
      success: true, 
      data: analysis 
    });

  } catch (error) {
    console.error('Saju Analysis Error:', error);
    return NextResponse.json({ success: false, error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
