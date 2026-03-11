import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Vercel 타임아웃 제한 증가
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Gunghap] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`[Gemini/Gunghap] Error (Attempt ${i + 1}):`, error.message);
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
  let responseText = '';
  try {
    const { user1, user2, relationship } = await req.json();
    
    if (!apiKey) {
      console.error('[API/Gunghap] Missing GEMINI_API_KEY');
      return NextResponse.json({ success: false, error: 'API 키 설정이 누락되었습니다.' }, { status: 500 });
    }

    // 1. 두 사람의 만세력 데이터 계산
    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType);
    
    const pillars1 = saju1.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const pillars2 = saju2.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');

    const genAI = new GoogleGenerativeAI(apiKey);
    
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
        maxOutputTokens: 2048,
        topP: 0.95,
      },
      safetySettings,
    });

    // 2. 궁합 분석 프롬프트 생성
    const prompt = `
      당신은 대한민국 최고의 MZ 명리학자이자 팩폭 궁합 전문가 '치트키'입니다.
      아래 두 사람의 사주 데이터를 바탕으로 관계(${relationship})에 대한 팩폭 궁합 리포트를 작성하세요.

      [본인 정보: ${user1.name} (${user1.gender || '미설정'})]
      - 사주: ${pillars1} / 일간: ${saju1.dayGanKo} / MBTI: ${saju1.mbti}
      
      [상대방 정보: ${user2.name} (${user2.gender || '미설정'})]
      - 사주: ${pillars2} / 일간: ${saju2.dayGanKo} / MBTI: ${saju2.mbti}

      [작성 가이드라인]
      1. 말투: 절대 존댓말 금지. 반말, 명령조, 아주 직설적이고 자극적인 말투를 유지해.
      2. 금기: 한자(漢字)는 절대로 쓰지 마. 100% 한글로만 대답해.
      3. 형식: 반드시 아래 구조의 순수한 JSON 데이터만 응답해. 마크다운 기호 없이 순수 JSON만 보내.

      {
        "score": 85,
        "headline": "관계를 정의하는 강렬한 한 줄 요약",
        "deepAnalysis": "서로의 성격적 결함이 어떻게 충돌하거나 보완되는지 가차 없는 분석",
        "secretThought": "서로를 속으로 어떻게 생각하는지(잠재적 불만 등) 팩폭",
        "cheatKey": "이 관계를 유지하거나 끊어내기 위한 소름 돋는 행동 지침"
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    console.log('[API/Gunghap] Gemini response received. Length:', responseText.length);

    // JSON 마크다운 방어 로직 (정규식 추가)
    const cleanText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('[API/Gunghap] No JSON found in response:', responseText);
      throw new Error('AI가 유효한 JSON 형식을 생성하지 못했습니다.');
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);
    
    try {
      const analysis = JSON.parse(jsonString);
      return NextResponse.json({ 
        success: true, 
        analysis: analysis 
      });
    } catch (parseError) {
      console.error('[API/Gunghap] JSON Parse Failed:', parseError);
      console.error('[API/Gunghap] Raw Response Text:', responseText);
      throw new Error('AI 응답 데이터 파싱에 실패했습니다.');
    }

  } catch (error: any) {
    console.error('[API/Gunghap] Critical Error:', error.message || error);
    if (responseText) {
      console.error('[API/Gunghap] Response Text at Error:', responseText);
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message || '알 수 없는 서버 오류',
      details: responseText.substring(0, 500)
    }, { status: 500 });
  }
}
