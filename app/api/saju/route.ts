import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

// 재시도 로직을 포함한 Gemini 호출 함수
async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
      const isLastRetry = i === maxRetries - 1;
      
      if (isServiceUnavailable && !isLastRetry) {
        console.warn(`Gemini API 503 error, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 지연 시간 점진적 증가
        continue;
      }
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillarsText = sajuData.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing');
      throw new Error('API 키 설정이 누락되었습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

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

    const result = await generateWithRetry(model, prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanJson);
      return NextResponse.json({ 
        success: true, 
        saju: sajuData,
        analysis: analysis 
      });
    } catch (parseError) {
      console.error('JSON Parse Failed:', responseText);
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

