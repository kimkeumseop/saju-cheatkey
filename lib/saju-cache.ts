import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

// 사주/궁합 리포트의 결정론적 캐싱 헬퍼.
// 동일 입력(생년월일·시간·달력·성별·기준연도)이면 같은 키 → 같은 결과를 재사용해
// AI 호출 비용/지연을 없앤다. adminDb(서비스 계정)를 쓰므로 클라이언트 로그인 여부와 무관하게
// 모든 방문자에게 캐시가 적용된다. 모든 경로는 best-effort — 실패하면 생성 경로로 자연스럽게 폴백한다.

/**
 * 캐시 키를 만든다. version을 앞에 붙여, 프롬프트/스키마가 바뀌면 version만 올려 캐시를 무효화한다.
 * 리포트에 "올해 월별 캘린더"처럼 연도 종속 내용이 들어가므로 parts에 기준연도를 반드시 포함할 것.
 */
export function buildReportCacheKey(version: string, parts: Array<string | number | null | undefined>): string {
  const raw = [version, ...parts.map((p) => String(p ?? ''))].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** 캐시된 리포트 문자열을 읽는다. 미설정·미히트·오류 시 null → 생성 경로로 폴백. */
export async function getCachedReport(collection: string, key: string): Promise<string | null> {
  try {
    if (!adminDb) return null;
    const snap = await adminDb.collection(collection).doc(key).get();
    if (!snap.exists) return null;
    const analysis = snap.data()?.analysis;
    return typeof analysis === 'string' && analysis.trim() ? analysis : null;
  } catch (err: any) {
    console.warn('[report-cache] 읽기 실패(무시):', err?.message ?? err);
    return null;
  }
}

/** 리포트를 캐시에 저장한다. 실패해도 응답에는 영향 없음(best-effort). */
export async function saveCachedReport(
  collection: string,
  key: string,
  analysis: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection(collection).doc(key).set({
      analysis,
      ...meta,
      createdAt: new Date(),
    });
  } catch (err: any) {
    console.warn('[report-cache] 저장 실패(무시):', err?.message ?? err);
  }
}
