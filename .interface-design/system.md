# Design System — Saju Cheatkey

## Direction
**Mystic Feminine Luxury** — 별이 가득한 밤하늘 아래, 나를 위한 럭셔리 웰니스 공간.
따뜻한 다크 플럼 배경 위에 더스티 로즈 + 소프트 바이올렛 + 티파니 틸 조합.
Noto Serif KR 헤딩으로 럭셔리/신비로운 감성, 글래스모피즘 카드, 달 장식 모티프.
타겟: 20-30대 여성 — 게이밍 느낌 제거, 웰니스/럭셔리 K-뷰티 감성 강화.

## Foundation
- **Background:** #0d0710 (warm dark plum — 보라빛 도는 따뜻한 어두움)
- **Star color:** #ffeef5 (핑크빛 화이트 별)
- **Text base:** #f5eef2 (웜 화이트)
- **Depth:** Shadow-heavy with brand color glow (no neutral gray-only shadows)
- **Feel:** Glass morphism, aurora orbs, moon crescent decoration, serif headings

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
  base:     #0d0710   (warm dark plum)
  card-bg:  rgba(18,8,16,0.88–0.90)
  glass:    rgba(255,255,255,0.025)
  overlay:  rgba(255,255,255,0.035)

Primary (Dusty Rose — 사주/궁합):
  사주:     #e8829a   (dusty rose — softer than neon pink)
  사주-end: #c2255c
  궁합:     #d4688a
  궁합-end: #9e1c4e

Accent Purple (타로):
  light:    #c49fff
  default:  #9d8fff
  dark:     #534ab7

Accent Teal (MBTI):
  default:  #00e5a0 → #7decc8 (gradient end in hero)
  dark:     #059669

Text:
  heading:  #f5eef2  (warm white)
  body:     rgba(240,232,238, 0.66)
  muted:    rgba(240,232,238, 0.36–0.46)
  label:    rgba(232,130,154, 0.60–0.72)

Glow Opacities:
  rose:     rgba(232,130,154, 0.07–0.22)
  purple:   rgba(157,143,255, 0.03–0.20)
  teal:     rgba(0,229,160,   0.05–0.16)

Star color: #ffeef5 (핑크빛 화이트)
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
- **배경색 #0d0710** — 절대 #06040f(쿨블랙)으로 되돌리지 말 것
- **Primary pink = #e8829a** (더스티 로즈) — #ff6eb4(형광 핫핑크) 사용 금지
- Glass morphism dominant — bg-white/opacity + backdrop-blur
- Shadows carry color (rose/purple/teal glow) — neutral gray-only 금지
- All-caps labels: tracking-[0.28–0.3em]
- Star color: #ffeef5 (핑크빛 화이트) — 순백 #fff 사용 금지
- 달 초승달(MoonCrescent SVG) 히어로 우측 상단 고정 장식
