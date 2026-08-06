import Link from 'next/link';
import type { MbtiProfile } from '@/src/data/mbtiProfiles';
import type { MbtiTypeCode, MbtiTypeInfo } from '@/src/data/mbtiTypes';

type Props = {
  type: MbtiTypeCode;
  typeInfo: MbtiTypeInfo;
  profile: MbtiProfile;
  author: string;
};

const CARD = {
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(14,159,115,0.14)',
} as const;

function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color }}>
      {children}
    </p>
  );
}

export default function MbtiTypeArticle({ type, typeInfo, profile, author }: Props) {
  const accent = typeInfo.color;

  return (
    <section className="relative overflow-x-hidden px-6 pb-28" style={{ background: '#FBF7F2' }}>
      <article className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={CARD}>
          <Label color={accent}>{type} 심층 분석</Label>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight break-keep"
            style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}
          >
            {type} {typeInfo.name} — {profile.headline}
          </h2>
          <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.66)' }}>
            {profile.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="text-sm font-bold" style={{ color: 'rgba(45,27,30,0.42)' }}>
            {author} 작성 · 유형별 해설은 검사 결과와 무관하게 동일하게 제공됩니다
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-[2.5rem] p-8 space-y-5" style={CARD}>
            <div className="space-y-2">
              <Label color={accent}>Strengths</Label>
              <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>강점이 드러나는 지점</h3>
            </div>
            <div className="space-y-4">
              {profile.strengths.map((item) => (
                <div key={item.title} className="space-y-1.5">
                  <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h4>
                  <p className="leading-7 break-keep text-sm" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2.5rem] p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.16)' }}>
            <div className="space-y-2">
              <Label color="rgba(212,104,138,0.8)">Cautions</Label>
              <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>주의하면 좋은 패턴</h3>
            </div>
            <div className="space-y-4">
              {profile.cautions.map((item) => (
                <div key={item.title} className="space-y-1.5">
                  <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h4>
                  <p className="leading-7 break-keep text-sm" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={CARD}>
          <div className="space-y-2">
            <Label color={accent}>In practice</Label>
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>일 · 관계 · 성장</h3>
          </div>
          <div className="space-y-5">
            {[
              { title: '일하는 방식', body: profile.work },
              { title: '관계에서의 모습', body: profile.relationship },
              { title: '성장 포인트', body: profile.growth },
            ].map((block) => (
              <div key={block.title} className="space-y-2">
                <h4 className="font-bold" style={{ color: '#2D1B1E' }}>{block.title}</h4>
                <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.64)' }}>{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={CARD}>
          <div className="space-y-2">
            <Label color={accent}>Match</Label>
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>궁합으로 자주 언급되는 조합</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(14,159,115,0.07)', border: '1px solid rgba(14,159,115,0.16)' }}>
              <p className="text-sm font-black" style={{ color: accent }}>잘 맞는 편 · {profile.match.good}</p>
              <p className="leading-7 break-keep text-sm" style={{ color: 'rgba(45,27,30,0.64)' }}>{profile.match.goodReason}</p>
            </div>
            <div className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(212,104,138,0.07)', border: '1px solid rgba(212,104,138,0.16)' }}>
              <p className="text-sm font-black" style={{ color: '#d4688a' }}>조율이 필요한 편 · {profile.match.tricky}</p>
              <p className="leading-7 break-keep text-sm" style={{ color: 'rgba(45,27,30,0.64)' }}>{profile.match.trickyReason}</p>
            </div>
          </div>
          <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.45)' }}>
            궁합은 성패를 정하는 기준이 아니라 어디서 마찰이 생기기 쉬운지 알려주는 정보입니다. 조합보다 서로의 표현 방식을 말로 확인하는 과정이 관계에 훨씬 크게 작용합니다.
          </p>
        </section>

        <section
          className="rounded-[2.5rem] p-8 md:p-10 space-y-4"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(255,255,255,0.9) 65%)', border: '1px solid rgba(212,104,138,0.18)' }}
        >
          <Label color="rgba(212,104,138,0.8)">사주로 겹쳐 보기</Label>
          <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>{type}를 명리학 언어로 옮기면</h3>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.64)' }}>{profile.sajuBridge}</p>
          <div className="flex flex-wrap gap-3 pt-1 text-sm font-bold">
            <Link href="/guide/saju-vs-mbti" className="rounded-full px-4 py-2" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              사주와 MBTI 차이 읽기
            </Link>
            <Link href="/saju" className="rounded-full px-4 py-2" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              내 사주 확인하기
            </Link>
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={CARD}>
          <div className="space-y-2">
            <Label color={accent}>FAQ</Label>
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>{type}에 대해 자주 묻는 질문</h3>
          </div>
          <div className="space-y-4">
            {profile.faq.map((item) => (
              <div key={item.question} className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(251,247,242,0.85)', border: '1px solid rgba(14,159,115,0.12)' }}>
                <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>Q. {item.question}</h4>
                <p className="leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.answer}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.45)' }}>
            MBTI는 검증된 진단 도구가 아니라 자기 이해를 돕는 분류 언어입니다. 채용이나 진단처럼 무게가 큰 판단의 근거로는 사용하지 않으시길 권합니다.
          </p>
        </section>
      </article>
    </section>
  );
}
