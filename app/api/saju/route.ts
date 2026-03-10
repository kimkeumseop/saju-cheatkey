import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
      const isLastRetry = i === maxRetries - 1;
      
      if (isServiceUnavailable && !isLastRetry) {
        console.warn(`Gemini API 503 error, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
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
    const pillarsText = sajuData.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');

    if (!apiKey) {
      throw new Error('API 키 설정이 누락되었습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // 성능을 위해 flash-lite 유지하되 파라미터 강화
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `
      너는 대한민국에서 가장 사주를 소름 돋게 잘 맞추고, 현실을 가차 없이 찔러주는 '사주 치트키' 전문가야.
      아래 유저의 정밀 사주 데이터를 바탕으로 2030 세대가 정신 번쩍 들 만한 '7성구 팩폭 리포트'를 작성해.

      [유저 데이터]
      - 이름: ${name} (${gender})
      - 사주 원국: ${pillarsText}
      - 일간: ${sajuData.dayGanKo}
      - MBTI 성향: ${sajuData.mbti}
      - 오행 분포: 목(${sajuData.elementsCount['木']}), 화(${sajuData.elementsCount['火']}), 토(${sajuData.elementsCount['土']}), 금(${sajuData.elementsCount['金']}), 수(${sajuData.elementsCount['水']})

      [작성 가이드라인]
      1. 말투: 존댓말 절대 금지. 반말과 명령조, 직설적인 팩폭 스타일로 작성해.
      2. 분량: 각 섹션당 최소 300자 이상, 아주 구체적이고 논리적으로 쥐어짜서 상세하게 써.
      3. 금기: 한자는 절대 사용하지 마. 100% 한글로만 작성해.
      4. 내용: 유저의 사주와 MBTI를 결합해 성격의 모순점이나 현실적인 생존 전략을 지시해.

      [반드시 아래 JSON 형식을 지켜서 응답해]
      {
        "headline": "유저 인생의 최대 강점과 치명적 약점을 찌르는 자극적인 요약 한 줄",
        "mbtiAnalysis": "사주 원국과 MBTI 해부. 오행/십신 데이터와 MBTI 4원소를 매칭해 성격의 뿌리를 논리적으로 분석",
        "wealthGrade": "자본주의 생존 등급. 타고난 돈복의 크기를 자산 규모나 계급으로 비유해 냉정하게 평가",
        "careerStrategy": "돈 냄새 맡는 커리어 전략. 최적의 직종, 피해야 할 업종, 연봉 올리는 구체적 방법 지시",
        "relationshipList": "인간관계 살생부. 기운 빨아먹는 인간 유형 묘사와 손절 명령, 귀인의 특징 기술",
        "selfDestruct": "내 발등 찍는 자폭 버튼. 결정적 순간에 스스로 망하는 무의식적 패턴 분석",
        "cheatKey2026": "2026년(병오년) 실전 치트키. 운의 흐름에 따른 투자/이직/연애 월별 행동 강령 및 타이밍 지시"
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
