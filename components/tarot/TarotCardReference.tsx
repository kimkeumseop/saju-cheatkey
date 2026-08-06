import { TAROT_CARDS, type Arcana } from '@/data/tarotCards';

const GROUPS: { arcana: Arcana; title: string; intro: string }[] = [
  {
    arcana: 'major',
    title: '대아르카나 22장',
    intro:
      '대아르카나는 인생의 큰 전환점과 주제를 다루는 22장입니다. 리딩에서 대아르카나가 많이 나오면 개인의 선택보다 큰 흐름이 움직이는 국면으로 해석하는 것이 일반적입니다.',
  },
  {
    arcana: 'wands',
    title: '완드(Wands) 14장 — 불의 원소',
    intro:
      '완드는 열정, 추진력, 일의 시작을 다룹니다. 아이디어가 행동으로 옮겨지는 단계, 경쟁과 도전이 필요한 국면에서 자주 등장합니다.',
  },
  {
    arcana: 'cups',
    title: '컵(Cups) 14장 — 물의 원소',
    intro:
      '컵은 감정과 관계를 다룹니다. 연애, 가족, 내면의 상태를 묻는 질문에서 핵심 카드로 등장하는 경우가 많습니다.',
  },
  {
    arcana: 'swords',
    title: '소드(Swords) 14장 — 공기의 원소',
    intro:
      '소드는 생각과 판단, 갈등을 다룹니다. 결정을 앞둔 상황이나 말과 정보로 인한 문제에서 자주 나타납니다.',
  },
  {
    arcana: 'pentacles',
    title: '펜타클(Pentacles) 14장 — 흙의 원소',
    intro:
      '펜타클은 현실적인 결과를 다룹니다. 돈, 일, 건강, 안정처럼 손에 잡히는 영역의 질문에 대응하는 슈트입니다.',
  },
];

export default function TarotCardReference() {
  return (
    <section className="relative px-6 pb-24">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            타로 78장 정방향 · 역방향 의미 전체 목록
          </h2>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            타로 덱은 대아르카나 22장과 소아르카나 56장으로 구성됩니다. 소아르카나는 완드·컵·소드·펜타클 네 개의 슈트로 나뉘며, 각 슈트가 불·물·공기·흙의 원소에 대응합니다. 아래에서 78장 전체의 키워드와 정방향·역방향 의미를 확인하실 수 있습니다.
          </p>
          <p className="leading-8 break-keep text-sm" style={{ color: 'rgba(45,27,30,0.45)' }}>
            역방향은 정방향의 반대가 아니라 같은 에너지가 막히거나 과해진 상태로 읽는 것이 일반적입니다. 카드 한 장의 의미를 그대로 결론으로 옮기기보다, 질문의 맥락과 다른 카드와의 관계 안에서 해석하시는 편이 정확합니다.
          </p>
        </header>

        {GROUPS.map((group) => {
          const cards = TAROT_CARDS.filter((card) => card.arcana === group.arcana);
          if (cards.length === 0) return null;

          return (
            <div key={group.arcana} className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl font-bold break-keep" style={{ color: '#2D1B1E' }}>{group.title}</h3>
                <p className="leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.58)' }}>{group.intro}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    className="rounded-[1.75rem] p-6 space-y-3"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(124,111,214,0.14)' }}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>
                        {card.num}. {card.name} <span style={{ color: 'rgba(45,27,30,0.42)' }}>({card.eng})</span>
                      </h4>
                      <p className="text-sm font-bold" style={{ color: 'rgba(124,111,214,0.85)' }}>
                        {card.keywords.join(' · ')}
                      </p>
                    </div>
                    <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{card.desc}</p>
                    <dl className="space-y-2 text-sm leading-7 break-keep">
                      <div>
                        <dt className="inline font-bold" style={{ color: '#2D1B1E' }}>정방향 · </dt>
                        <dd className="inline" style={{ color: 'rgba(45,27,30,0.6)' }}>{card.upright}</dd>
                      </div>
                      <div>
                        <dt className="inline font-bold" style={{ color: '#2D1B1E' }}>역방향 · </dt>
                        <dd className="inline" style={{ color: 'rgba(45,27,30,0.6)' }}>{card.reversed}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
