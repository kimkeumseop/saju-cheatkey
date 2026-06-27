// src/app/api/tarot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { generateText } from '@/lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
]

export async function POST(req: NextRequest) {
  try {
    const { cards, spreadType, question } = await req.json()

    const spreadLabels: Record<number, string[]> = {
      1: ['현재 상황'],
      3: ['과거', '현재', '미래'],
      5: ['현재 상황', '도전 과제', '근본 원인', '조언', '최종 결과'],
    }
    const labels = spreadLabels[spreadType] ?? ['카드']

    const cardsDesc = cards
      .map((c: { name: string; isReversed: boolean }, i: number) =>
        `${labels[i] ?? `카드${i + 1}`}: ${c.name} (${c.isReversed ? '역방향' : '정방향'})`
      )
      .join('\n')

    const prompt = `당신은 깊은 지혜를 가진 프리미엄 타로 리더 "성월"입니다.
MZ세대가 공감할 수 있도록 따뜻하고 친근하게, "~해요" 어미로 한국어로 해석해주세요.
어려운 한자어나 불길한 단어("액운", "풍파")는 사용하지 마세요.
이모지를 적절히 사용하고, 짧은 문단으로 읽기 쉽게 작성해주세요.
좋은 말만 하지 말고, 카드가 보여주는 가능성/주의점/지금 할 일을 함께 말해주세요.
사용자가 "돈 주고 본 타로 같다"고 느끼도록 카드 위치, 정방향/역방향, 질문 맥락을 근거로 구체적으로 해석해주세요.

## 뽑힌 카드
${cardsDesc}
${question ? `\n## 질문\n${question}` : ''}

## 해석 형식
다음 5개 섹션을 마크다운으로 작성해주세요:

## 🔮 먼저 보는 핵심 결론
(질문에 대한 답을 3-4문장으로 바로 말해주세요. 좋음/주의/행동을 함께 포함해주세요.)

## 🃏 카드별 정밀 해석
(각 카드의 위치 의미, 카드 본연의 의미, 정방향/역방향을 연결해서 카드별로 2-3문장씩 해석해주세요.)

## ⚠️ 조심해야 할 흐름
(지금 방치하면 꼬일 수 있는 감정, 선택, 관계, 돈, 일의 포인트를 불릿 3개로 말해주세요.)

## ✅ 지금 바로 할 일
(오늘/이번 주에 할 수 있는 행동을 불릿 3-5개로 아주 구체적으로 말해주세요.)

## 🌟 최종 조언
(카드 전체를 관통하는 결론과 마음가짐을 3-4문장으로 정리해주세요.)

## 작성 규칙
- 모든 섹션 제목은 위 제목 그대로 사용해주세요.
- 한 문장은 너무 길게 쓰지 말고, 문장이 끝나면 줄바꿈을 자주 해주세요.
- "무조건 된다", "반드시 망한다" 같은 확정적 표현은 금지합니다.
- 질문이 금전/연애/직업/관계 중 하나라면 그 주제의 현실 행동으로 번역해주세요.
- 뻔한 말("긍정적으로 생각하세요", "기회를 잡으세요")은 금지합니다.
`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.82,
        maxOutputTokens: 4096,
        topP: 0.95,
      },
      safetySettings,
    })

    const { text } = await generateText({
      prompt,
      openai: { model: 'gpt-5-nano', maxTokens: 4096, reasoningEffort: 'minimal' },
      geminiModels: [model],
      label: 'Tarot',
    })

    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[tarot API error]', err)
    return NextResponse.json({ error: '해석 생성 중 오류가 발생했어요.' }, { status: 500 })
  }
}
