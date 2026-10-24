# Landing page: technical plan

Status: **built 2026-10-23** on branch `feat/landing-page` following the decisions in section 10 and the build order in section 11. Section 12 records where the implementation deviates from the text below.

Sources analysed (all in `landing-page-assets/`):

- `Landing Page.png`: full-length 4x export of the 1440px desktop frame (5760 x 21764 px, so the page is 1440 x 5441 CSS px).
- `Pathway - Google Chrome 2026-10-23 13-14-19.mp4`: 40.6 s screen recording of the designer's live demo at 1920 x 1080. Timestamps below refer to this file so it does not need to be re-watched.
- Everything else: exported assets (see the manifest in section 8).

The demo differs from the export in a few places (placeholder names on the hero cards, four careers in the folder stack instead of one, different card copy widths). Where they differ, the export is the source of truth for look and the recording is the source of truth for motion.

---

## 1. Page anatomy

Vertical positions are approximate CSS px at the 1440 frame, measured from the export.

| # | Section | Approx. y | Background |
|---|---------|-----------|------------|
| 0 | Floating nav | 40 to 96 (sticky) | white, 1px `#e7e8e9` border, radius ~12, soft shadow |
| 1 | Hero | 0 to 1010 | white, lavender + cream cloud bands at the bottom |
| 2 | "Choosing a career" sticker cards | 1010 to 2040 | white; green note corner top-right, spiral notebook bottom-left |
| 3 | "How it works" draggable track | 2040 to 2790 | mint band `#e5f9ef` |
| 4 | "Explore careers" folder stack | 2920 to 3960 | white; folders are full-bleed shapes |
| 5 | FAQ | 4080 to 4480 | white |
| 6 | App download CTA card | 4590 to 4960 | lavender card `#f5f0fe` |
| 7 | Footer | 5060 to 5441 | green `#1d5036`, grid lines |

Content column: 1064px wide (x 188 to 1252), which is the nav's width. The folder stack and the cloud bands break out to full width.

### Copy (verbatim from export, gaps filled from the recording)

**Nav**: Explore · How it works · Opportunities · Mentors · Log in · Get Started →

**Hero**
- H1: `Don't guess your career. [briefcase] Map it. [send]` (the two icons are inline 3D squircles: pink briefcase `Frame 2147226756.svg`, green send `Frame 2147226757.svg`)
- Sub: `Pathway helps students and graduates explore careers and plan their next steps.`
- Buttons: `Explore careers` (secondary) · `Get started` (primary)

**Section 2**: H2 `Choosing a career shouldn't feel like guessing.`
1. Blue `#e6f4ff`: `Curated set of careers, side by side, with no best or worst.` (`Illustration.png`)
2. Lavender `#f5f0fe`: `A roadmap in the order you should learn it.` (`Illustration (1).png`)
3. Cream `#fff8eb`: `One resource per step, with a reason it's there.` (`Illustration (2).png`)
4. Pink `#ffeaf4`: `A plan built from your skills, studies and goals.` (`Illustration (3).png`)

**Section 3**: eyebrow `How it works` (handwritten accent font), H2 `From "I'm not sure" to your first step.`
1. `Tell us about you`: `Your studies, skills and interests. About 3 minutes, and you can finish later.`
2. `See your fit`: `Know how many key skills you already have for a career, and what's left to learn.`
3. `Follow your roadmap`: `Stages and steps in order, with courses and certificates picked for each one.`
4. `Take action`: `Apply to internships, scholarships and more that match your pathway.`

**Section 4**: H2 `Explore careers, mapped end to end.` Sub `Career outlook, skills, roadmaps, and opportunities in one place.` Each folder: icon, title, one-liner, three chips, `Explore careers` secondary button.
1. Peach: `Full Stack Developer`, `Build complete web applications, front to back.` Chips Frontend / Backend / Databases (orange chips). Icon `Frame.svg`.
2. White: `Data Analyst`, `Turn data into insights that guide decisions.` Chips SQL / Visualisation / Statistics (yellow chips). Icon `Frame (2).svg`.
3. Green: `UX Researcher`, `Understand users and uncover what they really need.` Chips Interviews / Usability / Analysis (green chips). Icon `Frame (4).svg`.
4. Lavender: `Product Manager`, `Guide products from idea to launch and beyond.` Chips Product Strategy / Prioritisation / Stakeholder Management (brand-500 chips). Icon `Frame (3).svg`.

**Section 5**: eyebrow `FAQs`, H2 `Frequently asked questions`
1. `Who is Pathway for?` → `University students and graduates who want to see where careers are heading and how to get skilled for one.` (open by default)
2. `Can I change my mind?` → `Yes. Update your pathway any time, or switch careers. Your earlier progress stays saved.`
3. `How long does setup take?` → `About 3 minutes. You can skip any question and finish later in your profile.`
4. `Will Pathway get me a job?` → `No one can promise that. We show you what to learn, in what order, and opportunities that match, so your next move is clearer.`

**Section 6**: H2 `Ready to see where you could go?` Sub `Compare careers and build a plan around your skills, studies, and goals.` Buttons ` Download iOS` (primary) · `▶ Download Android` (secondary, purple text).

**Footer**: logo (green mark + white wordmark) · How it works · Careers · Help · privacy · Instagram / X / LinkedIn buttons · `With love from Ethel, Chidera, Mufidat & Taiwo`

---

## 2. Global behaviour

### Nav
- Floating pill: 1064px wide, centred, 24px from the top, white background, `#e7e8e9` 1px border, ~12px radius, subtle drop shadow.
- `position: sticky` (or fixed) for the whole page. In the recording (0:07.5 and 0:16.0) heading text passes *under* the nav and is blurred, so the nav is translucent with `backdrop-filter: blur()`. Proposed: `bg-white/80 backdrop-blur-md`.
- Left: lavender logo (`/brand-logo-lavender.svg`, already in `public/`). Centre: four links, active one in ink (`Explore` is active on the landing page), others grey-500. Right: `Log in` text link and `Get Started →` primary button (brand-500 fill, brand-600 bottom edge, white text, arrow icon).
- No scroll-driven size change observed. Hover states on the buttons are the standard primary/secondary ones from `src/components/ui/Button.tsx`.
- Link targets: Explore → `/careers`; How it works → `#how-it-works` (smooth scroll); Opportunities and Mentors → coming soon (same `aria-disabled` treatment as `AppTopNav`); Log in → `/login`; Get Started → `/careers/onboarding`.

### Typography (confirmed)
The landing page uses three families, none of which the app currently loads:

| Role | Family | Source | Weights |
|------|--------|--------|---------|
| Headings (H1, H2, card titles) | **Borscha** | `landing-page-assets/Borscha-{Medium,SemiBold,Bold}.ttf` → move to `src/assets/fonts/` | 500 / 600 / 700, static files |
| Body, nav, buttons, chips, FAQ | **Neue Montreal** | `landing-page-assets/NeueMontreal-{Regular,Medium}.otf` → `src/assets/fonts/` | 400 / 500, static files |
| Handwritten eyebrows (`How it works`, `FAQs`, `With love from…`) | **Sour Gummy** | npm `@fontsource-variable/sour-gummy` (5.3.0) | variable, use ~500 |

- Register the five static faces with `@font-face` in `index.css` next to Figtree (one block per weight, `font-display: swap`). Expose as `--font-landing-display`, `--font-landing-body`, `--font-accent` under `@theme`. The landing root sets `font-landing-body` so the app's Figtree/Google Sans tokens stay untouched elsewhere.
- Sizes from the export: H1 ≈ 64px / 1.05, section H2 ≈ 44px / 1.1, sticker card copy ≈ 26px, step card title ≈ 24px, body 16px.
- Borscha and Neue Montreal are static (non-variable) files, so no `font-weight` range on the declarations. Neue Montreal is a licensed family: confirm the licence covers self-hosted web use before the PR merges.
- Subset Sour Gummy to latin (fontsource ships per-subset files; import `@fontsource-variable/sour-gummy/wght.css` and let Vite tree-shake the unicode-range blocks).

### Colour tokens to add (eyedropped from the export, confirm against Figma)
| Token | Value | Use |
|-------|-------|-----|
| `landing-mint` | `#e5f9ef` | How it works band |
| `landing-mint-card` | `#ccf4df` | How it works cards (from `Sticker.png`) |
| `landing-sticker-blue` | `#e6f4ff` | Section 2 card 1 |
| `landing-sticker-cream` | `#fff8eb` | Section 2 card 3 |
| `landing-sticker-pink` | `#ffeaf4` | Section 2 card 4 |
| `landing-folder-peach` | `#feeee7` | Folder 1 (from `Vector 19.svg`) |
| `landing-folder-green` | `#f4faeb` / stroke `#d8ecb6` | Folder 3 (`Vector 21.svg`) |
| `landing-footer` | `#1d5036` | Footer |
| `landing-pink` | `#ff3193` | Hero briefcase squircle |
| `landing-green` | `#00c660` | Hero send squircle |

Already covered by existing tokens: lavender `#f5f0fe` ≈ `brand-50` (`#f6f0ff`, used for card 2, folder 4, CTA card), `#9e67f7` = `brand-500` (buttons, chips), `#7f52c6` = `brand-600` (button edge), `#767676` = `grey-500` (muted text), `#f2f2f2` = `grey-50` (FAQ items).

---

## 3. Section specs and animation

### 3.1 Hero (0:00 to 0:07 in the recording)

Layout: centred H1 with two inline 60px squircle icons (`Frame 2147226756.svg`, `Frame 2147226757.svg`, both have a baked-in inner shadow), subtitle, two buttons. Below: three fanned profile cards sitting *between* two full-width cloud bands.

Layer order, back to front:
1. `Back Cloud.png` (cream, 1440 x 388 at 1x), anchored to the bottom of the hero, full width.
2. Three profile cards: `graphic right (2).png` (Taiwo Talaricp, back-left, rotated ≈ -6°), `graphic right (1).png` (Ethel Chidera, middle, ≈ -3°), `graphic right.png` (Taiwo Mufidat-Prince, front, ≈ +4°). The names are baked into the PNGs. Cards overlap and their lower halves are hidden by the front cloud.
3. `Top Cloud.png` (lavender `#f6f0ff`, 1440 x 406 at 1x), full width, in front of the cards. Its flat bottom edge is the hero's bottom edge.

Motion observed: none while idle, and the cards scroll with the page at normal speed (no parallax). Hover states on `Get started` and `Get Started →` only.

Approved addition (not in the recording): a one-time entrance on load. Heading and subtitle fade up (400ms, 60ms stagger), then the three cards rise from behind the cloud and fan out to their resting rotation (600ms, 100ms stagger, spring-ish ease). Pure CSS keyframes, runs once, skipped under reduced motion.

### 3.2 "Choosing a career" sticker cards (0:09.5 to 0:16)

Layout: centred H2, then four rounded cards (~400 x 400, radius ~40) overlapping left to right with ~100px overlap, each tilted a few degrees in alternating directions. Each card: copy top-left, isometric illustration bottom-right (the `Illustration*.png` files, which include the card's bottom-right bleed). Later cards sit on top of earlier ones. Decor: `image 37.png` (green ruled note, rotated ~45°) half off the right edge straddling the hero/section boundary; the spiral notebook and pen (`Group 11.png`) bottom-left, straddling into section 3.

Motion (confirmed by design): **scroll-driven**, the same family of effect as the folder stack. The cards' entry is bound to scroll position, not to timers. In the recording the cards appear one after another (card 2 at 0:11.1, card 3 at 0:13.0, card 4 at 0:14.4) as the designer nudges the scroll position; each card rises from ~130px below its resting spot while fading in, and the sequence reverses when scrolling back up.

Spec: map the section's scroll progress to the four cards in staggered windows. Let `p` be 0 when the card row's top reaches 85% of the viewport height and 1 when it reaches 35%. Card *i* animates over the window `[0.18 i, 0.18 i + 0.3]` of `p`: `opacity 0 → 1`, `translateY(120px) → 0`, `rotate(0) → resting tilt`, eased with `cubic-bezier(0.22, 1, 0.36, 1)`. All four are settled by `p = 0.85`, so a normal scroll resolves the whole row in roughly half a viewport of travel and a slow scroll can scrub it.

Implementation: a `useScrollProgress(ref, { start: 0.85, end: 0.35 })` hook (passive scroll listener, `requestAnimationFrame`-throttled, computes `p` from `getBoundingClientRect`) writes `--p` as a CSS variable on the section. Each card derives its own progress in CSS: `--c: clamp(0, (var(--p) - var(--i) * 0.18) / 0.3, 1)` and uses it in `opacity`, `translate` and `rotate`. One listener per section, no per-frame React renders. Where `animation-timeline: view()` is supported, the same keyframes can be bound natively behind `@supports`; the hook remains the cross-browser path. Reduced motion: `--p` is forced to 1.

### 3.3 "How it works" draggable track (0:16 to 0:23.5)

Layout: full-width mint band. Eyebrow + H2 centred. Below, a horizontal row of four mint sticky-note cards (`Sticker.png` is the card with its folded corner, 360 x 360 at 1x), each with a green paperclip (`Pin.png`) hanging over the top edge at ~70% across. Card gap ~20px. The row is wider than the content column: at 1440 only ~3.4 cards are visible and the fourth is cut by the right edge.

Motion observed (frames at 0:18.5 to 0:22.5):
- Cursor over the row is the open-hand **grab** cursor; while dragging it becomes grabbing. The user drags the row left by roughly one card and it stays where released (free drag, no snapping observed). The vertical scroll position does not change while this happens.
- The card under the pointer **scales up ~4%** on hover (visible at 0:19.5 on "See your fit", at 0:20.0 on "Follow your roadmap", at 0:21.0 on "Take action"). No shadow change.

Proposed: a drag-to-scroll horizontal track using Embla Carousel (`embla-carousel-react`, ~7 kB) with `dragFree: true`, `containScroll: 'trimSnaps'`, `align: 'start'`. It gives pointer and touch dragging, momentum, and wheel support without hand-rolling pointer maths. Keep the native overflow fallback if JS fails. Cards: `transition-transform duration-200 hover:scale-[1.04]`. Hide the scrollbar. Expose arrow keys via Embla's slide focus. Alternative if we want zero deps: `overflow-x: auto` + a 40-line pointer-drag hook; less polished on momentum.

### 3.4 "Explore careers" folder stack (0:23.5 to 0:32)

Layout: centred H2 + subtitle, then four full-bleed folder shapes. The folder bodies are 1360px wide with a tab notch at the top; the four tab SVGs (`Vector 19.svg` to `Vector 22.svg`) put the tab at a different x each (left-centre, right, left-centre, right-centre). Folders alternate horizontal anchoring: folders 1 and 3 are flush left (x 0 to 1360), folders 2 and 4 flush right (x 80 to 1440). This 80px offset is why the icons of the folders underneath peek out at the left edge in the export. Each folder's content row (icon tile 160px, title, one-liner, chips, `Explore careers` button on the right) sits ~140px below its tab.

Motion observed: a **scroll-driven stacking** effect. As the user scrolls, folder 1 scrolls up to a fixed offset and stops; folder 2 slides up from below and lands ~157px lower, covering folder 1's content but leaving its tab visible; then folder 3 and 4 do the same (0:25.0 → 0:27.5 → 0:29.0 → 0:31.0). The end state is the export: four tabs staggered, Product Manager's content fully visible. Scrolling back reverses it. In the export, folders 3 and 4 share the same tab height; design confirmed that is a layout compromise, so use **uniform 157px steps**.

Proposed: **CSS `position: sticky`, no JS.** Each folder is a block in normal flow inside the section; folder *i* gets `top: calc(var(--nav-clearance) + i * 157px)`. Because later folders come later in the DOM they paint on top. The section's height is the sum of the folder heights, which gives the right amount of scroll travel. This exactly reproduces the demo and is scrubbable and reversible for free. The tab shape is an inline SVG (`preserveAspectRatio="none"` only on the straight body section; the tab path keeps its ratio) so the body can stretch to any width. Reduced motion needs no change: the stack simply scrolls.

Chip colours: orange for Full Stack (`accent-500`), yellow for Data Analyst, green for UX Researcher, `brand-500` for Product Manager. Icon tile is a 160px rounded square tinted with the folder colour, illustration from the `Frame*.svg` set.

### 3.5 FAQ (0:32 to 0:37)

Layout: two columns. Left: eyebrow `FAQs` (accent font), H2. Right: four items, each a `grey-50` rounded card (radius ~16) with the question and a 32px white square button with a purple `+` / `−` glyph and a soft shadow. The open item shows its answer inside a white inner card with muted text.

Motion observed: first item open on load. Clicking the open item collapses it; the answer's height animates (a sliver is visible mid-transition at 0:34.4), ~200ms. Clicking another item opens it. The hovered item's background darkens slightly. The icon swaps between `+` and `−` with no rotation.

Proposed: `Accordion` from the `radix-ui` package already in the dependencies, `type="single" collapsible defaultValue="who"`. Animate height with the `--radix-accordion-content-height` variable and 220ms ease-out keyframes (same pattern shadcn uses). Hover: `hover:bg-grey-100`. Icons: lucide `Plus` / `Minus`.

### 3.6 Download CTA (0:37 to 0:39)

Layout: lavender card (`brand-50`, 1px `brand-200`-ish border, radius ~40) spanning the content column, ~370px tall. Left: H2, sub, two buttons (`AppleLogo.svg`, `GooglePlayLogo.svg`). Right: the pink wave path (`Vector 5.svg`, clipped by the card) with the 3D purple keychain (`8ab85d82066a84e0362f4dbfc9f5a94612499155.png`) hanging from the card's top edge, chain cut off by the top.

Motion observed: none. The keychain does not swing in the demo.

Approved addition: a subtle pendulum sway on the keychain. `transform-origin` at the top centre of the chain (where it meets the card edge), `rotate(-1.5deg) ↔ rotate(1.5deg)`, 4 s `ease-in-out` loop, infinite, starts when the card is in view (so it does not run off-screen) and is off under reduced motion. The wave graphic stays static.

### 3.7 Footer (0:39 to end)

Layout: green `#1d5036` band. A 1064 x 155 grid of 1px lines (`white/20`) with the logo, links and social buttons centred inside it. Social buttons are white 36px squircles with a grey 3D bottom edge and grey glyphs. `With love from Ethel, Chidera, Mufidat & Taiwo` in the accent font, mint text. Decor: the red book (`HU9hBZdjRywQqBdKxn8A7kQTgg8 1.png`) top-left straddling the CTA/footer boundary; two silver pencils and a pink paper corner (`Frame 2147226733.png`) on the right.

Motion: none.

Needed: a white wordmark + green mark lockup. `Group.svg` is the green mark; the wordmark can be derived from `public/brand-logo.svg` by recolouring its paths to white. Social glyphs are Mingcute in the design, so use `@mingcute/react` (`InsLine`, `SocialXLine`, `LinkedinLine`).

---

## 4. Animation inventory (observed vs proposed)

| Where | Observed in demo | Approved spec | Mechanism |
|-------|------------------|---------------|-----------|
| Nav | Sticky, translucent blur | Same | CSS sticky + backdrop-filter |
| Hero | Static | One-time entrance on load | CSS keyframes |
| Sticker cards | Sequential slide-up as scroll advances | Scroll-scrubbed, staggered windows, reversible | `useScrollProgress` hook → `--p` variable + CSS |
| How it works | Drag-to-scroll, hover scale | Same | Embla Carousel + CSS hover |
| Folder stack | Scroll-driven stacking | Same, uniform 157px steps | CSS `position: sticky` |
| FAQ | Height animation, single open | Same | Radix Accordion + CSS |
| CTA keychain | Static | Subtle 1.5° sway, 4 s loop | CSS keyframes, paused off-screen |
| Everything | n/a | Respect `prefers-reduced-motion`: show final states, keep drag and accordion functional | `motion-reduce:` variants |

No animation library is needed. GSAP or Motion would add 35 to 70 kB for effects that CSS plus one small scroll-progress hook already cover. The only new runtime dependency is Embla (~7 kB).

---

## 5. Routing and shell

- Current `src/routes/index.tsx` redirects `/` to `/careers/onboarding`. Replace it with the landing page. Signed-in users hitting `/` get redirected to `/careers` in `beforeLoad` (after `ensureAuthHydrated`), matching the pattern in `src/routes/_protected.tsx`. Confirmed.
- `RootLayout` wraps every route in `AppShell`, which renders the sidebar. The landing page must not have it. Add a `"none"` value to `AppShellVariant` in `src/components/AppShell.tsx` that renders children only, and set `staticData: { shellVariant: "none" }` on the landing route. This reuses the existing `useMatches` plumbing in `RootLayout` and avoids a second root.
- The landing page has its own `LandingNav` and `LandingFooter`; it does not use `AppTopNav`.

---

## 6. Component structure

```
src/features/landing/
  landing.copy.ts            all strings and the FAQ / careers / steps data
  landing.styles.ts          shared class strings (section container, eyebrow, h2)
  hooks/useInView.ts         IntersectionObserver → boolean (keychain play/pause, lazy work)
  hooks/useScrollProgress.ts section scroll progress 0..1 → `--p` CSS variable (sticker cards)
  components/
    LandingNav.tsx
    HeroSection.tsx
    StickerCardsSection.tsx
    HowItWorksSection.tsx    Embla track + StepCard
    CareerFolderStack.tsx    sticky stack + FolderShape (inline SVG)
    FaqSection.tsx           Radix Accordion
    DownloadCtaSection.tsx
    LandingFooter.tsx
    decor/                   positioned decorative images (clouds, notebook, note corner, book, pencils)
src/routes/index.tsx         createFileRoute("/") with staticData.shellVariant = "none"
src/assets/landing/          optimised assets (see section 8)
```

Tests (Vitest + Testing Library, as the repo already does): copy/data shape tests for `landing.copy.ts`, FAQ single-open behaviour, nav link targets, `useInView` with a mocked IntersectionObserver, `useScrollProgress` maths with mocked `getBoundingClientRect`.

---

## 7. Responsive behaviour

The export is desktop-only (1440). The recording is also desktop. Approved breakpoints (build to these; no mobile design is coming first):

- **≥1280**: as designed. Content column 1064, folders 1360 with 80px alternation.
- **768 to 1279**: nav collapses to logo + `Get Started` + a menu button. Sticker cards become a 2 x 2 grid with no overlap, reveal stagger kept. How it works track stays draggable (that is where it shines). Folder stack keeps stacking; folders go full width with a 24px alternation; tab SVGs scale with width.
- **<768**: hero cards shrink and the cloud bands keep their aspect by cropping from the centre. Sticker cards stack vertically. Folders stack with a 120px step and the content row wraps (icon above text, button full width). FAQ goes single column. CTA card stacks text above the keychain graphic. Footer stacks.

---

## 8. Asset manifest

| Export file | What it is | Target name | Format |
|-------------|------------|-------------|--------|
| `Top Cloud.png` | Lavender front cloud, 5760 x 1624 | `hero-cloud-front.webp` | WebP, resize to 2880 wide (2x of 1440) |
| `Back Cloud.png` | Cream back cloud, 5756 x 1553 | `hero-cloud-back.webp` | WebP, 2880 wide |
| `graphic right.png` | Front profile card (Taiwo Mufidat-Prince) | `hero-card-1.webp` | WebP, ~1600 wide |
| `graphic right (1).png` | Middle card (Ethel Chidera) | `hero-card-2.webp` | WebP, ~1600 wide |
| `graphic right (2).png` | Back card (Taiwo Talaricp) | `hero-card-3.webp` | WebP, ~1600 wide |
| `Frame 2147226756.svg` | Pink briefcase squircle | `hero-icon-briefcase.svg` | SVG as-is |
| `Frame 2147226757.svg` | Green send squircle | `hero-icon-send.svg` | SVG as-is |
| `Illustration.png` / `(1)` / `(2)` / `(3)` | Sticker card illustrations: blue, purple, yellow, pink | `sticker-{blue,purple,yellow,pink}.webp` | WebP, ~800 wide |
| `image 37.png` | Green ruled note corner (content is only the top 1647px of a 4364px canvas) | `decor-note-corner.webp` | Trim transparent canvas, WebP |
| `Sticker.png` | Mint card with folded corner | `step-card.webp` or rebuild in CSS (`clip-path` + gradient) | WebP, 720 wide, or CSS |
| `Pin.png` | Green paperclip | `step-clip.webp` | WebP |
| `Vector 19` to `22.svg` | Folder tab shapes, 1360 x 507 | inline `<FolderShape variant>` component | inline SVG |
| `Frame.svg`, `Frame (2)`, `(3)`, `(4).svg` | Career icons: full stack, data analyst, product manager, UX researcher | `career-{fullstack,data,pm,ux}.svg` | SVG as-is |
| `8ab85d82….png` | 3D keychain (content 434 x 1084 of a 1122 x 1402 canvas) | `cta-keychain.webp` | Trim, WebP |
| `Vector 5.svg` | Pink wave path | `cta-wave.svg` | SVG as-is |
| `AppleLogo.svg`, `GooglePlayLogo.svg` | Button icons | same names | SVG as-is |
| `HU9hBZ….png` | Red elastic book (content 565 x 975 of 1140 x 2216) | `decor-book.webp` | Trim, WebP |
| `Frame 2147226733.png` | Silver pencils + pink paper corner (577 x 1273 of 794 x 1916) | `decor-pencils.webp` | Trim, WebP |
| `Group.svg` | Green logomark | `logo-mark-green.svg` | SVG as-is |
| `Group 11.png` | Spiral notebook + "J800" pen (content 1063 x 2282 of a 1623 x 3420 canvas) | `decor-notebook.webp` | Trim, WebP, ~1200 wide |
| `Borscha-{Medium,SemiBold,Bold}.ttf` | Heading font | `src/assets/fonts/` | as-is (convert to woff2 if size matters) |
| `NeueMontreal-{Regular,Medium}.otf` | Body font | `src/assets/fonts/` | as-is (convert to woff2 if size matters) |

**Still to produce in-repo**
1. White Pathway wordmark for the footer (derive from `public/brand-logo.svg`).
2. Social icons: Mingcute, confirmed.

**Why the tall transparent canvases**: `image 37.png`, `HU9hBZ….png`, `Frame 2147226733.png`, `Group 11.png` and the keychain were exported with the Figma frame's empty space around them. Trimming them cuts ~1.5 MB and lets us position the visible content directly.

### WebP conversion (answer to the side question)

Yes. There is no ImageMagick, cwebp or Python on this machine, but `sharp` (the Node image library) works here. A trial run over every PNG at quality 82 (alpha quality 90, no visible loss on these flat illustrations):

| | PNG | WebP |
|---|-----|------|
| All 15 PNGs | 4,749 KB | 1,044 KB |
| Largest single file (`image 37.png`) | 1,486 KB | 304 KB |

That is before trimming the empty canvases and before resizing the 5760px clouds, so the final payload will be smaller still. Proposed: a one-off `scripts/optimise-landing-assets.mjs` using `sharp` as a devDependency, so the pipeline is repeatable when design re-exports. Keep the PNG originals in `landing-page-assets/` out of the bundle (add the folder to `.gitignore` or move it to the design repo).

---

## 9. Accessibility and performance notes

- All decorative images get `alt=""` and `aria-hidden`; the hero profile cards too (names are not content).
- The draggable track must also be keyboard reachable: cards are not interactive, so no focus traps; Embla's container gets `role="region"` and an `aria-label`.
- Folder stack: sticky positioning does not interfere with reading order or screen readers.
- Accordion: Radix handles ARIA.
- `prefers-reduced-motion`: reveal animations resolve to the final state immediately; drag and accordion remain, their transitions shortened.
- Images below the hero are `loading="lazy"`; the two cloud bands and the front card are preloaded.
- Fonts: five static faces plus Sour Gummy. All `font-display: swap`; preload Borscha Bold and Neue Montreal Regular since they paint the hero.

---

## 10. Decisions (2026-10-23)

1. **Route behaviour**: signed-in users on `/` redirect to `/careers`. Yes.
2. **Hero entrance animation**: add it.
3. **Sticker cards**: scroll-driven, not time-based (spec in 3.2).
4. **Keychain**: subtle sway.
5. **Fonts**: headings Borscha, body Neue Montreal, handwritten Sour Gummy (fontsource). Files provided in `landing-page-assets/`.
6. **Folder stack**: uniform 157px steps.
7. **Assets and copy**: notebook + pen provided as `Group 11.png`; UX Researcher chips are Interviews / Usability / Analysis; FAQ answers 2 and 4 provided (section 1); social icons are Mingcute.
8. **Mobile**: build to the responsive rules in section 7.
9. **Dependencies**: `embla-carousel-react`, `@fontsource-variable/sour-gummy`, and `sharp` as a devDependency are approved.

---

## 11. Build order (single branch, single PR, one commit per step)

Branch `feat/landing-page` off `dev`, one PR into `dev`. Each step below is one commit, done and verified (typecheck, lint, tests) before the next starts.

1. **Foundations**: shell variant `"none"`, route swap with the signed-in redirect, colour tokens, the three font families, asset optimisation script and optimised assets in `src/assets/landing/`, `landing.copy.ts` with all copy and data.
2. **Nav + hero + footer**: static layout end to end so the page is navigable, including the hero entrance animation.
3. **Sticker cards + how it works**: `useScrollProgress` hook and scroll-scrubbed cards, Embla track with hover scale.
4. **Folder stack**: sticky stack, inline folder shapes, chips, icon tiles.
5. **FAQ + CTA**: Radix accordion, CTA card with keychain sway.
6. **Responsive pass + reduced motion + tests**.

---

## 12. Implementation notes (what differs from the spec above)

- **Signed-in redirect** (section 5): `beforeLoad` only does the synchronous auth check, so a cold backend never delays first paint. `LandingPage` finishes `ensureAuthHydrated()` in an effect and redirects to `/careers` once a session is known.
- **Sticker cards are pinned** (section 3.2, revised after review on 2026-10-24): from `xl` the section is `100svh + 1600px` tall and holds a sticky 100svh box with the heading and the card row. `useScrollProgress({ mode: "pinned" })` writes the section's progress and card *i* rises from below the viewport over `[0.04 + 0.22i, +0.2]`, so the screen stays fixed while the cards arrive one at a time, fully reversible, like the folder stack. Cards also get the 4% hover scale. Below `xl` they sit in a 2-column grid (1 column under `sm`) with no pinning.
- **Folder stack is pinned too** (section 3.4, revised after review): instead of sticky-in-flow folders, the stack is a `100svh + 2200px` container with a sticky 100svh box; folder 0 rests in place and folders 1 to 3 slide up from below the viewport over `[0.06 + 0.33(i-1), +0.25]`, with the gaps as pauses so each folder sits fully visible before the next moves. The step between folders is `clamp(80px, (100svh - 560px) / 3, 157px)` and each folder extends to the viewport bottom, so the content of every folder fits on short screens too. Folders keep the 80px alternation at any width (no max width) so a folder always covers the previous one's content. Below `md` the folders are static blocks in flow.
- **Folder shapes**: the tab strip is the export path's top 170 units drawn as an SVG that keeps its aspect ratio, so the tab scales with the folder width; the body is a plain div below it.
- **Edge decor** is anchored to the viewport edges (notebook and book at the left, note corner and pencils at the right) rather than to the page centre, so there is no gap on wide screens. The footer clips horizontally only, so the red book overlaps both the white area above and the green footer.
- **Headings** keep the export's line breaks as `\n` in `landing.copy.ts`, rendered with `whitespace-pre-line` from `sm`.
- **Mobile nav**: a disclosure menu (hamburger) below `md` with the four links and Log in; Get Started stays visible at every width.
- **CTA below lg**: the wave and keychain stack under the copy instead of being hidden.
- **Fonts**: Sour Gummy is imported via `@fontsource-variable/sour-gummy/wght.css` (latin + latin-ext). Borscha and Neue Montreal are served as the original ttf/otf files.
- **Tests**: the repo has no jest-dom, so component tests assert with `getByText` / `queryByText` null checks. Suite: copy shape, `scrollProgress` maths, `useInView` with a stubbed observer, FAQ single-open behaviour.
- **Verification**: desktop positions were measured against the export (nav, H1, section headings and the first step card all within 15px); scroll states and drag were exercised with headless Chrome at 1440, 1280, 1024, 768 and 390.
