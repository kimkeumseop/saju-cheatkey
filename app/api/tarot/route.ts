// src/app/api/tarot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

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

    const prompt = `당신은 깊은 지혜를 가진 타로 리더 "성월"입니다.
MZ세대가 공감할 수 있도록 따뜻하고 친근하게, "~해요" 어미로 한국어로 해석해주세요.
어려운 한자어나 불길한 단어("액운", "풍파")는 사용하지 마세요.
이모지를 적절히 사용하고, 짧은 문단으로 읽기 쉽게 작성해주세요.

## 뽑힌 카드
${cardsDesc}
${question ? `\n## 질문\n${question}` : ''}

## 해석 형식
다음 3개 섹션을 마크다운으로 작성해주세요:

## ✨ 카드가 전하는 메시지
(각 카드의 위치 의미와 카드 본연의 의미를 연결한 전체 흐름, 3-4문장)

## 💡 지금 당신에게 필요한 것
(현재 상황에 대한 핵심 인사이트, 불릿 포인트 2-3개)

## 🌟 앞으로 나아가는 방향
(구체적이고 따뜻한 조언, 2-3문장)
`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings,
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ result: text })
  } catch (err) {
    console.error('[tarot API error]', err)
    return NextResponse.json({ error: '해석 생성 중 오류가 발생했어요.' }, { status: 500 })
  }
}
