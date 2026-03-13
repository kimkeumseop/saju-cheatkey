import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

const sajuAnalysisSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
        },
        required: ['title', 'content'],
      },
    },
  },
  required: ['sections'],
};

function parseJsonResponse(text: string) {
  const trimmed = text.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const candidates = [
    withoutCodeFence,
    ...(withoutCodeFence.match(/\{[\s\S]*\}/g) || []),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new Error('AI 응답에서 JSON 구조를 찾을 수 없습니다.');
}

function validateSajuAnalysis(data: any) {
  if (!data || !Array.isArray(data.sections)) {
    throw new Error('AI 응답 형식이 올바르지 않습니다.');
  }

  const sections = data.sections
    .map((section: any) => ({
      title: typeof section?.title === 'string' ? section.title.trim() : '',
      content: typeof section?.content === 'string' ? section.content.trim() : '',
    }))
    .filter((section: any) => section.title && section.content)
    .slice(0, 6);

  if (sections.length === 0) {
    throw new Error('AI 응답 섹션 형식이 올바르지 않습니다.');
  }

  return { ...data, sections };
}

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
    const pillarsText = sajuData.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const elementDist = `목:${sajuData.elementsCount['목']}, 화:${sajuData.elementsCount['화']}, 토:${sajuData.elementsCount['토']}, 금:${sajuData.elementsCount['금']}, 수:${sajuData.elementsCount['수']}`;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 3072, // 분량 유지와 속도 사이의 균형점
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: sajuAnalysisSchema,
      },
      safetySettings,
    });

    const prompt = `
      너는 사주를 아주 쉽게 풀어서 설명해주는 다정하고 스마트한 '인생 가이드'야.
      MZ 세대가 읽었을 때 막힘없이 술술 읽히면서도, 내용이 깊고 풍성해서 감동을 줄 수 있는 '사주 치트키 리포트'를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 한자(漢字) 및 전문 사주 용어 노출 절대 금지: '갑자', '무오', '기사' 같은 60갑자나 '천간', '지지', '상관', '편인' 등의 용어를 텍스트에 단 한 글자도 노출하지 마.
      2. 대운/세운 설명 방식: "무오 대운에 진입해서"라고 하지 말고, 그 글자의 오행 색상과 자연물로 번역해줘. 
      3. 오직 일상적인 언어와 감성적인 비유(물상론)로만 유저의 운명을 설명해.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체.
      2. 분량: 각 섹션은 **350자 이상** 아주 상세하고 풍성하게 작성해줘. (전체 리포트가 매우 길고 정성스럽게 느껴져야 함)
      3. 분위기: 유저의 장점을 극대화해주고 고민을 보듬어주는 '공감과 응원'의 분위기 유지.
      4. **초개인화 제목 생성 규칙 (매우 중요)**: 
         - 제목 형식: **[이모지 1개] [시적이고 감성적인 비유], [명확한 운세 키워드]**
         - 예시 1: 🚀 거침없이 나아가는 당신의 커리어와 직업운
         - 예시 2: 🌊 깊고 고요한 호수처럼, 당신이 품은 재물과 타고난 그릇
         - 예시 3: 💖 차가운 밤 모닥불이 되어줄 당신의 인연과 연애운
      5. **구성 섹션 (6개 고정)**:
         ① 타고난 기질과 본성 (나도 몰랐던 나의 진짜 모습)
         ② 재물운 (나에게 찾아올 부의 크기와 그릇)
         ③ 직업운 (내가 가장 빛날 수 있는 커리어 무대와 성공 전략)
         ④ 연애운 & 인간관계 (나의 인연이 머무는 곳과 관계의 비결)
         ⑤ 숨겨진 아픔과 다정한 위로 (지친 영혼을 위한 따뜻한 응원)
         ⑥ 2026년 운세 흐름 & 럭키 포인트 (올해 꼭 잡아야 할 기회)

      6. 형식: 반드시 아래와 같이 **배열(Array)** 구조의 JSON으로만 응답해.

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
    try {
      const analysis = validateSajuAnalysis(parseJsonResponse(responseText));
      return NextResponse.json({ success: true, saju: sajuData, analysis });
    } catch (e: any) {
      console.error('Saju API JSON parse error:', {
        message: e?.message,
        responsePreview: responseText.slice(0, 1000),
      });
      throw new Error(e?.message || 'AI 응답 파싱 실패');
    }

  } catch (error: any) {
    console.error('Saju API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
