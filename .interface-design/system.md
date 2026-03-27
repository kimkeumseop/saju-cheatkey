# Design System — Saju Cheatkey

## Direction
Warmth & Depth — Soft pink/rose brand with glass morphism, layered shadows, and rounded organic forms. Korean spiritual/wellness aesthetic.

## Foundation
- **Color:** Warm pink-tinted white backgrounds, rose primary, purple/green accents
- **Depth:** Shadow-heavy (70% shadows, 30% borders) — glows and layered box-shadows over flat borders
- **Feel:** Glass morphism cards, frosted surfaces, ambient glow effects

---

## Tokens

### Spacing
```
Base: 4px
Scale: 4, 8, 12, 16, 24, 28, 32
Gap default: gap-4 (16px)
Section padding: p-6 (24px) — p-8 (32px)
Button padding: py-4 px-6
```

### Border Radius
```
xs:  rounded-xl    — 12px  (inputs, small buttons)
sm:  rounded-2xl   — 24px  (buttons, chips) ← most common
md:  rounded-[2rem] — 32px  (cards, modals)
lg:  rounded-[2.5rem] — 40px (hero cards)
full: rounded-full  (pills, avatars, icons)
```

### Colors
```
Background:
  base:     #fff5f7   (pink-tinted white)
  surface:  #fffafb
  overlay:  rgba(255, 250, 250, 0.85)

Primary (Pink/Rose):
  light:    #f9a8c9   (primary-300)
  mid:      #f06595   (primary-500)
  default:  #e64980   (primary-600)
  dark:     #c2255c   (primary-700)
  text-dark: #2d1b1e  (deep brown)

Accent Purple (Tarot):
  light:    #a09de8
  default:  #7F77DD
  dark:     #534AB7 / #6B63CC

Accent Green (MBTI):
  default:  #10B981
  dark:     #059669

Social:
  kakao:    #FEE500
  naver:    #03C75A

Glow Opacities:
  pink:     rgba(240, 101, 149, 0.08–0.18)
  purple:   rgba(127, 119, 221, 0.14–0.25)
  green:    rgba(16, 185, 129, 0.12–0.20)
```

### Typography
```
Scale:    xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 8xl
Weights:  font-black (h1/labels), font-bold (h2–h3), font-semibold (h4), font-medium (inputs)
Tracking: tracking-[0.28em]–[0.3em] for all-caps labels; tracking-tight for headings
Leading:  leading-tight (headings), leading-relaxed (body)
```

### Depth / Elevation
```
Level 1 — Subtle:    shadow-sm + 1px rgba(pink, 0.05) border
Level 2 — Default:   shadow-lg + glow: 0 8px 32px rgba(pink, 0.08)
Level 3 — Raised:    shadow-xl + glow: 0 12px 30px rgba(pink, 0.12)
Level 4 — Modal:     shadow-2xl + backdrop-blur(20px) + glow
```

---

## Patterns

### Button — Primary
```
Height:     py-4 (implicit ~52px)
Padding:    px-6 py-4
Radius:     rounded-2xl
Background: bg-primary-600 (or gradient to primary-700)
Shadow:     shadow-lg
Text:       font-bold text-white
Hover:      bg-primary-700, shadow-xl, scale-[1.02]
```

### Button — Pill/Secondary
```
Padding:    px-4 py-2
Radius:     rounded-full
Border:     1px solid primary-200
Text:       text-sm font-semibold text-primary-700
```

### Card — Default
```
Padding:    p-6 – p-8
Radius:     rounded-[2rem]
Background: bg-white/90 or bg-white/95
Border:     1px solid rgba(240, 101, 149, 0.08–0.12)
Shadow:     0 8px 32px rgba(240, 101, 149, 0.08), 0 2px 8px rgba(240, 101, 149, 0.04)
```

### Card — Glass
```
Padding:    p-6 – p-8
Radius:     rounded-[2rem] – rounded-[2.5rem]
Background: rgba(255, 250, 250, 0.85)
Backdrop:   backdrop-filter: blur(20px)
Border:     1px solid rgba(240, 101, 149, 0.10)
Shadow:     0 10px 30px -5px rgba(240, 101, 149, 0.08)
```

### Input — Default
```
Padding:    px-4 py-3
Radius:     rounded-xl
Border:     1px solid pink-100 / border-pink-200
Background: bg-white
Focus:      border-primary-400, ring-2 ring-primary-100
```

### Modal
```
Radius:     rounded-[2.5rem] – rounded-[3rem]
Background: bg-white/95, backdrop-blur(20px)
Shadow:     shadow-2xl
Z-index:    z-[100] – z-[110]
```

---

## Z-Index Scale
```
background:  z-[-1]
content:     z-10
navigation:  z-50 (fixed)
modal:       z-[100] – z-[110]
```

---

## Notes
- Glass morphism is the dominant card pattern — prefer bg-white/opacity + backdrop-blur over flat solid backgrounds
- Shadows carry color (pink/purple glow) — avoid neutral gray-only shadows
- All-caps labels use wide letter-spacing (0.28–0.3em)
- Rounded corners are generous — prefer 2rem+ for major containers
