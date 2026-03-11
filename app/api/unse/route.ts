import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Solar } from 'lunar-javascript';

// Vercel 타임아웃 제한 증가
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Unse] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`[Gemini/Unse] Error (Attempt ${i + 1}):`, error.message);
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
    const { name, birthDate, birthTime, calendarType, gender } = await req.json();
    
    if (!apiKey) {
      console.error('[API/Unse] Missing GEMINI_API_KEY');
      return NextResponse.json({ success: false, error: 'API 키 설정이 누락되었습니다.' }, { status: 500 });
    }

    // 1. 유저 만세력 데이터
    const userSaju = calculateSaju(birthDate, birthTime, calendarType, gender);
    const userPillars = userSaju.pillars.map(p => `${p.ganKo}${p.zhiKo}`).join(' ');

    // 2. 오늘의 일진 데이터 (KST 기준)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    
    const todaySolar = Solar.fromDate(kstDate);
    const todayLunar = todaySolar.getLunar();
    const todayPillars = todayLunar.getEightChar().getDayGan() + todayLunar.getEightChar().getDayZhi();

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
        maxOutputTokens: 1024,
        topP: 0.95,
      },
      safetySettings,
    });

    // 3. 운세 분석 프롬프트 생성
    const prompt = `
      당신은 대한민국 최고의 MZ 명리학자 '오늘의 치트키'입니다.
      아래 유저의 사주와 오늘의 일진 데이터를 바탕으로 하루 운세 팩폭 리포트를 작성하세요.

      [유저 정보: ${name}]
      - 사주: ${userPillars} / 일간: ${userSaju.dayGanKo}

      [오늘의 정보]
      - 오늘의 날짜: ${kstDate.toISOString().split('T')[0]}
      - 오늘의 일진: ${todayPillars}

      [작성 가이드라인]
      1. 말투: 반말, 명령조, 츤데레 스타일로 유머러스하고 직설적이게.
      2. 금기: 한자(漢字) 절대 금지. 100% 한글만 사용.
      3. 형식: 반드시 아래 JSON 구조만 응답 (마크다운 백틱 제외).

      {
        "todayFact": "오늘 유저가 겪을 핵심 상황 팩폭",
        "luckyGuide": "행운의 컬러, 숫자, 아이템 가이드",
        "avoidList": "오늘 절대 하지 말아야 할 행동",
        "oneLine": "오늘 잠들기 전 유저의 기분 한 줄 예언"
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    console.log('[API/Unse] Gemini response received. Length:', responseText.length);

    // JSON 마크다운 방어 로직 (정규식 추가)
    const cleanText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('[API/Unse] No JSON found in response:', responseText);
      throw new Error('AI가 유효한 JSON 형식을 생성하지 못했습니다.');
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);
    
    try {
      const analysis = JSON.parse(jsonString);
      return NextResponse.json({ 
        success: true, 
        analysis: analysis,
        today: {
          date: kstDate.toISOString().split('T')[0],
          pillar: todayPillars
        }
      });
    } catch (parseError) {
      console.error('[API/Unse] JSON Parse Failed:', parseError);
      console.error('[API/Unse] Raw Response Text:', responseText);
      throw new Error('AI 응답 데이터 파싱에 실패했습니다.');
    }

  } catch (error: any) {
    console.error('[API/Unse] Critical Error:', error.message || error);
    if (responseText) {
      console.error('[API/Unse] Response Text at Error:', responseText);
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message || '알 수 없는 서버 오류',
      details: responseText.substring(0, 500)
    }, { status: 500 });
  }
}
