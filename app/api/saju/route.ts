import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    // 1. 만세력 데이터 계산
    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillars = sajuData.pillars.map(p => `${p.gan}${p.zhi}`).join(' ');

    // 2. MZ 팩폭 분석 프롬프트 생성
    const prompt = `
      당신은 대한민국 최고의 MZ 명리학자 '사주 치트키'입니다.
      아래 사주 데이터를 바탕으로 유저(${name}, ${gender})에게 '조선시대 MBTI' 컨셉의 팩폭 분석 리포트를 작성하세요.

      [유저 사주 데이터]
      - 사주 8자: ${pillars}
      - 일간(본질): ${sajuData.dayGan} (${sajuData.dayGanElement})
      - MBTI 성향: ${sajuData.mbti}

      [작성 가이드라인]
      1. 말투: 반말과 존댓말을 섞어 매우 직설적이고 유머러스하게 (예: "너 사실 ~인 거 다 알아")
      2. 구조: 
         - headline: 소름 돋는 한 줄 요약
         - nickname: 조선 MBTI 별명 (예: 성공에 미친 선비)
         - packPok: 성격과 야망을 가차 없이 털어줌
         - mbtiAnalysis: 사주와 MBTI의 싱크로율 분석
         - cheatKey: 2026년 현실적이고 구체적인 조언 1개
      3. 형식: 반드시 순수한 JSON 형식으로만 응답하세요. 다른 설명은 생략하세요.
    `;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON 추출 (정규표현식으로 { } 사이의 내용만 추출)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;

    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      throw new Error('AI 응답 형식이 올바르지 않습니다.');
    }

    return NextResponse.json({ 
      success: true, 
      saju: sajuData,
      analysis: analysis 
    });

  } catch (error: any) {
    console.error('Saju API Detail Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '분석 중 오류 발생' 
    }, { status: 500 });
  }
}

