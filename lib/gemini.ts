import type { GenerativeModel } from '@google/generative-ai';

// Gemini 호출 시 일시적으로 발생하는 과부하(503)·레이트리밋(429)·일시 서버오류(500/502/504)를
// 지수 백오프로 재시도하고, 그래도 실패하면 다음(폴백) 모델로 넘어가는 공용 헬퍼.

const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);

const TRANSIENT_HINTS = [
  '503',
  '502',
  '500',
  '504',
  '429',
  'overloaded',
  'high demand',
  'service unavailable',
  'try again',
  'rate limit',
  'quota',
  'temporarily',
  'unavailable',
  'internal error',
];

export function isTransientGeminiError(error: any): boolean {
  const status = error?.status ?? error?.statusCode ?? error?.code;
  if (typeof status === 'number' && TRANSIENT_STATUS.has(status)) return true;
  const message = String(error?.message ?? error ?? '').toLowerCase();
  return TRANSIENT_HINTS.some((hint) => message.includes(hint));
}

export interface GenerateRetryOptions {
  /** 모델 하나당 최대 시도 횟수 (기본 3) */
  maxRetries?: number;
  /** 백오프 기준 지연(ms). 시도마다 2배로 늘어난다 (기본 800ms) */
  baseDelayMs?: number;
  /** 로그 식별용 라벨 */
  label?: string;
}

export interface GenerateRetryResult {
  text: string;
  finishReason?: string;
}

/**
 * models 배열을 앞에서부터(primary → fallback 순) 시도한다.
 * 각 모델은 일시적 오류일 때만 지수 백오프로 재시도하고,
 * 재시도를 소진하면 다음 모델로 폴백한다.
 */
export async function generateContentWithRetry(
  models: GenerativeModel[],
  prompt: string,
  { maxRetries = 3, baseDelayMs = 800, label = 'Gemini' }: GenerateRetryOptions = {}
): Promise<GenerateRetryResult> {
  let lastError: any;

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];
    const isLastModel = modelIndex === models.length - 1;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (!text) throw new Error('AI 응답이 비어있습니다.');
        return { text, finishReason: response.candidates?.[0]?.finishReason };
      } catch (error: any) {
        lastError = error;
        const transient = isTransientGeminiError(error);
        const isLastAttempt = attempt === maxRetries - 1;
        console.error(
          `[${label}] 생성 실패 (model ${modelIndex + 1}/${models.length}, 시도 ${attempt + 1}/${maxRetries}, ${transient ? '일시적' : '영구적'}):`,
          error?.message ?? error
        );

        // 영구적 오류(잘못된 입력 등)는 재시도해도 소용없다.
        if (!transient) {
          if (isLastModel) throw error;
          break; // 다음 모델로 폴백
        }

        // 일시적 오류: 같은 모델 재시도 여력이 남아있으면 백오프 후 재시도
        if (!isLastAttempt) {
          const delay = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 300);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // 이 모델 재시도 소진 → 다음 모델로 폴백 (없으면 throw)
        if (isLastModel) throw error;
      }
    }
  }

  throw lastError ?? new Error('AI 응답 생성에 실패했습니다.');
}
