// 핵심 가이드에 실제 계산 함수로 만든 가상 명식 비교표와 한계를 표시한다.
import Link from 'next/link';
import { calculateSaju } from '@/lib/saju';

const EXAMPLE_GUIDES = ['what-is-saju', 'five-elements', 'birth-time-unknown', 'lunar-solar-calendar-saju', 'what-is-daeun'];

export default function GuideCalculationExample({ slug }: { slug: string }) {
  if (!EXAMPLE_GUIDES.includes(slug)) return null;

  const calendarComparison = slug === 'lunar-solar-calendar-saju';
  const cases: { label: string; time: string; calendar: 'solar' | 'lunar' }[] = [
    { label: '양력 · 낮 12시', time: '12:00', calendar: 'solar' },
    calendarComparison
      ? { label: '음력 평달 · 낮 12시', time: '12:00', calendar: 'lunar' }
      : { label: '양력 · 시간 모름', time: 'unknown', calendar: 'solar' },
  ];

  return (
    <section id="calculation-example" className="scroll-mt-24 rounded-[2rem] border border-[#e8cbd6] bg-white p-6 md:p-10">
      <h2 className="text-2xl font-bold leading-snug text-[#2D1B1E]">가상 입력으로 직접 비교하기</h2>
      <p className="mt-4 leading-8 text-[#665159]">
        아래는 실제 이용자가 아닌 가상 사례입니다. 날짜는 1990년 5월 15일, 성별 입력은 여성으로 두고
        {calendarComparison ? ' 달력 구분만 바꿨습니다.' : ' 출생시간의 유무만 바꿨습니다.'}
        {' '}이 사이트의 명식 계산으로 만든 표이며 AI 해설이나 상담 사례가 아닙니다.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {cases.map(({ label, time, calendar }) => {
          const result = calculateSaju('1990-05-15', time, calendar, 'female');
          return (
            <div key={label} className="min-w-0 rounded-2xl bg-[#FBF7F2] p-5">
              <h3 className="mb-4 text-lg font-bold text-[#9f3158]">{label}</h3>
              <table className="w-full text-left text-sm leading-7 text-[#58464d]">
                <caption className="sr-only">{label}의 명식</caption>
                <thead><tr><th scope="col">기둥</th><th scope="col">천간·지지</th></tr></thead>
                <tbody>
                  {[...result.pillars].reverse().map(pillar => (
                    <tr key={pillar.label} className="border-t border-[#e8dbe0]">
                      <th scope="row" className="py-2 font-medium">{pillar.label}</th>
                      <td className="py-2">{pillar.isUnknown ? '미상 · 집계 제외' : `${pillar.ganKo}${pillar.zhiKo} (${pillar.gan}${pillar.zhi})`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm leading-7 text-[#58464d]">
                {Object.entries(result.elementsCount).map(([element, count]) => `${element} ${count}`).join(' · ')}
                <br />합계 {Object.values(result.elementsCount).reduce((sum, count) => sum + count, 0)}글자.
              </p>
              {slug === 'what-is-daeun' && (
                <p className="mt-3 text-sm leading-7 text-[#58464d]">
                  {result.daYun.length
                    ? `첫 대운 ${result.daYun[0].ganKo}${result.daYun[0].zhiKo}, 시작 나이 ${result.daYun[0].age}세(계산 기준). 실제 만 나이와 구분해서 읽습니다.`
                    : '출생시간이 없어 정확한 대운 시작 나이 표시는 생략합니다.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <h3 className="mt-6 font-bold text-[#2D1B1E]">표에서 알 수 있는 것</h3>
      <p className="mt-2 leading-8 text-[#665159]">
        {calendarComparison
          ? '같은 숫자의 날짜라도 양력과 음력은 다른 날을 가리킵니다. 본인이 아는 날짜의 달력 구분을 선택해야 하며, 더 마음에 드는 해석을 고르기 위해 달력을 바꾸는 것은 적절하지 않습니다.'
          : '시간이 없으면 시주의 두 글자가 빠져 오행 합계가 8에서 6으로 줄어듭니다. 빠진 글자를 추정해 채우지 않으며, 그래프의 변화가 성격이나 건강의 변화를 뜻하지 않습니다.'}
      </p>
      <p className="mt-3 text-sm leading-7 text-[#665159]">
        현재 계산은 고정 30분 시간 보정과 자정 기준 일주 설정을 사용합니다. 시간 미상의 날짜 계산에는 정오를 임시로 쓰므로 절기·날짜 경계에서는 나머지 기둥도 잠정값일 수 있습니다.
      </p>
      <div className="mt-6 border-t border-[#e8dbe0] pt-5 text-sm leading-7 text-[#665159]">
        <h3 className="font-bold text-[#2D1B1E]">계산 참고 자료</h3>
        <p>
          <a href="https://github.com/6tail/lunar-javascript" className="underline underline-offset-4">lunar-javascript 원본과 사용 예시</a>
          {' · '}
          <a href="https://6tail.cn/calendar/api.html" className="underline underline-offset-4">계산 라이브러리 문서</a>
        </p>
        <p>이 자료는 달력·간지 계산의 참고 자료입니다. 성격이나 미래 예측의 정확성을 검증하는 연구 자료는 아닙니다.</p>
        <Link href="/about#editorial" className="underline underline-offset-4">콘텐츠 제작 기준과 오류 수정 안내</Link>
      </div>
    </section>
  );
}
