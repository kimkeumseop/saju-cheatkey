import { NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Solar } from 'lunar-javascript';
import { generateText } from '@/lib/ai';
import { coerceDailyUnse, scrubUserText, DAILY_UNSE_CATS } from '@/lib/saju-schema';
import { buildReportCacheKey, getCachedReport, saveCachedReport } from '@/lib/saju-cache';

// 날짜 캐싱(firebase-admin)을 쓰므로 nodejs 런타임. (edge에서는 firebase-admin 불가)
export const runtime = 'nodejs';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

// 데일리 운세 스키마/프롬프트가 바뀌면 올려 그날 이전 캐시를 무효화한다.
const UNSE_DAILY_VERSION = 'v1';
const UNSE_DAILY_COLLECTION = 'unseCache';

function dayPillar(solar: any): string {
  const ec = solar.getLunar().getEightChar();
  return `${ec.getDayGan()}${ec.getDayZhi()}`;
}

/** 화면에 보이는 데일리 운세 문자열 값들에서 한자/전문용어를 제거. */
function scrubDaily(json: string): string {
  const d = coerceDailyUnse(json);
  if (!d) return json;
  d.headline = scrubUserText(d.headline);
  d.message = scrubUserText(d.message);
  for (const k of DAILY_UNSE_CATS) d.categories[k].line = scrubUserText(d.categories[k].line);
  d.lucky.color = scrubUserText(d.lucky.color);
  d.lucky.item = scrubUserText(d.lucky.item);
  d.lucky.direction = scrubUserText(d.lucky.direction);
  d.doToday = scrubUserText(d.doToday);
  d.avoidToday = scrubUserText(d.avoidToday);
  d.tomorrow = scrubUserText(d.tomorrow);
  return JSON.stringify(d);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, calendarType, gender, isLite } = body;
    
    // 2. 프론트엔드 Payload(데이터) 검증 방어 로직
    if (!name || !birthDate || !calendarType || !gender) {
      return NextResponse.json(
        { success: false, error: '이름, 생년월일, 양/음력, 성별 데이터가 모두 필요합니다.' }, 
        { status: 400 }
      );
    }
    
    // 3. API Key 및 AI 모델 설정 점검
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.' }, 
        { status: 401 }
      );
    }

    const userSaju = calculateSaju(birthDate, birthTime || 'unknown', calendarType, gender);
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
      model: 'gemini-2.5-flash', 
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024, topP: 0.95, responseMimeType: "application/json" },
      safetySettings,
    });

    // ── 점신식 데일리 운세(무료, 날짜 캐싱) ──────────────────────
    if (body.mode === 'daily') {
      const todayDateStr = kstDate.toISOString().split('T')[0];
      const tomorrowSolar = todaySolar.next(1);
      const tomorrowPillars = dayPillar(tomorrowSolar);

      const cacheKey = buildReportCacheKey(UNSE_DAILY_VERSION, [
        birthDate, birthTime || 'unknown', calendarType, gender, todayDateStr,
      ]);

      // 캐시 히트: 오늘 같은 사주는 하루 동안 같은 운세를 재사용(AI 호출 0).
      const cached = await getCachedReport(UNSE_DAILY_COLLECTION, cacheKey);
      if (cached) {
        const d = coerceDailyUnse(cached);
        if (d) return NextResponse.json({ success: true, daily: { ...d, date: todayDateStr } });
      }

      const prompt = `
        너는 정통 사주 도사다. 아래 사람의 사주와 오늘/내일 일진을 보고 '오늘의 운세'를 써라.
        말투는 해라체(점쟁이 단정 어투, "~다/~해라/~봐라"). 다정 경어체 금지.

        [사람: ${name}] 사주: ${userPillars} / 일간: ${userSaju.dayGanKo}
        [오늘 일진] ${todayPillars} (${todayDateStr})
        [내일 일진] ${tomorrowPillars}

        [지침]
        - 일간과 오늘 일진의 관계(생/극/합/충)에 근거해 단정해라. 누구에게나 맞는 일반론 금지.
        - 무조건 좋다고 하지 마라. 좋은 건 좋다고, 조심할 건 냉정하게 짚어라.
        - 점수는 0~5, 0.5 단위. 일진이 사주를 도우면 높게, 극하면 낮게.
        - 모든 문장은 한 줄로 끊어 짧게. 한자·전문용어(일간/십성 등) 절대 금지, 풀어써라.
        - 오늘 하루에 실제로 써먹을 행동으로 말해라(연애·돈·일·컨디션).

        [출력 JSON - 이 형태만]
        {
          "overallScore": 3.5,
          "headline": "오늘 하루를 한 줄로 단정(해라체)",
          "message": "오늘 총평 2~3문장. 일진 근거로 오늘의 기운을 단정해라.",
          "categories": {
            "love":   { "score": 4, "line": "오늘 애정·관계 한 줄(해라체)" },
            "money":  { "score": 3, "line": "오늘 돈 흐름 한 줄(해라체)" },
            "work":   { "score": 3.5, "line": "오늘 일·학업 한 줄(해라체)" },
            "health": { "score": 3, "line": "오늘 컨디션 한 줄(해라체)" }
          },
          "lucky": { "color": "남색", "number": 7, "item": "오늘의 행운 아이템(예: 따뜻한 차)", "direction": "동쪽" },
          "doToday": "오늘 하면 득이 되는 것 한 줄(해라체)",
          "avoidToday": "오늘 피해야 할 것 한 줄(해라체)",
          "tomorrow": "내일 일진 근거로 내일을 한 줄 미리보기(해라체)"
        }

        위 JSON 객체 하나만 출력해라. 첫 글자는 '{', 마지막 글자는 '}'.
      `;

      const { text: rawText } = await generateText({
        prompt,
        openai: { model: 'gpt-5-mini', maxTokens: 2048, json: true, reasoningEffort: 'low' },
        geminiModels: [model],
        label: 'UnseDaily',
      });

      const clean = scrubDaily(rawText);
      const daily = coerceDailyUnse(clean);
      if (!daily) {
        return NextResponse.json(
          { success: false, error: '운세를 정리하지 못했습니다. 다시 시도해주세요.' },
          { status: 502 },
        );
      }
      // 정상 생성분만 오늘 날짜 키로 저장(best-effort). 내일은 키가 달라 자동 갱신된다.
      await saveCachedReport(UNSE_DAILY_COLLECTION, cacheKey, JSON.stringify(daily), {
        version: UNSE_DAILY_VERSION,
        date: todayDateStr,
      });
      return NextResponse.json({ success: true, daily: { ...daily, date: todayDateStr } });
    }

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
      const { text: rawText } = await generateText({
        prompt,
        openai: { model: 'gpt-5-nano', maxTokens: 2048, json: true, reasoningEffort: 'minimal' },
        geminiModels: [model],
        label: 'Unse',
      });
      const cleanText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      let analysisData;
      try {
        analysisData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("JSON Parse Error (Lite):", parseError, "Raw:", rawText);
        analysisData = {
          keyword: "💎 평온한 하루",
          message: "오늘은 잠시 쉬어가며 내면의 소리에 귀 기울여보세요."
        };
      }
      return NextResponse.json({ success: true, analysis: analysisData });
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

    const { text: rawText } = await generateText({
      prompt,
      openai: { model: 'gpt-5-nano', maxTokens: 2048, json: true, reasoningEffort: 'minimal' },
      geminiModels: [model],
      label: 'Unse',
    });
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    let analysisData;
    try {
      analysisData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error (Premium):", parseError, "Raw:", rawText);
      analysisData = {
        summary: "오늘은 잠시 쉬어가며 내면의 소리에 귀 기울여보세요.",
        vibe: "평온한 휴식",
        heartFlutter: "나를 위한 작은 여유",
        luckyWhisper: "가슴 깊이 심호흡을 해보세요.",
        gift: "따뜻한 차 한 잔"
      };
    }
    
    return NextResponse.json({ 
      success: true, 
      analysis: analysisData,
      today: { date: kstDate.toISOString().split('T')[0], pillar: todayPillars }
    });

  } catch (error: any) {
    // 1. 강력한 에러 로깅 (디버깅 세팅)
    console.error("================ API Error Details ================");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    console.error("=================================================");
    
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
