import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini] Attempting to generate content (Attempt ${i + 1}/${maxRetries})...`);
      return await model.generateContent(prompt);
    } catch (error: any) {
      console.error(`[Gemini] Error during generation (Attempt ${i + 1}):`, error.message);
      const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
      const isLastRetry = i === maxRetries - 1;
      
      if (isServiceUnavailable && !isLastRetry) {
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
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

    console.log(`[API/Saju] Processing request for: ${name}, ${birthDate}`);

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    
    const pillarsText = sajuData.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const elementDist = `목:${sajuData.elementsCount['木']}, 화:${sajuData.elementsCount['火']}, 토:${sajuData.elementsCount['土']}, 금:${sajuData.elementsCount['金']}, 수:${sajuData.elementsCount['水']}`;

    if (!apiKey) {
      console.error('[API/Saju] Missing GEMINI_API_KEY');
      return NextResponse.json({ success: false, error: 'API 키 설정이 누락되었습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 안전 설정 추가: '살생부', '자폭' 등 자극적인 단어 차단 방지
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 대한민국 최고의 사주 전략가이자 팩폭 전문가 '치트키'야.
      아래 유저의 사주 원국과 MBTI를 보고, 2030 세대의 가슴을 후벼파는 '7성구 팩폭 리포트'를 작성해.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 매칭 MBTI: ${sajuData.mbti}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: 절대 존댓말 금지. 반말, 명령조, 아주 직설적이고 자극적인 말투를 유지해.
      2. 분량: 각 섹션은 최소 300자~500자 이상으로 아주 길고 상세하게 쥐어짜서 써. 짧으면 실패야.
      3. 금기: 한자(漢字)는 절대로, 단 한 글자도 쓰지 마. 100% 한글로만 대답해.
      4. 형식: 반드시 아래 구조의 순수한 JSON 데이터만 응답해. 설명이나 앞뒤 인사말은 생략해.

      {
        "headline": "인생 요약 한 줄 팩폭 (강점과 약점)",
        "mbtiAnalysis": "사주 원국과 MBTI의 소름 돋는 연결고리 분석. 성격의 모순점을 해부해.",
        "wealthGrade": "자본주의 생존 등급. 재물 그릇의 크기를 계급이나 자산 규모로 비유해서 냉정하게 평가해.",
        "careerStrategy": "직업 및 커리어 전략. 사주에 맞는 직종과 피해야 할 업종, 연봉 올리는 행동 지침.",
        "relationshipList": "인간관계 살생부. 손절해야 할 인간상과 귀인의 특징을 아주 구체적으로 묘사해.",
        "selfDestruct": "스스로 망하는 자폭 패턴. 인생 결정적 순간에 저지르는 무의식적인 오류를 지적해.",
        "cheatKey2026": "2026년(병오년) 월별 행동 강령. 투자, 이직, 연애의 구체적인 타이밍을 지시해."
      }
    `;

    const result = await generateWithRetry(model, prompt);
    const responseText = result.response.text();
    
    console.log('[API/Saju] Gemini response received. Length:', responseText.length);

    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('[API/Saju] No JSON found in response:', responseText);
      throw new Error('AI가 유효한 형식을 생성하지 못했습니다.');
    }

    const jsonString = responseText.substring(startIndex, endIndex + 1);
    
    try {
      const analysis = JSON.parse(jsonString);
      return NextResponse.json({ 
        success: true, 
        saju: sajuData,
        analysis: analysis 
      });
    } catch (parseError) {
      console.error('[API/Saju] JSON Parse Failed:', responseText);
      throw new Error('AI 응답 데이터 구조가 올바르지 않습니다.');
    }

  } catch (error: any) {
    console.error('[API/Saju] Critical Error:', error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '알 수 없는 서버 오류',
      details: error.stack // 디버깅을 위해 에러 상세 정보 포함
    }, { status: 500 });
  }
}
