import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// 1. Edge 런타임 적용
export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini/Saju] Attempting to generate (Attempt ${i + 1}/${maxRetries})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text) throw new Error('AI 응답이 비어있습니다.');
      return text;
    } catch (error: any) {
      console.error(`[Gemini/Saju] Error (Attempt ${i + 1}):`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender } = body;

    const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
    const pillarsText = sajuData.pillars.map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`).join(' ');
    const elementDist = `목:${sajuData.elementsCount['木']}, 화:${sajuData.elementsCount['火']}, 토:${sajuData.elementsCount['土']}, 금:${sajuData.elementsCount['金']}, 수:${sajuData.elementsCount['水']}`;

    if (!apiKey) return NextResponse.json({ success: false, error: 'API 키 누락' }, { status: 500 });

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
        temperature: 0.85,
        maxOutputTokens: 3072, // 분량 유지와 속도 사이의 균형점
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 사주를 아주 쉽게 풀어서 설명해주는 다정하고 스마트한 '인생 가이드'야.
      MZ 세대가 읽었을 때 막힘없이 술술 읽히면서도, 내용이 깊고 풍성해서 감동을 줄 수 있는 '사주 치트키 리포트'를 작성해줘.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체. (나를 잘 아는 친한 선배가 이야기해주는 느낌)
      2. 분량: 각 섹션은 **300자 이상** 아주 상세하고 풍성하게 작성해줘. 내용이 짧으면 성의 없게 느껴지니 최대한 깊이 있게 풀어줘.
      3. 언어: 어려운 한자(漢字)나 명리학 전문 용어(식신, 편관 등)는 절대 사용 금지. 대신 "타고난 표현력", "나를 다스리는 책임감"처럼 일상적인 말로 풀어서 설명해.
      4. 분위기: 뼈를 때리는 팩폭보다는, 유저의 장점을 극대화해주고 고민을 보듬어주는 '공감과 응원'의 분위기를 유지해줘.
      5. 소제목: 요즘 감성에 맞는 직관적이고 다정한 제목(이모지 포함)을 붙여줘.
      6. 형식: 반드시 아래 JSON 구조로만 응답해.

      {
        "section1": { "title": "✨ 당신은 이런 사람이에요 (기질 분석)", "content": "내용" },
        "section2": { "title": "💝 사랑할 때 당신의 예쁜 모습 (연애운)", "content": "내용" },
        "section3": { "title": "💰 당신이 가진 특별한 재능과 재물운", "content": "내용" },
        "section4": { "title": "🤝 인간관계를 더 편하게 만드는 법", "content": "내용" },
        "section5": { "title": "💌 지치고 힘들 때 꺼내 보는 위로", "content": "내용" },
        "section6": { "title": "📅 2026년, 당신에게 찾아올 마법 같은 순간", "content": "내용" },
        "section7": { "title": "🍀 당신의 운명을 바꿔줄 소중한 팁", "content": "내용" }
      }
    `;

    responseText = await generateWithRetry(model, prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 응답에서 JSON 구조를 찾을 수 없습니다.');
    
    try {
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, saju: sajuData, analysis });
    } catch (e) {
      throw new Error('AI 응답 파싱 실패');
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
