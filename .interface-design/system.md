# Design System — Saju Cheatkey

## Direction
**Warm Ivory Luxury** — 밝고 따뜻한 아이보리 위, 나를 위한 럭셔리 웰니스 공간.
웜 아이보리 배경 위에 더스티 로즈 + 소프트 바이올렛 + 그린 + 소프트 골드 조합.
Noto Serif KR 헤딩으로 럭셔리/신비로운 감성, 흰 카드 + 컬러 글로우 섀도, 달 장식 모티프.
타겟: 20-30대 여성 — 밝고 고급스러운 K-뷰티 웰니스 감성.
(2026-07 다크 플럼 → 라이트 아이보리로 전면 이행. 이전 다크 기준값은 git 히스토리 참고.)

## Foundation
- **Background:** #FBF7F2 (warm ivory)
- **Card:** #FFFFFF / rgba(255,255,255,0.92) — 흰 카드 + 컬러 글로우 섀도
- **Text base:** #2D1B1E (deep brown) / 보조 rgba(45,27,30, 0.5~0.78)
- **Depth:** 흰 카드 + 브랜드 컬러 글로우 섀도(0 8px 24~40px accent/0.08~0.12) + rgba(45,27,30,0.06~0.12) 보더
- **Feel:** 라이트 글래스(흰 카드), aurora orbs(옅은 로즈/골드/피치), moon crescent, serif headings
- **배경 컴포넌트:** `components/AuroraBackground.tsx` (다크 CosmicBackground는 이행 완료로 미사용)

---

## Tokens

### Spacing
```
Base: 4px
Scale: 4, 8, 12, 16, 24, 28, 32
Gap default: gap-4 (16px)
Section padding: py-14 md:py-20
Button padding: py-3.5 px-6 (cards) / py-2.5 px-5 (pills)
```

### Border Radius
```
xs:   rounded-xl     — 12px  (inputs, small buttons)
sm:   rounded-2xl    — 24px  (buttons, chips, guide cards)
md:   rounded-[2rem] — 32px  (service cards, feature cards)
lg:   rounded-[2.4rem]–[2.5rem] (saju intro panel)
xl:   rounded-[3rem] — 48px  (reading library section)
full: rounded-full   (pills, pill buttons, scroll indicator)
```

### Colors
```
Background:
  base:     #FBF7F2   (warm ivory)
  card:     #FFFFFF / rgba(255,255,255,0.92)
  card-soft: rgba(255,255,255,0.6–0.85)
  border:   rgba(45,27,30, 0.08–0.12)

Primary (Dusty Rose — 사주/궁합):
  사주/궁합: #d4688a   (dusty rose, 라이트 대비용으로 심화)
  rose-end: #c2255c

Accent Purple (타로):
  default:  #7c6fd6   (라이트 대비용 심화)

Accent Green (MBTI):
  default:  #0e9f73

Accent Gold:
  default:  #c2883a (소프트 골드 — 앰버/주의 액센트)

Text:
  heading:  #2D1B1E  (deep brown)
  body:     rgba(45,27,30, 0.7–0.78)
  muted:    rgba(45,27,30, 0.4–0.55)
  label:    rgba(212,104,138, 0.6–0.72) (rose)

Glow / Tint Opacities (흰 카드 위):
  rose:     rgba(212,104,138, 0.06–0.18)
  purple:   rgba(124,111,214, 0.06–0.16)
  green:    rgba(14,159,115,  0.05–0.18)
  shadow:   rgba(45,27,30,    0.06–0.12)

Sparkle/dust: rgba(185,138,60,0.9) (옅은 골드)
```

### Typography
```
Headings (h1, h2, section titles):
  font-family: "Noto Serif KR", serif
  font-weight: font-bold (700)
  — 럭셔리/신비로운 감성 핵심

Body / Labels:
  font-family: Pretendard (기본 sans)
  weight: font-black (labels/caps), font-bold (h3), font-medium (body)

Scale:    xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 8xl
Tracking: tracking-[0.28em]–[0.3em] for all-caps labels
          tracking-tight for headings
Leading:  leading-tight (headings), leading-relaxed/7/8 (body)
```

### Depth / Elevation
```
Level 1 — Subtle:  0 4px 24px rgba(0,0,0,0.22) + 1px rgba(white,0.04) inset
Level 2 — Default: 0 8px 40px {accent-glow} + 1px rgba(white,0.04) inset
Level 3 — Raised:  0 8px 48px {accent-glow} stronger
Level 4 — Modal:   shadow-2xl + backdrop-blur(20px) + glow

Aurora orbs: radial-gradient, opacity 0.05–0.10, very diffuse (width 700–1100px)
```

---

## Patterns

### Button — Primary (card CTA)
```
Height:     py-3.5
Radius:     rounded-full
Background: linear-gradient(135deg, accent, accentEnd)
Shadow:     0 4px 20px accent-glow, inset 0 1px 0 rgba(white,0.16)
Text:       font-bold text-white text-sm
Hover:      brightness-110, shadow-lg, gap 커지기
Active:     scale-[0.97] brightness-95
```

### Button — Secondary (link style)
```
Padding:    px-4 py-2.5
Radius:     rounded-xl
Background: rgba(accent, 0.12)
Border:     1px solid rgba(accent, 0.20)
Text:       font-black text-sm, accent color
Hover:      scale-[1.02]
```

### Card — Service (dark glass)
```
Padding:    p-7
Radius:     rounded-[2rem]
Background: radial-gradient(ellipse at 110% -10%, accent/16 0%, rgba(18,8,16,0.90) 55%)
Backdrop:   blur(20px)
Border:     1px solid accent/16
Shadow:     0 8px 40px accent-glow, inset 0 1px 0 rgba(white,0.04)
Hover:      y -8px, duration 0.2s
Decoration: top accent line (44% width), number badge (top-right), ambient glow orb
```

### Card — Feature / Guide Choice
```
Padding:    p-6–p-7
Radius:     rounded-[2rem]
Background: radial-gradient(ellipse at 100% 0%, accent/12, rgba(18,8,16,0.74))
Border:     1px solid accent/26
Hover:      y -4px
```

### Card — Glass (saju intro, reading library)
```
Background: rgba(255,255,255, 0.025)
Backdrop:   blur(20px)
Border:     1px solid accent/0a–10
Shadow:     0 4px 32px accent-glow/05
```

### Input — Default
```
Padding:    px-4 py-3
Radius:     rounded-xl
Border:     1px solid rgba(232,130,154,0.20)
Background: rgba(255,255,255,0.04)
Focus:      border-rose-400, ring-1 ring-rose-400/20
```

### Decoration — Moon Crescent
```
SVG crescent, size 48–68px
Primary: rgba(232,130,154,0.45)
Overlay: rgba(157,143,255,0.50) at opacity-20
Position: absolute top-right of hero, pointer-events-none
```

---

## Aurora Background Pattern
```
Orb 1 (top center, warm rose):
  size: 1100×900px
  color: rgba(232,130,154,0.10) → rgba(180,80,120,0.04) → transparent
  animation: aurora-drift 16s

Orb 2 (right, violet):
  size: 800×700px
  color: rgba(130,90,255,0.07)
  animation: aurora-drift-2 20s

Orb 3 (bottom-left, teal):
  size: 700×600px
  color: rgba(0,200,140,0.05)
  animation: aurora-drift 24s reverse

Orb 4 (top-right, warm gold):
  size: 420×420px
  color: rgba(210,160,100,0.05)
  animation: aurora-drift-2 28s
```

---

## Section Label Pattern
```
<p className="text-xs font-black uppercase tracking-[0.3em]"
   style={{ color: 'rgba(232,130,154,0.60)' }}>
  Services
</p>
<h2 style={{ fontFamily: '"Noto Serif KR", serif', color: '#f5eef2' }}>
  섹션 제목
</h2>
```

---

## Z-Index Scale
```
background:  z-[-1]
stars/aurora: z-0  (fixed)
content:     z-10
navigation:  z-50  (fixed)
modal:       z-[100]–z-[110]
```

---

## Notes
- **헤딩은 반드시 Noto Serif KR** — 럭셔리/신비 감성의 핵심
- **배경색 #FBF7F2(웜 아이보리)** — 순백 #fff 페이지 배경 금지(아이보리 유지). 카드는 흰색 OK.
- **텍스트는 #2D1B1E(딥브라운)** — 순흑 #000 금지
- **Primary rose = #d4688a** — 형광 핫핑크 금지. 퍼플 #7c6fd6 / 그린 #0e9f73 / 골드 #c2883a (모두 라이트 대비용 심화값)
- 흰 카드 + 컬러 글로우 섀도 — neutral gray-only 섀도 금지(브랜드 컬러 glow 포함)
- 보더는 rgba(45,27,30, 0.08~0.12) 저채도 1px — 흰 위 흰 보더(white/0.1) 금지
- All-caps labels: tracking-[0.28–0.3em]
- 달 초승달(MoonCrescent SVG) 히어로 우측 상단 고정 장식
- **그라디언트 텍스트 주의**: 라이트 배경에선 밝은 끝색(연틸/연퍼플)이 묻힌다 — 끝색을 심화(#0e9f73 등)할 것
- 다크 잔재 hex(#160c1a, #0d0710 등)를 카드/마스크 배경에 쓰지 말 것
