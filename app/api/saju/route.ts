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
        maxOutputTokens: 8192,
        topP: 0.95,
      },
      safetySettings,
    });

    const prompt = `
      너는 사주를 아주 쉽게 풀어서 설명해주는 다정하고 스마트한 '인생 가이드'야.
      MZ 세대가 읽었을 때 막힘없이 술술 읽히면서도, 내용이 깊고 풍성해서 감동을 줄 수 있는 '사주 치트키 리포트'를 작성해줘.

      [🔥 최우선 금기 사항 - 절대 준수]
      1. 명리학 용어 노출 절대 금지: '비견', '식상', '편관', '갑자', '무오', '기사' 같은 60갑자나 한자(漢字) 등 어려운 전문 용어는 유저 화면에 단 한 글자도 노출하지 마라.
      2. 대운/세운 설명 방식: "무오 대운에 진입해서"라고 하지 말고, 그 글자의 오행 색상과 자연물로 번역해줘. 
      3. 오직 일상적인 언어와 감성적인 비유(물상론)로만 유저의 운명을 설명해. '햇살, 큰 산, 잔잔한 호수, 겨울의 나무' 같은 다정하고 시각적인 자연물 비유를 적극 활용해라.

      [유저 정보]
      - 성함: ${name} (${gender})
      - 사주 데이터: ${pillarsText}
      - 타고난 일간: ${sajuData.dayGanKo}
      - 오행 분포: ${elementDist}

      [필수 지시사항 - 구조와 형식]
      1. 반드시 아래 7개의 주제를 모두 포함하여 7개의 독립된 분석 섹션을 빠짐없이 작성해. AI가 임의로 섹션을 생략하거나 합치거나 중간에 답변을 끊는 것은 절대 금지.
         ① 타고난 기질과 본성 (나도 몰랐던 나의 진짜 모습)
         ② 재물운 (나에게 찾아올 부의 크기와 그릇)
         ③ 직업운 (내가 가장 빛날 수 있는 커리어 무대와 성공 전략)
         ④ 연애운 & 인간관계 (나의 인연이 머무는 곳과 관계의 비결)
         ⑤ 숨겨진 아픔과 다정한 위로 (지친 영혼을 위한 따뜻한 응원)
         ⑥ 2026년 운세 흐름 & 럭키 포인트 (올해 꼭 잡아야 할 기회)
         ⑦ 인스타 스토리 요약 (SNS 공유용 초핵심 요약)
      2. **각 주제(섹션)로 넘어갈 때마다 우리가 프론트엔드에서 카드를 쪼개는 기준점인 "## [이모지] [주제에 맞는 다정한 소제목]" 포맷을 절대 빼먹지 말고 매번 반복해서 작성해! (총 7번 등장해야 함)**
         - 소제목(##) 후킹 최적화: 단순히 '재물운'이 아니라, "내 지갑은 언제쯤 두둑해질까? 💰" 처럼 유저의 호기심을 자극하고 공감할 수 있는 대화형 문장으로 작성해라.

      [🔥 인스타 스토리 요약 (7번 섹션) 작성 특별 규칙 - 절대 준수]
      - 섹션 제목은 반드시 "## 📸 인스타 스토리 요약" 으로 작성해.
      - 후킹 제목: 유저의 타고난 기질을 다정하고 직관적인 '한 문장 비유'로 표현해. (예: "${name}님은 웅장한 산봉우리 같은 든든한 존재예요.")
      - 핵심 특징 3가지: 전체 분석에서 가장 듣기 좋은 특징 3가지만 글머리 기호(💡, ✅ 등)를 사용해 초단문으로 요약해.
      - 바이럴 포인트: "2026년 재물운 대폭발 💸"처럼 유저가 자랑하고 싶은 '특별한 혜택' 문구 한 줄을 반드시 마지막에 포함해.

      [필수 지시사항 - AI 글쓰기 절대 규칙 (가독성 최우선, 스낵 컬처 스타일)]
      1. AI가 줄글(수필) 형태로 길게 쓰는 것을 엄격히 금지한다.
      2. 1문장 = 1줄: 절대 한 문단에 문장을 2개 이상 이어 쓰지 마라. 한 문장이 끝나면 무조건 줄바꿈(\\n\\n)을 해라.
      3. 초단문 사용: 접속사(그리고, 그래서, 하지만)를 남발하지 말고, 문장을 최대한 짧고 명쾌하게 끊어 쳐라.
      4. 여백 극대화: 유저가 스크롤을 내리며 휙휙 읽을 수 있도록 여백을 과하다 싶을 정도로 많이 줘라.
      5. 핵심 요약 리스트(Bullet points) 강제: 섹션마다 줄글만 쓰지 말고, 유저의 특징이나 조언을 글머리 기호(💡, ✅, 📌 등)를 사용해 3~4줄로 명확하게 요약해 주는 구간을 반드시 넣어라.
      6. 따뜻한 에세이 톤: 감성적인 웹소설이나 에세이를 읽는 듯한 아주 다정하고 부드러운 경어체("~해요", "~요")를 사용해라.
      7. 절대 JSON 포맷이나 중괄호 { }를 사용하지 마라. 코드 블록, 백틱, 배열 기호도 금지.

      [예시 포맷 - 이 구조를 반드시 따를 것]
      ## 💰 재물운 (내 지갑은 언제쯤 두둑해질까?)
      ${name}님의 재물운은 오랜 시간 다져진 견고한 땅과 같아요.

      일확천금보다는 꾸준함으로 승부할 때 가장 빛이 납니다.

      **💡 ${name}님의 재물 포인트 3가지**
      ✅ **타고난 뚝심:** 한 번 목표한 바는 반드시 이뤄내요.
      ✅ **안정적인 자산:** 주식보다는 부동산, 저축이 훨씬 유리해요.
      ✅ **유연한 사고방식:** 때로는 물 흐르듯 유연한 대처가 필요해요.

      조금만 더 마음의 여유를 가지면, 큰 부가 따라올 거예요.
      \\n\\n
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
