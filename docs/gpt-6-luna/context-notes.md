# 작업 맥락

- 사용자는 사주치트기 API 모델을 GPT-6 Luna로 변경하도록 요청했다. 모든 기본 OpenAI 모델을 대상으로 해석했다.
- 공식 문서 https://developers.openai.com/api/docs/models/gpt-6-luna 에서 모델 ID `gpt-6-luna`와 `none`, `low` 추론 강도 지원을 확인했다.
- 기존 Chat Completions 방식과 JSON/스트리밍 출력 계약을 유지한다. 도구 호출은 사용하지 않는다.
- 기존 `minimal`만 `none`으로 바꾸고 `low`와 토큰 제한, Gemini 대체 호출, 기존 결과 캐시는 유지한다.
- 작업 전 존재한 CSV 및 품질개선 지침서 미추적 파일은 변경하거나 커밋하지 않는다.
- 6개 API 라우트의 8개 OpenAI 모델 설정을 교체했다. 공용 헬퍼의 추론 타입과 설명도 맞췄다.
- `npm test` 6개 테스트 통과, `npm run build` 프로덕션 빌드 및 타입 검사 통과, `git diff --check` 통과.
- 실제 유료 API 요청과 배포는 실행하지 않았다. 계정의 모델 접근 권한과 실제 응답 품질은 이번 검증 범위에 포함하지 않는다.
