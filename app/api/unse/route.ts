import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Solar } from 'lunar-javascript';

export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const { name, birthDate, birthTime, calendarType, gender, isLite } = await req.json();
    
    if (!apiKey) return NextResponse.json({ success: false, error: 'API 키 누락' }, { status: 500 });

    const userSaju = calculateSaju(birthDate, birthTime, calendarType, gender);
    const userPillars = userSaju.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}`)
      .join(' ');

    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const todaySolar = Solar.fromDate(kstDate);
    const todayPillars = todaySolar.getLunar().getEightChar().getDayGan() + todaySolar.getLunar().getEightChar().getDayZhi();

    const genAI = new GoogleGenerativeAI(apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', 
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024, topP: 0.95 },
      safetySettings,
    });

    // 초경량 무료 운세 모드
    if (isLite) {
      const prompt = `
        너는 유저의 영혼을 어루만지는 '오늘의 속삭임' 가이드야. 
        아래 유저의 사주와 오늘 일진을 보고, 오직 긍정적이고 다정한 내용으로만 짧은 하루 운세를 작성해줘.

        [유저: ${name}] 사주: ${userPillars} / 일진: ${todayPillars}

        [필수 지시사항]
        1. 톤: 아주 다정하고 감성적인 경어체 (~해요, ~군요).
        2. 내용: 무조건 긍정적이고 기분 좋아지는 행운의 메시지.
        3. 형식: 아래 JSON으로만 응답해. 한자 절대 금지.

        {
          "keyword": "💎 맑게 갠 하늘 (대길)",
          "message": "메시지 내용 (2~3문장)"
        }
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return NextResponse.json({ success: true, analysis: JSON.parse(jsonMatch![0]) });
    }

    // 기존 프리미엄 로직 (생략 - 이전 코드 유지)
    const prompt = `
      너는 유저의 영혼을 어루만지는 신비롭고 다정한 '오늘의 속삭임' 가이드야. 
      아래 유저의 사주와 오늘 일진 데이터를 보고, 유저의 마음이 살살 녹아내릴 정도로 간질간질하고 다정한 하루 운세 리포트를 작성해줘.

      [유저 정보: ${name}]
      - 사주: ${userPillars} / 일간: ${userSaju.dayGanKo}
      [오늘의 정보]
      - 일진: ${todayPillars}

      [필수 지시사항]
      1. summary: 신문 운세처럼 아주 짧고 명확한 한 줄 요약.
      2. 프리미엄 섹션(vibe, heartFlutter, luckyWhisper, gift): 수려하고 감성적인 표현으로 길게 작성.
      3. 형식: 아래 JSON 구조로만 응답해. 한자 금지.

      {
        "summary": "...",
        "vibe": "...",
        "heartFlutter": "...",
        "luckyWhisper": "...",
        "gift": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    return NextResponse.json({ 
      success: true, 
      analysis: JSON.parse(jsonMatch![0]),
      today: { date: kstDate.toISOString().split('T')[0], pillar: todayPillars }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
