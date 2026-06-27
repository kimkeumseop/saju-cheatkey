import type { GenerativeModel } from '@google/generative-ai';
import { openaiGenerate, openaiStreamMessages, type OpenAIGenerateOptions } from './openai';
import { generateContentWithRetry } from './gemini';

// OpenAI(ChatGPT)를 주력으로 호출하고, 실패 시 Gemini로 자동 폴백하는 통합 헬퍼.

export interface GenerateTextOptions {
  prompt: string;
  openai: OpenAIGenerateOptions;
  /** OpenAI가 끝까지 실패했을 때 폴백할 Gemini 모델들(primary→fallback 순). 비우면 폴백 없음 */
  geminiModels?: GenerativeModel[];
  label?: string;
}

export interface GenerateTextResult {
  text: string;
  finishReason?: string;
  provider: 'openai' | 'gemini';
}

export async function generateText({ prompt, openai, geminiModels, label = 'AI' }: GenerateTextOptions): Promise<GenerateTextResult> {
  try {
    const result = await openaiGenerate(prompt, { label: `${label}/openai`, ...openai });
    return { ...result, provider: 'openai' };
  } catch (openaiError: any) {
    if (geminiModels && geminiModels.length > 0) {
      console.warn(`[${label}] OpenAI 실패 → Gemini 폴백:`, openaiError?.message ?? openaiError);
      const result = await generateContentWithRetry(geminiModels, prompt, { label: `${label}/gemini-fallback` });
      return { ...result, provider: 'gemini' };
    }
    throw openaiError;
  }
}

export interface StreamReportOptions {
  prompt: string;
  openai: OpenAIGenerateOptions;
  /** OpenAI 스트리밍 실패 시 폴백할 Gemini 모델들 */
  geminiModels?: GenerativeModel[];
  /** 전체 텍스트 완성 후 적용할 후처리(예: 연도 범위 정리). done 이벤트의 analysis에 반영됨 */
  postProcess?: (full: string) => string;
  label?: string;
}

/**
 * OpenAI 토큰을 실시간 스트리밍하는 NDJSON ReadableStream을 만든다.
 * 각 줄은 JSON 객체:
 *   { t: 'delta', v: '<텍스트 조각>' }  — 화면 실시간 표시용
 *   { t: 'reset' }                       — (폴백 시) 클라이언트가 부분 출력 폐기
 *   { t: 'done', analysis: '<최종본>' }  — 후처리까지 끝난 저장용 최종 텍스트
 *   { t: 'error', error: '...' }         — 생성 실패
 */
export function streamReport({ prompt, openai, geminiModels, postProcess, label = 'AI' }: StreamReportOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      let full = '';
      let openaiFailed = false;

      try {
        for await (const delta of openaiStreamMessages([{ role: 'user', content: prompt }], { label: `${label}/openai`, ...openai })) {
          full += delta;
          send({ t: 'delta', v: delta });
        }
        if (!full.trim()) throw new Error('OpenAI 빈 응답');
      } catch (err: any) {
        openaiFailed = true;
        console.error(`[${label}] OpenAI 스트리밍 실패:`, err?.message ?? err);
      }

      if (openaiFailed) {
        if (geminiModels && geminiModels.length > 0) {
          try {
            send({ t: 'reset' });
            const result = await generateContentWithRetry(geminiModels, prompt, { label: `${label}/gemini-fallback` });
            full = result.text;
            send({ t: 'delta', v: full });
          } catch (err2: any) {
            send({ t: 'error', error: err2?.message || 'AI 생성에 실패했습니다.' });
            controller.close();
            return;
          }
        } else {
          send({ t: 'error', error: 'AI 생성에 실패했습니다.' });
          controller.close();
          return;
        }
      }

      const analysis = postProcess ? postProcess(full) : full;
      send({ t: 'done', analysis });
      controller.close();
    },
  });
}
