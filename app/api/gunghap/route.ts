import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

const gunghapAnalysisSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    compatibilityScore: { type: SchemaType.INTEGER },
    headline: { type: SchemaType.STRING },
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
  required: ['compatibilityScore', 'headline', 'sections'],
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

  throw new Error('JSON 구조를 찾을 수 없습니다.');
}

function validateGunghapAnalysis(data: any) {
  if (
    !data ||
    typeof data.compatibilityScore !== 'number' ||
    typeof data.headline !== 'string' ||
    !data.headline.trim() ||
    !Array.isArray(data.sections)
  ) {
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

  return {
    ...data,
    headline: data.headline.trim(),
    sections,
  };
}

const relationLabels: Record<string, string> = {
  friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자', 'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
  family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료', partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
};

async function generateWithRetry(model: any, prompt: string, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: Request) {
  let responseText = '';
  try {
    const { user1, user2, relationship } = await req.json();
    const relationLabel = relationLabels[relationship] || '인연';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
    const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);
    
    const pillars1 = saju1.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');
    const pillars2 = saju2.pillars
      .filter(p => p.ganKo && p.zhiKo)
      .map(p => `${p.ganKo}${p.zhiKo}(${p.tenGodGan}/${p.tenGodZhi})`)
      .join(' ');

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
        maxOutputTokens: 4096,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: gunghapAnalysisSchema,
      },
      safetySettings,
    });

    const prompt = `
      너는 두 사람의 사주 오행을 분석해서 인연의 깊이를 아주 쉽게 풀어서 설명해주는 다정한 '인생 가이드'야.
      MZ 세대가 읽었을 때 서로를 더 잘 이해하게 되는 따뜻하고 트렌디한 에세이 톤으로 궁합 리포트를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 한자(漢字) 및 전문 사주 용어 노출 절대 금지: '갑자', '무오', '기사' 같은 60갑자나 '천간', '지지', '상관', '편인' 등의 용어를 텍스트에 단 한 글자도 노출하지 마.
      2. 금지 단어(Blacklist): '현실적 풍파', '신령님 비방', '기운의 조화', '공수', '살(煞)', '풍파', '액운' 등 무속적이거나 올드한 단어는 절대 사용하지 마.
      3. 관계 동기화: 현재 관계인 [${relationLabel}]에 완벽히 집중해. '직장/사업' 관계라면 '사랑', '설렘' 같은 단어를 피하고 '시너지', '워크플로우', '성장' 같은 비즈니스 키워드를 사용해.

      [유저 정보]
      - 본인: ${user1.name} (사주: ${pillars1} / 일간: ${saju1.dayGanKo})
      - 상대방: ${user2.name} (사주: ${pillars2} / 일간: ${saju2.dayGanKo})
      - 두 사람의 관계: ${relationLabel}

      [필수 지시사항]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체.
      2. 분량: 각 분석 섹션은 **350자 이상** 아주 상세하고 정성스럽게 작성해줘.
      3. **다이내믹 제목 생성 규칙 (매우 중요)**: 
         - 제목 형식: **[이모지 1개] [시적이고 감성적인 비유], [관계에 맞는 명확한 키워드]**
         - 예시 (연인): 🌸 따뜻한 봄볕과 부드러운 흙처럼 스며드는 두 사람의 인연
         - 예시 (비즈니스): 📈 불과 쇠가 만나 거대한 검을 완성하듯, 환상의 업무 시너지
         - 예시 (전연인): 🌧️ 아직 마침표를 찍지 못한 두 사람의 엇갈린 시간과 인연
      4. 섹션 구성: 총 6개의 섹션을 생성해.

      [형식: 아래 JSON 구조로만 응답해]
      {
        "compatibilityScore": 85,
        "headline": "두 사람의 인연을 정의하는 한 줄 메시지",
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
      return NextResponse.json({
        success: true,
        analysis: validateGunghapAnalysis(parseJsonResponse(responseText)),
        saju1,
        saju2
      });
    } catch (error: any) {
      console.error('Gunghap API JSON parse error:', {
        message: error?.message,
        responsePreview: responseText.slice(0, 1000),
      });
      throw new Error(error?.message || 'AI 응답 파싱 실패');
    }

  } catch (error: any) {
    console.error('Gunghap API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
