# 작업 맥락

- 요청은 수정 필요 사항 확인과 문의 메일 변경이다. 추가 문제는 보고하고 이번 코드 수정은 문의 메일로 한정한다.
- lib/site.ts의 SITE_EMAIL을 푸터, 문의, 소개, FAQ, 개인정보처리방침, 약관에서 공유한다.
- 관리자 판별용 이메일은 문의 주소가 아니므로 변경하지 않는다.
- 작업 시작 시 존재한 미추적 CSV 파일들과 결과품질개선 지침서는 사용자 파일로 보존한다.

## 코드 점검 결과

운영 서비스에 대한 공격성 요청이나 실제 결제는 수행하지 않았다. 아래는 저장소 코드 기준이며 실제 배포된 Firestore 규칙은 확인하지 않았다.

- 우선순위 높음. firestore.rules:4-5의 전체 경로 규칙이 로그인한 모든 사용자의 모든 문서 읽기·쓰기를 허용한다. 하위 tarotResults 소유자 검사와 tarotCards 쓰기 금지는 이 허용을 제한하지 못한다. 전체 허용 제거 후 컬렉션별 소유자·필드 권한을 정의해야 한다.
- 우선순위 높음. app/unse/result/page.tsx:31-33에서 payment=success만으로 유료 화면을 해제하며 app/api/unse/route.ts의 프리미엄 분기에는 인증 또는 결제 권한 검사가 없다. 서버에서 사용자와 구매 내역을 검증해야 한다.
- 우선순위 높음. app/unse/result/page.tsx:177은 unse_premium_타임스탬프를 결제 결과 ID로 넘기지만 app/api/payments/confirm/route.ts:73은 항상 /result/{resultId}로 이동한다. 운세 결과 페이지로 복귀하지 않으며 해당 ID의 사주 결과도 생성하지 않는 흐름이다. 상품별 결제 완료 경로와 결과 연결을 수정해야 한다.
- 우선순위 보통. app/unse/result/page.tsx:66-67에서 이름 또는 생년월일 없이 접근하면 loading이 true인 채 유지되어 입력 화면으로 이동하지 못하고 로딩 화면에 머문다. 필수 입력 누락 시 즉시 이동하도록 처리해야 한다.

## 검증 기록

- npm test. 기존 테스트 6개 통과.
- app, components, lib, public 검색에서 이전 문의 주소가 남아 있지 않음.
- git diff --check 통과.
- npm run build 통과. TypeScript 검사와 정적 페이지 87개 생성 완료.
- 빌드된 contact, faq, about, privacy, terms HTML에서 새 문의 주소 포함 및 이전 주소 제거 확인.
