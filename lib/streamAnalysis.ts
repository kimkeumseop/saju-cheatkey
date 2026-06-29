// 클라이언트용 NDJSON 스트림 리더.
// /api/saju, /api/gunghap 의 스트리밍 응답을 읽어 실시간 텍스트를 onText로 전달하고,
// 서버가 후처리한 최종본(analysis)을 반환한다.

export async function streamAnalysis(
  url: string,
  body: unknown,
  onText: (fullText: string) => void
): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    let message =
      response.status === 504
        ? '분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
        : '서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.';
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // 본문 파싱 실패는 무시하고 기본 메시지 사용
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let display = '';
  let finalAnalysis = '';
  let errored: string | null = null;

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg: any;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }
    if (msg.t === 'delta') {
      display += msg.v ?? '';
      onText(display);
    } else if (msg.t === 'reset') {
      display = '';
      onText(display);
    } else if (msg.t === 'done') {
      finalAnalysis = typeof msg.analysis === 'string' ? msg.analysis : display;
    } else if (msg.t === 'error') {
      errored = msg.error || '생성에 실패했습니다.';
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      handleLine(buffer.slice(0, newlineIndex));
      buffer = buffer.slice(newlineIndex + 1);
    }
  }
  if (buffer.trim()) handleLine(buffer);

  if (errored) throw new Error(errored);
  return finalAnalysis || display;
}

// 스트리밍 미리보기용 가벼운 정리.
// 신버전은 JSON을 스트리밍하므로 JSON 구조 토큰(키, 중괄호, 따옴표 등)을 걷어내고
// 사람이 읽는 한글 값만 흐르듯 보이게 한다. 레거시 마크다운도 함께 정리한다.
export function cleanPreview(text: string): string {
  return text
    // JSON 키("headline": 등)와 구조 토큰 제거
    .replace(/"(headline|keywords|scores|sections|lucky|caution|title|content|color|direction|advice|numbers|timing|compatibilityScore|synergy|conflict|action|avoid|closer|distance|decision|actions|daeunExpansion|daeunMaintenance|daeunCaution|daeunDecisions|wealthGoodYears|wealthCautionYears|monthlyGrowth|monthlyMoney|monthlyCaution|monthlyActions|총운|직업운|재물운|애정운|건강운|대인관계)"\s*:/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/[{}\[\]"]/g, ' ')
    // 마크다운 기호 정리
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s{2,}/g, ' ');
}
