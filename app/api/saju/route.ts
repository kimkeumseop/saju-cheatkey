import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키가 제대로 설정되어 있는지 확인하기 위한 로그 (서버 로그에서만 보임)
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    // 1. 만세력 데이터 계산
    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillarsText = sajuData.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');

    // 2. Gemini 설정 및 호출
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing in environment variables');
      throw new Error('API 키 설정이 누락되었습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 3. MZ 팩폭 분석 프롬프트 (이전에 성공했던 스타일로 최적화)
    const prompt = `
      너는 대한민국에서 가장 사주를 소름 돋게 잘 맞추는 '사주 치트키' 전문가야.
      아래 유저의 사주 데이터를 바탕으로 2030 세대가 좋아할 만한 아주 직설적이고 유머러스한 '팩폭 리포트'를 써줘.

      [데이터]
      - 이름: ${name} (${gender})
      - 사주: ${pillarsText}
      - 일간: ${sajuData.dayGan}
      - MBTI 성향: ${sajuData.mbti}

      [미션]
      반드시 아래 JSON 형식을 지켜서 응답해. 다른 말은 절대 하지 마.
      {
        "headline": "한 줄 요약 팩폭",
        "nickname": "조선시대 MBTI 별명",
        "packPok": "성격과 야망에 대한 디테일한 팩폭 (3~4문장)",
        "mbtiAnalysis": "사주와 MBTI의 소름 돋는 연결 분석",
        "cheatKey": "2026년 행운을 위한 현실적인 조언"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // JSON 추출 로직 (불필요한 마크다운 제거)
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanJson);
      return NextResponse.json({ 
        success: true, 
        saju: sajuData,
        analysis: analysis 
      });
    } catch (parseError) {
      console.error('JSON Parse Failed. Raw Response:', responseText);
      throw new Error('AI 응답 데이터 분석에 실패했습니다.');
    }

  } catch (error: any) {
    console.error('Saju API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '알 수 없는 서버 오류' 
    }, { status: 500 });
  }
}

