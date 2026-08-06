import Link from 'next/link';

const SPREADS = [
  {
    title: '원카드 — 지금 이 상황의 핵심',
    body:
      '한 장만 뽑아 현재 상황의 중심 에너지를 확인하는 방식입니다. 질문이 하나로 좁혀져 있을 때 가장 정확하게 작동합니다. "오늘 회의에서 내가 놓치고 있는 것은 무엇인가"처럼 범위가 분명한 질문에 적합하고, "내 인생은 어떻게 되나요" 같은 넓은 질문에는 맞지 않습니다.',
  },
  {
    title: '쓰리카드 — 흐름을 세 단계로',
    body:
      '세 장을 뽑아 과거·현재·미래 또는 상황·행동·결과의 흐름으로 읽습니다. 하나의 국면이 어디서 왔고 어디로 향하는지 확인할 때 유용합니다. 세 번째 카드를 확정된 결말이 아니라 지금 흐름이 유지될 경우의 방향으로 읽는 것이 중요합니다.',
  },
  {
    title: '오각형 스프레드 — 다섯 관점에서 입체적으로',
    body:
      '다섯 장을 배치해 현재 상황, 장애물, 내면의 상태, 외부 조건, 조언을 각각 확인합니다. 결정이 복잡하고 고려할 요소가 많을 때 적합합니다. 카드가 많은 만큼 하나하나의 의미보다 전체가 만드는 그림을 보는 것이 핵심입니다.',
  },
];

const STEPS = [
  { step: '01', title: '질문을 좁힙니다', body: '"잘 될까요"보다 "지금 무엇을 준비하면 좋을까요"처럼 답을 행동으로 옮길 수 있는 형태가 좋습니다.' },
  { step: '02', title: '스프레드를 고릅니다', body: '질문이 단순하면 원카드, 흐름이 궁금하면 쓰리카드, 판단이 복잡하면 오각형을 선택합니다.' },
  { step: '03', title: '카드를 뽑습니다', body: '뽑는 순간의 마음 상태를 정리하고, 나온 카드는 다시 뽑지 않습니다.' },
  { step: '04', title: '해석을 질문으로 바꿉니다', body: '결과 문장을 그대로 두지 말고 "그래서 내가 지금 할 수 있는 것은 무엇인가"로 옮겨 적습니다.' },
];

const FAQ = [
  {
    question: '같은 질문을 여러 번 뽑아도 되나요?',
    answer:
      '짧은 간격의 반복은 권하지 않습니다. 원하는 답이 나올 때까지 묻는 형태가 되기 쉽고, 그 순간부터 타로는 생각을 정리하는 도구가 아니라 불안을 달래는 반복 행동이 됩니다. 상황이 실제로 달라진 뒤에 다시 보시는 것이 좋습니다.',
  },
  {
    question: '역방향이 나오면 나쁜 뜻인가요?',
    answer:
      '역방향은 정방향의 반대가 아니라 같은 에너지가 막히거나 과해진 상태로 읽습니다. 예를 들어 정방향이 추진력이라면 역방향은 그 힘이 조급함으로 흐르는 상태에 가깝습니다. 좋고 나쁨보다 상태의 차이로 보시면 해석이 훨씬 정확해집니다.',
  },
  {
    question: '타로로 미래를 알 수 있나요?',
    answer:
      '사건을 특정하는 용도로는 적합하지 않습니다. 타로가 잘 하는 일은 지금 상황에서 내가 보지 못한 각도를 비추는 것입니다. 결과를 맞히는 도구가 아니라 판단의 재료를 늘리는 도구로 쓰실 때 가장 쓸모가 큽니다.',
  },
  {
    question: '사주와 타로를 같이 봐도 되나요?',
    answer:
      '시간 축이 달라 오히려 보완이 됩니다. 사주로 지금이 어떤 시기인지 배경을 확인하고, 그 위에서 구체적인 질문을 만들어 타로로 좁혀가는 순서를 권합니다.',
  },
];

export default function TarotReadingGuide() {
  return (
    <section className="relative px-6 pb-24" style={{ background: '#FBF7F2' }}>
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            타로 리딩, 어떻게 읽어야 잘 쓰는 걸까
          </h2>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            타로는 미래를 미리 보여주는 도구가 아니라, 지금 상황을 다른 각도에서 비추는 거울에 가깝습니다. 같은 카드가 나와도 질문이 다르면 해석이 달라지는 이유가 여기에 있습니다. 카드를 뽑기 전에 아래 내용을 한 번 읽어두시면 결과를 훨씬 유용하게 활용하실 수 있습니다.
          </p>
        </header>

        <div className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>리딩 순서</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {STEPS.map((item) => (
              <div key={item.step} className="space-y-2">
                <p className="text-xs font-black tracking-[0.28em]" style={{ color: 'rgba(124,111,214,0.8)' }}>{item.step}</p>
                <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h4>
                <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>스프레드별 차이</h3>
          <div className="space-y-5">
            {SPREADS.map((item) => (
              <div key={item.title} className="space-y-2">
                <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h4>
                <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>자주 묻는 질문</h3>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.question} className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(251,247,242,0.85)', border: '1px solid rgba(124,111,214,0.12)' }}>
                <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>Q. {item.question}</h4>
                <p className="leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-sm font-bold">
            <Link href="/tarot/dictionary" className="rounded-full px-4 py-2" style={{ background: 'rgba(124,111,214,0.1)', border: '1px solid rgba(124,111,214,0.2)', color: '#7c6fd6' }}>
              78장 카드 의미 보기
            </Link>
            <Link href="/guide/saju-and-tarot-together" className="rounded-full px-4 py-2" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              사주와 함께 보는 법
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
