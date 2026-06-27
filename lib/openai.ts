import OpenAI from 'openai';

// OpenAI(ChatGPT) 호출 공용 헬퍼.
// - 일시적 오류(429/5xx/네트워크)는 지수 백오프로 재시도
// - GPT-5 계열 호환을 위해 max_completion_tokens 사용, temperature는 보내지 않음(기본값 사용)

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const TRANSIENT_STATUS = new Set([408, 409, 429, 500, 502, 503, 504]);

export function isTransientOpenAIError(error: any): boolean {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (typeof status === 'number' && TRANSIENT_STATUS.has(status)) return true;
  const name = String(error?.name ?? '');
  if (name.includes('APIConnectionError') || name.includes('APIConnectionTimeoutError') || name.includes('RateLimitError') || name.includes('InternalServerError')) {
    return true;
  }
  const message = String(error?.message ?? error ?? '').toLowerCase();
  return ['429', '500', '502', '503', '504', 'rate limit', 'overloaded', 'timeout', 'temporarily', 'try again', 'connection'].some((hint) =>
    message.includes(hint)
  );
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface OpenAIGenerateOptions {
  model: string;
  /** 최대 출력 토큰 (reasoning 토큰 포함). 캡이므로 넉넉히 줘도 실제 사용량만 과금됨 */
  maxTokens?: number;
  /** true면 JSON 객체 응답 강제 */
  json?: boolean;
  /** GPT-5 reasoning 강도. 창작/포맷 작업은 'minimal'이 빠르고 토큰 낭비가 적음 */
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  maxRetries?: number;
  baseDelayMs?: number;
  label?: string;
}

export interface OpenAIGenerateResult {
  text: string;
  finishReason?: string;
}

export async function openaiGenerateMessages(
  messages: ChatMessage[],
  { model, maxTokens = 4096, json = false, reasoningEffort, maxRetries = 3, baseDelayMs = 800, label = 'OpenAI' }: OpenAIGenerateOptions
): Promise<OpenAIGenerateResult> {
  const openai = getOpenAI();

  // 신규 GPT-5 파라미터를 타입 마찰 없이 전달하기 위해 any로 구성
  const params: any = {
    model,
    messages,
    max_completion_tokens: maxTokens,
  };
  if (json) params.response_format = { type: 'json_object' };
  if (reasoningEffort) params.reasoning_effort = reasoningEffort;

  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create(params);
      const choice = completion.choices?.[0];
      const text = choice?.message?.content ?? '';
      if (!text) throw new Error('OpenAI 응답이 비어있습니다.');
      return { text, finishReason: choice?.finish_reason ?? undefined };
    } catch (error: any) {
      lastError = error;
      const transient = isTransientOpenAIError(error);
      console.error(`[${label}] OpenAI 생성 실패 (시도 ${attempt + 1}/${maxRetries}, ${transient ? '일시적' : '영구적'}):`, error?.message ?? error);
      if (!transient || attempt === maxRetries - 1) throw error;
      const delay = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 300);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError ?? new Error('OpenAI 응답 생성에 실패했습니다.');
}

export function openaiGenerate(prompt: string, options: OpenAIGenerateOptions): Promise<OpenAIGenerateResult> {
  return openaiGenerateMessages([{ role: 'user', content: prompt }], options);
}

// 스트리밍 생성: 토큰 델타를 순차적으로 yield 한다.
export async function* openaiStreamMessages(
  messages: ChatMessage[],
  { model, maxTokens = 4096, json = false, reasoningEffort }: OpenAIGenerateOptions
): AsyncGenerator<string> {
  const openai = getOpenAI();

  const params: any = {
    model,
    messages,
    max_completion_tokens: maxTokens,
    stream: true,
  };
  if (json) params.response_format = { type: 'json_object' };
  if (reasoningEffort) params.reasoning_effort = reasoningEffort;

  const stream: any = await openai.chat.completions.create(params);
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content;
    if (delta) yield delta as string;
  }
}
