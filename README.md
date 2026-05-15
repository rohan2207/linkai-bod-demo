# LinkAI — Board update (Next.js)

Scroll-driven storytelling for the LinkAI mortgage technology platform. Deploy on [Vercel](https://vercel.com).

## Commands

```bash
npm install
npm run dev
npm run build
```

## Optional screenshots

Place PNGs in `public/assets/` (see `lib/flywheelData.ts` for filenames):

- `pendo-dashboard.png`
- `figma-design.png`
- `cursor-code.png`
- `test-coverage.png`
- `release-velocity.png`
- `mcp-docs.png`

If a file is missing, a glass-style placeholder appears automatically.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger (pinned flywheel story)
- Framer Motion (outro logo)
- Chart.js + react-chartjs-2

`prefers-reduced-motion`: flywheel uses a linear, non-pinned layout; outro skips the logo flight.
