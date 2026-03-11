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

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 한자(漢字) 및 전문 사주 용어 노출 절대 금지: '갑자', '무오', '기사' 같은 60갑자나 '천간', '지지', '상관', '편인' 등의 용어를 텍스트에 단 한 글자도 노출하지 마.
      2. 대운/세운 설명 방식: "무오 대운에 진입해서"라고 하지 말고, 그 글자의 오행 색상과 자연물로 번역해줘. 
         (예: "거대한 산에 뜨거운 태양이 비추는 강렬한 시기에 진입해서", "맑은 호수에 보석이 반짝이는 평온한 흐름을 만나서")
      3. 오직 일상적인 언어와 감성적인 비유(물상론)로만 유저의 운명을 설명해.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체.
      2. 분량: 각 섹션은 **350자 이상** 아주 상세하고 풍성하게 작성해줘.
      3. 분위기: 유저의 장점을 극대화해주고 고민을 보듬어주는 '공감과 응원'의 분위기 유지.
      4. **초개인화 다이내믹 제목 생성**: 
         - 각 섹션의 제목을 고정된 텍스트(예: 기질 분석, 연애운 등)로 절대 내보내지 마.
         - 유저의 사주 오행과 기질을 완벽하게 분석해서, **각 섹션의 내용과 유저의 특성에 딱 맞는 '시적이고 감성적인 맞춤형 제목'**을 매번 새롭게 창작해.
         - 제목 앞에는 반드시 내용에 어울리는 **이모지 1개**를 포함해.
         - 제목 예시: ✨ 고요한 호수 아래 뜨거운 용암을 품은 당신 / 💰 사람들의 마음을 다독여 부를 끌어당길 운명
      5. 형식: 반드시 아래와 같이 **배열(Array)** 구조의 JSON으로만 응답해.

      {
        "sections": [
          { "title": "...", "content": "..." },
          { "title": "...", "content": "..." },
          { "title": "...", "content": "..." },
          { "title": "...", "content": "..." },
          { "title": "...", "content": "..." },
          { "title": "...", "content": "..." }
        ]
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
