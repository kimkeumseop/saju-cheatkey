# Myeongrihak (Saju) Web Service Blueprint

## Overview
A modern Myeongrihak (Saju) web service that provides personalized life analysis based on the user's birth date and time. Unlike traditional shamanistic approaches, this service focuses on a clean, psychological counseling-style UI/UX, offering insightful analysis of personality, wealth, career, and relationships.

## Project Architecture & Tech Stack
- **Frontend:** Next.js (App Router)
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **State Management:** React Hooks
- **Data Fetching:** Fetch API with App Router Route Handlers
- **Manseoryeok Engine:** `lunar-javascript`
- **Visualizations:** `recharts` for Five Elements (Ohaeng) distribution
- **AI Integration:** `@google/generative-ai` (Gemini-2.5-flash-lite)

## Design & Aesthetic
- **Concept:** "Modern Psychological Counseling"
- **Color Palette:** Deep indigo, soft gold, and clean whites.
- **Typography:** Expressive serif for headings, clean sans-serif for body text.
- **Header:** Simplified navigation with logo only (no call-to-action button).
- **Interactivity:** **5-Tab Text System** for deep analysis, glassmorphism, and responsive layouts.

## Current Progress & Steps

### Phase 1: Environment Setup & Migration
- [x] Migrate from `pages/` to `app/` directory (App Router).
- [x] Install and configure Tailwind CSS v4 with PostCSS.
- [x] Install core dependencies: `lunar-javascript`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`.

### Phase 2: Core Logic Implementation
- [x] Implement Manseoryeok engine utility to convert birth data to Saju (8 characters).
- [x] **Data Enhancement:** Created `SAJU_MEANING` dictionary with natural metaphors (e.g., "Deep Sea", "Spring Tiger"), colors, and icons.
- [x] **Ten Gods (십성) Logic:** Integrated standard Saju relationship logic (Year/Month/Day/Hour Ten Gods) into the engine.
- [x] **Logic Update:** Modified `calculateSaju` to return structured `sajuBreakdown` with Ten Gods and Element data.

### Phase 3: UI/UX Development
- [x] **Global Layout:** Navigation bar, Footer, and responsive container.
- [x] **Home Page:** Hero section with high-quality illustration and Saju input form.
- [x] **Saju Result Page (Premium Refactoring):**
    L39:     - [x] **8-Character Barcode UI (Instagram Redesign):**
    L40:         - Removed scholarly Hanja (Sipsung) and replaced with intuitive "Emoji + Hangul" O-haeng labels.
    L41:         - Applied modern, rounded gothic fonts for Hanja characters.
    L42:         - Increased padding and refined shadows/borders for a "Pop" aesthetic.
    L43:         - Updated Day Master highlight to "👑 나의 본질" with enhanced visual effects.
    L44:     - [x] Pastel Element Coding: Applied element-based pastel backgrounds.

    - [x] Ohaeng distribution chart.
    - [x] **AI Counseling (5-Tab Text System):**
        1. **사주 뜻풀이 (Saju Meaning):** Detailed analysis of the 8 characters and their harmony.
        2. **종합 총평 (Overall Analysis):** In-depth look at innate temperament and personality.
        3. **직업·재물 (Career & Wealth):** Analysis of professional strengths and financial flow.
        4. **연애·관계 (Love & Relationships):** Insights into interpersonal traits and romance.
        5. **올해의 조언 (Yearly Advice):** Specific guidance for the year 2026.
    - [x] Simplified UI: Removed visual cards and timelines within AI counseling to reduce redundancy.

### Phase 4: AI Deep Counseling Implementation (Updated)
- [x] **Gemini Integration:** Updated to `gemini-2.5-flash-lite` for high performance and cost-efficiency.
- [x] **API Route (`/api/analyze`):**
    - **Prompt Enhancement (2026):** Strictly set current year to 2026 (Byeongo-nyeon) for accurate yearly analysis.
    - **Readability:** Mandatory Hanja-Hangul bilingual notation (e.g., 戊(무)토).
    - **Tone:** Friendly, veteran teacher persona using nature-based metaphors.
    - **Output Structure:** 5-field JSON (basic, overall, career, love, advice) for text-only tab mapping.
- [x] **AiCounseling Component:** Rolled back to a clean, text-focused 5-tab structure with enhanced typography and readability.

### Phase 5: SEO & Final Polishing
- [ ] Implement dynamic metadata for Saju results.
- [ ] Configure `robots.txt` and `sitemap.xml`.
- [x] **Final UI/UX polish:**
    - [x] Improved main page title alignment and line breaks for better readability.
    - [x] **Unified Dark Theme:** Changed result page to `bg-slate-950` with high-contrast text (`text-gray-100`, `text-gray-300`).
    - [x] **Routing Fix:** Eliminated 404 errors by replacing external links with internal state-based tabs.
- [x] **Branding Update:** Changed "인생 치트키" (Life Cheat Key) to "사주 치트키" (Saju Cheat Key) for more specific service identity.
- [x] **KakaoTalk Sharing Integration:**
    - [x] Integrated Kakao SDK v2.7.2 in `app/layout.tsx`.
    - [x] Implemented SDK initialization and sharing logic in `ShareButtons.tsx` using JavaScript Key.
- [x] Build and Lint check.

### Phase 6: Authentication & Login System (Premium)
- [x] **Global Auth State Management:** Implemented `AuthContext` using Firebase Authentication (`lib/auth.tsx`).
- [x] **Integrated Login Modal:** 
    - Designed a "Pop" MZ-style centered modal with backdrop-blur effects.
    - Features seamless switching between Login and Signup tabs.
    - Responsive design with internal scrolling to prevent UI clipping on mobile.
- [x] **Social Login Integration:** 
    - Google, Kakao, and Naver login buttons prominently displayed.
    - Implemented standardized error handling with user-friendly Korean alerts (e.g., handling `popup-closed-by-user`).
- [x] **Profile Integration:** Connected `Navbar` to display user nicknames and profile photos upon successful login.
- [x] **Security & Domain Setup:** Configured authorized domains and detailed error logging for production environments.

## Implementation Details (Latest Update)
- **Login UI Optimization:** Centered the login modal and added a scrollable container (`max-h-[70vh]`) to ensure all login options (Google, Kakao, Naver, Email) are visible on small screens.
- **Enhanced Debugging:** Added Firebase environment variable checks and detailed console logging for authentication flows.
- **Visual Redundancy Removal:** Cleaned up the AI counseling UI by removing overlapping visual elements like cards and timelines.
- **Text-Focused Design:** Prioritized reading experience with improved spacing, line height (leading-2.0), and drop-caps for each tab.
