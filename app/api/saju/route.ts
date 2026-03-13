import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const runtime = 'nodejs';
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

      [필수 지시사항 - 구조와 형식]
      1. 반드시 아래 6개의 주제를 모두 포함하여 6개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 타고난 기질과 본성 (나도 몰랐던 나의 진짜 모습)
         ② 재물운 (나에게 찾아올 부의 크기와 그릇)
         ③ 직업운 (내가 가장 빛날 수 있는 커리어 무대와 성공 전략)
         ④ 연애운 & 인간관계 (나의 인연이 머무는 곳과 관계의 비결)
         ⑤ 숨겨진 아픔과 다정한 위로 (지친 영혼을 위한 따뜻한 응원)
         ⑥ 2026년 운세 흐름 & 럭키 포인트 (올해 꼭 잡아야 할 기회)
      2. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 6번 등장해야 함)**
         - 예시 1:
           ## 🌊 깊고 고요한 호수처럼, 당신이 품은 타고난 기질
           (내용 작성...)
           \\n\\n
         - 예시 2:
           ## 💰 풍요로운 대지가 품은 보물, 재물과 일의 흐름
           (내용 작성...)
      3. 각 섹션의 내용은 **350자 이상** 아주 상세하고 풍성하게 작성해. 

      [필수 지시사항 - 톤앤매너]
      1. 말투: "~해요", "~네요" 스타일의 아주 다정하고 부드러운 경어체.
      2. 분위기: 유저의 장점을 극대화해주고 고민을 보듬어주는 '공감과 응원'의 분위기.
      3. 가독성: 스마트폰에서 읽기 편하도록 한 문단은 2~3문장을 넘기지 말고, 문단 사이는 반드시 "\\n\\n" 줄바꿈으로 시각적 여백을 만들어. 중요한 포인트는 독립 문장으로 빼줘.
      4. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.
    `;

    responseText = await generateWithRetry(model, prompt);
    return NextResponse.json({ success: true, saju: sajuData, analysis: responseText.trim() });

  } catch (error: any) {
    console.error('Saju API Error:', {
      message: error?.message,
      stack: error?.stack,
      responsePreview: responseText ? responseText.slice(0, 1000) : null,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
