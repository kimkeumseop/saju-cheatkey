import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: Request) {
  try {
    const { user1, user2, relationship } = await req.json();
    
    // 1. 두 사람의 만세력 데이터 계산
    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType);
    
    const pillars1 = saju1.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');
    const pillars2 = saju2.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');

    // 2. 궁합 분석 프롬프트 생성
    const prompt = `
      당신은 대한민국 최고의 MZ 명리학자 '환승 궁합' 전문가입니다.
      아래 두 사람의 사주 데이터를 바탕으로 관계(${relationship})에 대한 팩폭 궁합 리포트를 작성하세요.

      [본인 정보: ${user1.name}]
      - 사주: ${pillars1} / 일간: ${saju1.dayGan} / MBTI: ${saju1.mbti}
      
      [상대방 정보: ${user2.name}]
      - 사주: ${pillars2} / 일간: ${saju2.dayGan} / MBTI: ${saju2.mbti}

      [작성 가이드라인]
      1. 말투: 연애 전문가 스타일로 직설적이고 통쾌하게
      2. 구조:
         - 시너지 점수: (0~100점)
         - 관계 한 줄 요약: (예: 만나기만 하면 싸우는데 못 헤어지는 자석 궁합)
         - 속마음 팩폭: 서로를 어떻게 생각하는지 가차 없이 분석
         - 환승 치트키: 이 관계가 잘 풀리기 위한(또는 빨리 정리하기 위한) 소름 돋는 조언
      3. 형식: JSON 형식으로 응답하세요.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, '').trim();

    return NextResponse.json({ 
      success: true, 
      analysis: JSON.parse(jsonString) 
    });

  } catch (error) {
    console.error('Gunghap API Error:', error);
    return NextResponse.json({ success: false, error: '궁합 분석 중 오류 발생' }, { status: 500 });
  }
}
