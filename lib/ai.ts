import type { GenerativeModel } from '@google/generative-ai';
import { openaiGenerate, type OpenAIGenerateOptions } from './openai';
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
