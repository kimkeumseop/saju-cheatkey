import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Solar } from 'lunar-javascript';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: Request) {
  try {
    const { name, birthDate, birthTime, calendarType } = await req.json();
    
    // 1. 유저 만세력 데이터
    const userSaju = calculateSaju(birthDate, birthTime, calendarType);
    const userPillars = userSaju.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');

    // 2. 오늘의 일진 데이터 (KST 기준)
    const now = new Date();
    // 한국 시간으로 보정된 현재 날짜 객체 생성
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    
    const todaySolar = Solar.fromDate(kstDate);
    const todayLunar = todaySolar.getLunar();
    const todayPillars = todayLunar.getEightChar().getDayGan() + todayLunar.getEightChar().getDayZhi();

    // 3. 운세 분석 프롬프트 생성
    const prompt = `
      당신은 대한민국 최고의 MZ 명리학자 '오늘의 치트키'입니다.
      아래 유저의 사주와 오늘의 일진 데이터를 바탕으로 하루 운세 팩폭 리포트를 작성하세요.

      [유저 정보: ${name}]
      - 사주: ${userPillars} / 일간: ${userSaju.dayGan}

      [오늘의 정보]
      - 오늘의 날짜: ${kstDate.toISOString().split('T')[0]}
      - 오늘의 일진: ${todayPillars}

      [작성 가이드라인]
      1. 말투: 오늘 하루를 가이드해주는 츤데레 스타일로 유머러스하게
      2. 구조:
         - 오늘의 팩폭: 오늘 유저가 겪을 핵심 상황 1개
         - 럭키 가이드: 행운의 컬러, 숫자, 아이템
         - 피해야 할 것: 오늘 절대 하지 말아야 할 행동 (예: 무지성 쇼핑)
         - 한 줄 예언: 오늘 잠들기 전 유저의 기분 한 줄
      3. 형식: JSON 형식으로 응답하세요.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, '').trim();

    return NextResponse.json({ 
      success: true, 
      analysis: JSON.parse(jsonString),
      today: {
        date: kstDate.toISOString().split('T')[0],
        pilllar: todayPillars
      }
    });

  } catch (error) {
    console.error('Unse API Error:', error);
    return NextResponse.json({ success: false, error: '운세 분석 중 오류 발생' }, { status: 500 });
  }
}
