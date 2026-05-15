# LinkAI Board of Directors Demo -- Optimization Prompt

## Context for the Agent

You are optimizing a scrolling one-page presentation website for GoodLeap's Board of Directors. The site lives at `https://linkai-bod-demo.vercel.app/` and is a Next.js/Vercel deployment. The audience is a BoD audience -- non-technical executives who need to feel the momentum of what the mortgage technology team has built. The site is already deployed and the story arc is strong. What needs fixing is the motion layer, the typographic clarity, and one killer stat that anchors the whole narrative.

---

## 1. THE CORE PROBLEM: JANK

The site currently feels jumpy. Transitions pop in instead of flowing. Scroll-triggered elements snap rather than ease. The overall experience lacks the polish of a presentation-grade scrolling site. This is the #1 priority.

### Animation Philosophy (from Emil Kowalski / animations.dev)

Apply these rules globally across every animated element:

- **Never animate for more than 300ms for UI transitions.** If it takes longer, it's a loading screen, not a transition.
- **Default to ease-out for entrances.** Elements arriving should decelerate naturally, like a car pulling into a parking spot. CSS: `cubic-bezier(0.16, 1, 0.3, 1)` or use spring physics.
- **Use ease-in for exits.** Elements leaving should accelerate away.
- **Never use linear easing for UI.** Linear is for progress bars and looping backgrounds only.
- **Prefer spring physics for organic motion.** Springs have natural overshoot and settle. In Framer Motion: `type: "spring", stiffness: 100, damping: 20`. In CSS, approximate with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Fade + rise for content appearing:** `opacity: 0, y: 8` to `opacity: 1, y: 0`. The classic, for a reason. Keep the y-offset small (8-12px max) -- large offsets feel sloppy.
- **Stagger children, don't mount everything at once.** Use `staggerChildren: 0.06` (Framer Motion) or `animation-delay: calc(var(--index) * 80ms)` in CSS.
- **Never animate layout properties** (`top`, `left`, `width`, `height`). Animate exclusively via `transform` and `opacity` for GPU acceleration.
- **Test on low-end devices.** What feels smooth on an M3 Mac becomes a slideshow on a mid-range phone.

### Scroll Animation Strategy

Use **Intersection Observer** (or Framer Motion's `whileInView`) for scroll-triggered reveals. Do NOT use scroll-linked animations that tie CSS properties directly to scroll position unless absolutely necessary (parallax backgrounds only). Scroll-linked animations jank on most devices.

For each section entering the viewport:

```
initial: { opacity: 0, y: 12 }
whileInView: { opacity: 1, y: 0 }
transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
viewport: { once: true, amount: 0.3 }
```

Set `once: true` so animations only play the first time. Board members will scroll slowly and deliberately -- they should never see content "re-animate" if they scroll back up.

### Specific Jank Fixes

1. **Hero section ("We are building in the Age of AI")**: This should fade in on load with staggered word reveals, not pop. Use a 200ms stagger per word group. The scroll-down indicator should pulse gently with an infinite `ease-in-out` animation, not bounce.

2. **"Before" linear process section**: The six phase cards (Ideation, Requirements, Design, Build, Test, Launch) should cascade in from left to right with a stagger, not all appear at once. Each card: `opacity: 0, x: -16` to `opacity: 1, x: 0`, stagger 100ms.

3. **"After" flywheel section**: The circular layout should NOT spin or animate on scroll. It should fade in as a whole, then the individual nodes (Discover, Design, Build, Validate, Deliver, Document) should pulse/highlight sequentially with a subtle scale `1.0 to 1.05` and glow, one at a time, on a 3-second loop. This communicates "continuous motion" without making anything janky.

4. **Section transitions** (the "The line bends into a loop" interstitial): Use a slow cross-fade between sections. The outgoing section should `opacity: 1 to 0` over 400ms while the incoming section does `opacity: 0 to 1` with a 200ms delay. No abrupt cuts.

5. **Numbered deep-dive cards (01 Discover through 06 Document)**: Stagger in with the standard fade+rise pattern. The "AI-augmented" badge on each should have a subtle shimmer animation (a horizontal light sweep across the text, CSS-only, infinite, 3s duration).

6. **Stat counters ("8x", "+690%", etc.)**: Use `countUp.js` or a simple requestAnimationFrame counter that animates from 0 to the target number over 1.2 seconds with an ease-out curve. Numbers should only start counting when the element enters the viewport.

7. **Charts (Throughput trend, Validation growth, Delivery lead time)**: Bars/lines should draw in from left to right or grow upward. Use CSS `clip-path` animations or SVG stroke-dasharray for line charts. Duration: 800ms, ease-out.

---

## 2. TYPOGRAPHY & VISUAL CLARITY

### The Font Problem

Vercel's rendering can make fonts look thin or washed out, especially on non-Retina displays. The current issue: the six legacy phase names (Ideation, Requirements, Design, Build, Test, Launch) in the "Before" section are hard to read.

### Font Rules

- **Headline font**: Montserrat (proxy for Roc Grotesk). Import weights 500, 600, 700, 800.
- **Body font**: Nunito (proxy for Sofia Pro). Import weights 400, 500, 600, 700.
- **Import**: `https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap`

### Size Hierarchy (minimum sizes -- these are floors, not targets)

| Element | Min Size | Weight | Notes |
|---------|----------|--------|-------|
| Hero headline | 56px desktop / 32px mobile | 700-800 | Montserrat. The "We are building in the Age of AI" line. |
| Section titles | 40px desktop / 28px mobile | 600-700 | Montserrat. "From idea to user", "For the first time...", etc. |
| Card titles / Phase names | 20px desktop / 16px mobile | 700 | Montserrat. The six phase names MUST be this size minimum. |
| Body / descriptions | 18px desktop / 16px mobile | 400-500 | Nunito. |
| Captions / labels | 14px desktop / 12px mobile | 600 | Nunito. "AI-augmented", "Person in the loop", etc. |
| Stat values | 64px desktop / 40px mobile | 800 | Montserrat. "8x", "+690%", etc. Giant and unmissable. |
| Stat labels | 16px desktop / 14px mobile | 500 | Nunito. Below the stat values. |

### Specific Typography Fixes

1. **"Before" section phase names** (Ideation, Requirements, Design, Build, Test, Launch): Boost to `20px`, `font-weight: 700`, `letter-spacing: 0.02em`. White text on the dark background. Add a subtle text-shadow: `0 1px 2px rgba(0,0,0,0.3)` for legibility.

2. **Phase duration labels** ("1-2 wks", "2 wks", "2-3 wks", etc.): These should be `14px`, `font-weight: 600`, color `#D1C1FF` (lilac). Currently they may be too small or low-contrast.

3. **"After" flywheel node labels** (Discover, Design, Build, Validate, Deliver, Document): Same treatment as phase names: `20px`, `font-weight: 700`, white.

4. **Section numbers** ("01", "02", ... "06"): These should be `14px`, `font-weight: 800`, `letter-spacing: 0.15em`, color `#FF8300` (orange). Monospaced or tabular numerals.

5. **The "AI-augmented" badges**: `12px`, `font-weight: 700`, `letter-spacing: 0.1em`, `text-transform: uppercase`, color `#FF8300` on a `rgba(255,131,0,0.12)` pill background.

6. **Italic emphasis words** ("idea", "user" in "From idea to user"): Use Montserrat italic. Make sure the italic variant is imported. The contrast between roman and italic should be the only emphasis -- don't also change color or size.

### Color Reference (GoodLeap Brand)

```css
:root {
  --gl-orange: #FF8300;
  --gl-yellow: #F7B334;
  --gl-white: #FFFFFF;
  --gl-warm-white: #FFFEFC;
  --gl-passion: #200F51;       /* Primary dark background */
  --gl-grape: #472BA4;         /* Secondary purple */
  --gl-lilac: #D1C1FF;         /* Light purple accent text */
  --gl-blush: #EDE6FF;         /* Very light purple */
  --gl-warm-black: #14140F;    /* Body text on light backgrounds */
  --gl-warm-asphalt: #2C2B27;  /* Dark text alternative */
}

/* Signature background gradient */
--gl-bg-gradient: radial-gradient(ellipse at top right, #6B1800 0%, #3A0D5C 25%, #200F51 60%, #0A0620 100%);
```

### Visual Clarity Audit Checklist

Parse through every section and ask: "Does this text NEED to be readable, or is it atmospheric?" Apply this framework:

**Must be crystal clear (boost size/weight/contrast):**
- Hero headline
- Section titles and subtitles
- Phase names in before/after comparison
- Stat values and their labels
- The closing tagline ("We are not catching up to the future. We are building it.")
- Any text that carries the narrative arc

**Can be subtle/atmospheric (smaller, lower contrast is fine):**
- "Board of Directors - Q1 2026" header
- "Scroll" indicator
- Tool/technology labels (Pendo, Claude, Databricks pills)
- "Person in the loop" caption
- Image alt-text or decorative labels

---

## 3. THE KILLER STAT -- THE "15 MINUTES TO 30 SECONDS" MOMENT

The October 2025 QBR deck had a signature moment: **"15 minutes to 30 seconds"** -- the time reduction for a credit pull workflow in LinkAI vs Encompass. That single stat told the whole Phase 1 story in one breath. This Q1 2026 deck needs an equivalent.

### Candidates (pick the strongest, surface it as the hero stat):

**Option A: "6 handoffs to zero."**
The "Before" shows a 6-stage linear waterfall. The "After" is a continuous flywheel. The stat: "6 handoffs to zero" or "6 stages, now parallel." This is about development process, which may not resonate with a board audience the same way.

**Option B: "One platform replaces seven vendors."**
If LinkAI is consolidating vendor tools (Encompass, credit vendors, property data, AVM, etc.) into a single platform, the vendor consolidation number is powerful for a board. Boards care about vendor spend, complexity, and risk.

**Option C: "Weekly releases. Up from quarterly."**
The DORA/velocity data from the Build section. If the team went from quarterly releases to weekly, that's a 12x improvement in shipping cadence. "52 releases a year. Up from 4." or "From quarterly bets to weekly shipping."

**Option D: "Same team. 10x more releases."**
Emphasizes no headcount increase while output multiplied. Boards love efficiency stories.

**Option E: "[X] minutes saved per loan."**
If there's a per-loan time savings metric (like the original 15-min-to-30-sec story), that's always the strongest because it directly maps to LO productivity and unit economics.

### Recommendation

The strongest board-level stat follows this formula: **[Old painful number] to [New impressive number]**. "15 minutes to 30 seconds" worked because it was visceral and specific. For Q1 2026:

- If you have a per-loan metric: use it. "X minutes to Y seconds per loan" is unbeatable.
- If not: **"Same team. 10x the output."** or **"52 releases. Up from 4."** are the next best because they directly address the board's question of "are we getting more from what we already have?"

### How to Surface It

The hero stat should appear:
1. **Once, huge, unmissable** -- as its own full-viewport section between the "Before/After" comparison and the deep-dive sections. White text on the dark gradient background. The number in `#FF8300` (orange), minimum 96px. The context line ("Same team. Up from quarterly.") in `#D1C1FF` (lilac), 24px.
2. **Again in the closing section** as a callback -- smaller, in the final "We are building it" stanza, reinforcing the message.

### Visual Treatment for the Hero Stat

```
[Full viewport, dark gradient background]

                    52
              releases a year.
              
              Up from 4.
              
    ── Same team. No new headcount. ──
```

The number "52" (or whatever the stat is) should count up from 0 when it enters the viewport. The supporting text fades in 400ms after the counter finishes. The horizontal rules fade in last.

---

## 4. GLOBAL CSS / PERFORMANCE NOTES

### Smooth Scroll

Add to the root:
```css
html {
  scroll-behavior: smooth;
}
```

But do NOT rely on `scroll-behavior: smooth` for animation smoothness -- that's for anchor-link navigation only. All section reveals should use Intersection Observer / Framer Motion.

### GPU Acceleration

Add `will-change: transform, opacity` to any element that will animate, but remove it after the animation completes (or use `transform: translateZ(0)` as a permanent hint). Do not blanket-apply `will-change` to everything.

### Font Loading

Use `font-display: swap` (already included in the Google Fonts URL). Add a `preconnect` hint:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

### Reduced Motion

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### No Em Dashes

Per project style: replace all em dashes in copy with regular dashes or rewrite the sentence. No `--` or `---` rendered as em dashes anywhere in the output.

---

## 5. SECTION-BY-SECTION SCROLL CHOREOGRAPHY

Here's the exact scroll sequence a board member should experience:

### Scene 1: Hero (viewport 1)
- Page loads. 400ms pause (let the gradient background render).
- "Board of Directors - Q1 2026" fades in (200ms, ease-out).
- 200ms pause.
- "We are building in the Age of AI." types or fades in word-by-word (stagger 60ms per word, ease-out).
- "Everything is faster now." fades in 300ms after the headline completes. Color: `#FF8300`.
- Scroll indicator pulses at the bottom.

### Scene 2: Before (the linear process)
- "This Quarter's Story" label fades in.
- Section title "From idea to user. One stage at a time." fades in.
- The six phase cards cascade in left-to-right, stagger 120ms.
- Duration labels appear with each card (same stagger).
- Hold for reading time.

### Scene 3: Transition moment
- "The line bends into a loop" text cross-fades in.
- Optional: a subtle SVG animation of a straight line curving into a circle (pure CSS/SVG, 1.5s, ease-in-out).

### Scene 4: After (the flywheel)
- Flywheel diagram fades in as a whole.
- Individual nodes highlight sequentially (pulsing glow, 500ms each, looping).
- "One platform. Six motions in parallel." fades in below.

### Scene 5: Hero Stat (full viewport)
- The killer number counts up from 0 (1.2s, ease-out).
- Supporting text fades in 400ms after.
- Horizontal rule fades in 200ms after that.

### Scene 6-11: Deep Dives (01 Discover through 06 Document)
- Each section: number fades in first, then title, then body, then supporting visual.
- Standard fade+rise, stagger 80ms between elements.
- Screenshots/images fade in with a subtle scale `0.97 to 1.0` for a "lifting" feel.

### Scene 12: Opportunity
- The three numbered points (01, 02, 03) stagger in.
- Throughput/Validation/Delivery charts draw in when they enter the viewport.

### Scene 13: Closing
- "We are not catching up to the future." fades in.
- 400ms pause.
- "We are building it." fades in, color `#FF8300`, slightly larger.
- The hero stat appears again (smaller) as a quiet reinforcement.

---

## 6. ANTI-SLOP CHECKLIST

Before shipping, verify none of these common AI-generated patterns made it in:

- [ ] No neon glows or `box-shadow` with saturated colors
- [ ] No gradient text (unless it's the signature GoodLeap orange-to-lilac gradient on a specific callout)
- [ ] No `#000000` pure black anywhere -- use `#14140F` or `#0A0620`
- [ ] No Inter, Roboto, Arial, or system fonts
- [ ] No 3-column equal-width card grids (vary the layout)
- [ ] No generic placeholder images or fake data
- [ ] No emoji in any text content
- [ ] No animations longer than 1 second (except the hero stat counter and the flywheel loop)
- [ ] No `ease-in` on entrance animations
- [ ] No `linear` easing on any UI animation
- [ ] No scroll-jacking (hijacking native scroll behavior)
- [ ] All text passes WCAG AA contrast on its background
- [ ] No em dashes in any copy

---

## Summary

Three priorities, in order:
1. **Smooth the motion.** Replace all pop-in/snap animations with eased, staggered, once-only scroll reveals. Every transition should feel like a slow exhale, not a jump scare.
2. **Boost typographic clarity.** The six legacy phase names and all section titles need to be bigger, bolder, higher contrast. Follow the size hierarchy table above.
3. **Find and surface the killer stat.** One number that tells the whole Q1 story the way "15 minutes to 30 seconds" told Phase 1. Make it unmissable.
