import type React from "react";

export type FlywheelMetric = {
  value: string;
  label: string;
  tone: "purple" | "pink" | "amber" | "green";
};

export type FlywheelHumanAiSide = {
  /** Short header e.g. "Product Manager" or "Claude + MCP + Pendo". */
  label: string;
  /** One-line tagline that anchors the side ("Owns the question that matters"). */
  tagline: string;
  /** 3 short outcomes with optional icon name (lucide-react) for visual treatment. */
  items: { icon?: string; text: string }[];
  /** Optional accent color override (hex). Defaults: human=amber, ai=purple. */
  accent?: string;
};

export type FlywheelHumanAi = {
  human: FlywheelHumanAiSide;
  ai: FlywheelHumanAiSide;
  /** Optional split percentage (0-100) for AI side. If omitted no split bar is shown. */
  aiPercent?: number;
};

export type FlywheelFrame = {
  /** Path under /public - used when showing a screenshot. Mutually exclusive with component. */
  src?: string;
  /** React content rendered inside the frame chrome. Takes priority over src. */
  component?: React.ReactNode;
  /** Short bold headline displayed while this frame is active */
  headline: string;
  /** One sentence caption below the headline */
  caption: string;
  /** Optional timestamp label (e.g. "00:07 – 00:11") */
  timestamp?: string;
};

export type FlywheelStep = {
  id: string;
  label: string;
  color: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** Punchy single-sentence headline used in compact slide mode. */
  tagline?: string;
  /** Short bulleted cues for compact slide mode (3-5 items, ~5 words each). */
  bullets?: string[];
  personaRole: string;
  personaName: string;
  personaLine: string;
  metrics: FlywheelMetric[];
  tools: string[];
  browserUrl: string;
  assetPath: string;
  placeholderLabel: string;
  chart?: "pr" | "tests" | "deploy" | "none";
  legend?: { type: "dot" | "line" | "dash"; color: string; text: string }[];
  docChain?: string[];
  /** Optional per-spoke "Human · AI" split shown inside the docked story panel. */
  humanAi?: FlywheelHumanAi;
  /** Scroll-driven frames that play one by one while the step is active. */
  frames?: FlywheelFrame[];
  /** How many extra scroll-weight units to give this step (default 1). */
  scrollWeight?: number;
};

/** Scroll journey - line → wheel bridge copy (editable) */
export const JOURNEY_MORPH_CUE = "The line bends into a loop.";
export const JOURNEY_AFTER_LINE =
  "Small iterations. Tight feedback. The same six motions - now continuous - so ideas ship as production, not as a quarterly bet.";
/** Shown once the flywheel stage is primary (post–“Before”) */
export const JOURNEY_AFTER_EYEBROW = "After";
export const JOURNEY_ADOPTION_LINE =
  "One platform. Six motions in parallel. This is how we’re adopting AI and shipping every week.";

export const BRAND = {
  pm: "#623EDD",
  pp: "#D551C9",
  pa: "#F7B334",
  pg: "#4ADE80",
  nb: "#0c0916",
  ow: "#f0ecff",
} as const;

export const HERO_COPY = {
  eyebrow: "Mortgage Technology · Q1 2026 Update",
  headlinePrefix: "We are building",
  headlineEmphasis: "Age of AI.",
  headlineSuffix: "Everything is faster now.",
  body:
    "The pace of advancement is no longer linear. Mortgage is a high-scrutiny industry with enormous opportunity - and the right tools let the same team move faster, do more, and compress the vendor footprint that has historically slowed us down.",
} as const;

export const STORY_PIVOT_COPY = {
  eyebrow: "This Quarter's Story",
  quote:
    "The last two updates led with what LinkAI can do. This quarter, we're shifting the story to how LinkAI has transformed the way we build.",
  body:
    "A development cycle that used to crawl in a straight line now turns as a flywheel. Faster iterations. Constant monitoring. Every stage augmented with AI.",
  flyThroughPhrase: "how LinkAI has transformed the way we build",
} as const;

export const STORY_FLY_THROUGH_WORDS = STORY_PIVOT_COPY.flyThroughPhrase.split(" ");

export const OPPORTUNITY_COPY = {
  eyebrow: "The Opportunity",
  titleLead: "Technology now advances at the speed of intelligence.",
  pillars: [
    "AI compresses the distance between idea and execution. The same team now produces meaningfully more - without adding headcount or budget.",
    "Mortgage is ripe for disruption. Complex workflows, high scrutiny, and a fragmented vendor landscape create enormous opportunity for teams who can move faster and consolidate smarter.",
    "LinkAI and AI together are helping us compress that vendor footprint - replacing legacy desktop tools with a scalable, modern platform built for how our people actually work.",
  ],
} as const;

export const OUTRO_COPY = {
  eyebrow: "The mortgage platform that thinks ahead",
  statement: ["We are not catching up", "to the future.", "We are building it."],
  footer: "Mortgage Technology · Q1 2026 · Board of Directors",
} as const;

export const STORY_SCENE_VH = {
  hero: 140,
  flywheel: 580,
  proof: 140,
  outro: 100,
} as const;

export const STORY_SCENE_ORDER = ["hero", "flywheel", "proof", "outro"] as const;
export type StorySceneId = (typeof STORY_SCENE_ORDER)[number];

export const FLYWHEEL_STEPS: FlywheelStep[] = [
  {
    id: "discover",
    label: "Discover",
    color: "#9B6DFF",
    eyebrow: "01 · Discover",
    title: "For the first time,\nwe can see how people\nactually use the product.",
    lead:
      "Moving from Encompass to a web-based platform unlocked something we never had before: user analytics. Pendo now shows us exactly where employees spend time, what they skip, what's working, and what's ready to be retired. Claude connects to all our data sources through MCP - surfacing patterns across usage, support trends, and business data to drive smarter product decisions.",
    tagline: "We finally see how the product is used.",
    bullets: [
      "Pendo: real-time employee behavior",
      "MCP joins usage, support & business data",
      "Evidence-led prioritization",
      "Insight to decision in minutes",
    ],
    personaRole: "Person in the loop",
    personaName: "Product Manager",
    personaLine:
      "Uses Pendo for ground truth on behavior, then Claude + MCP to connect usage with support and business signals - so prioritization is evidence-led, not opinion-led.",
    metrics: [
      { value: "Real-time", label: "Usage visibility - impossible in Encompass", tone: "purple" },
      { value: "Minutes", label: "Insight to decision", tone: "amber" },
    ],
    tools: ["Pendo", "Claude + MCP", "Databricks"],
    browserUrl: "app.pendo.io · LinkAI · Paths & Funnels",
    assetPath: "/assets/pendo-dashboard.png",
    placeholderLabel: "Pendo paths, heatmaps, or screen capture",
    chart: "none",
    scrollWeight: 3,
    frames: [
      {
        src: "/assets/discover-pendo-full.png",
        headline: "Pendo: 1,588 session replays",
        caption: "We can see every path, every hesitation, every drop-off - in real time.",
        timestamp: "00:07 – 00:18",
      },
      {
        src: "/assets/discover-pendo-zoom.png",
        headline: "Low engagement detected",
        caption: "10% active time on the payment step. The data flags it before a PM does.",
        timestamp: "00:18 – 00:26",
      },
      {
        src: "/assets/discover-claude-mcp.png",
        headline: "Claude + MCP connects the dots",
        caption: "Usage, support tickets, and business data - analysed together in seconds.",
        timestamp: "00:26 – 00:34",
      },
      {
        src: "/assets/discover-insights.png",
        headline: "Pendo → Claude MCP → Jira",
        caption: "Behavior signals flow straight into AI analysis and land as actionable tickets. End-to-end, no handoff.",
        timestamp: "00:51 – 00:56",
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    color: "#D551C9",
    eyebrow: "02 · Design",
    title: "From intent\nto interface - faster.",
    lead:
      "The design process is fundamentally cleaner. Ideas start as rough concepts in Claude, which lets the business iterate quickly without waiting on formal designs. Those concepts move into high-fidelity screens in Figma Make, and the handoff to the engineering team is simpler - because AI can read and build from the design directly. Storybook integration is in progress, which will close the loop further.",
    tagline: "Intent to interface - without the deck.",
    bullets: [
      "Claude: rapid concept exploration",
      "Figma Make: lo-fi → hi-fi in hours",
      "Engineers build straight from the design",
      "Storybook integration in progress",
    ],
    personaRole: "Person in the loop",
    personaName: "Product Designer",
    personaLine:
      "Pairs with Claude for fast exploration, then ships intent through Figma Make - so engineering receives something closer to buildable truth, not a deck of metaphors.",
    metrics: [
      { value: "Lo-fi → Hi-fi", label: "Faster iteration cycles", tone: "pink" },
      { value: "Cleaner", label: "Engineering handoff", tone: "purple" },
    ],
    tools: ["Claude", "Figma Make", "Storybook (in progress)"],
    browserUrl: "figma.com/make · LinkAI · Prototype frame",
    assetPath: "/assets/figma-design.png",
    placeholderLabel: "Figma Make frame or prototype capture",
    chart: "none",
    scrollWeight: 1,
  },
  {
    id: "build",
    label: "Build",
    color: "#C4405E",
    eyebrow: "03 · Build",
    title: "Engineers building\nat a fundamentally\ndifferent pace.",
    lead:
      "AI writes the repetitive parts of the code, understands the existing codebase, and helps engineers focus on what actually requires human judgment. The result: more features, more reliably, in less time. Changes are smaller and more frequent - which means less risk with every release.",
    tagline: "Engineers ship judgment, not boilerplate.",
    bullets: [
      "10× more releases vs early 2023",
      "Smaller diffs, lower release risk",
      "AI handles repetition + navigation",
      "Humans own architecture & review",
    ],
    personaRole: "Person in the loop",
    personaName: "Software Engineer",
    personaLine:
      "Uses Cursor and Claude Code as a force multiplier - boilerplate and navigation yield to judgment calls, reviews, and architecture. Velocity rises without lowering the bar on ownership.",
    metrics: [
      { value: "10×", label: "More releases vs. early 2023", tone: "purple" },
      { value: "Smaller", label: "Each change - lower risk", tone: "amber" },
      { value: "More", label: "Value per engineer", tone: "pink" },
    ],
    tools: ["Cursor", "Claude Code"],
    browserUrl: "cursor.sh · LinkAI · Agent session",
    assetPath: "/assets/cursor-code.png",
    placeholderLabel: "Cursor composer / agent trace or PR summary",
    chart: "none",
    scrollWeight: 2,
    /** frames injected at render time by FlywheelStepPanel via BUILD_FRAMES */
  },
  {
    id: "validate",
    label: "Validate",
    color: "#F7674A",
    eyebrow: "04 · Validate",
    title: "Quality keeping pace\nwith velocity.",
    lead:
      "Historically, moving faster meant taking on more risk. AI changes that equation. As the team ships more, automated testing grows in lockstep - so every release is more verified than the last. Six months ago we had minimal automated test coverage. Today it's grown nearly 8×.",
    tagline: "Validation grows with shipping speed.",
    bullets: [
      "8× more automated checks in 6 months",
      "+690% coverage Nov → May",
      "2,600+ checks on every release",
      "AI authors and maintains tests",
    ],
    personaRole: "Person in the loop",
    personaName: "QA Engineer",
    personaLine:
      "Directs coverage where risk is highest; AI accelerates authoring and maintenance of tests so validation scales with shipping frequency - not after it.",
    metrics: [
      { value: "8×", label: "More automated validation in 6 months", tone: "green" },
      { value: "2,600+", label: "Automated checks on every release", tone: "amber" },
      { value: "+690%", label: "Coverage growth Nov → May", tone: "pink" },
    ],
    tools: ["AI-generated test coverage", "Claude"],
    browserUrl: "ci.goodleap.com · test run · main",
    assetPath: "/assets/test-coverage.png",
    placeholderLabel: "CI pipeline, test report, or coverage dashboard",
    chart: "none",
    scrollWeight: 2,
    /** frames injected at render time by FlywheelStepPanel via getValidateFrames() */
  },
  {
    id: "deliver",
    label: "Deliver",
    color: "#F7A834",
    eyebrow: "05 · Deliver",
    title: "New capabilities\nreaching employees\nin days, not quarters.",
    lead:
      "The time between a decision and a working feature in employees' hands has dropped from months to days. In the past 13 months the team has released to production over 120 times. What once took a full release cycle now ships in a fraction of the time - and the pace is accelerating.",
    tagline: "Decision to delivered - in days.",
    bullets: [
      "121 production releases in 13 months",
      "↓ 95% release cycle vs 2 years ago",
      "Smaller, safer, more frequent",
      "Continuous delivery as default",
    ],
    personaRole: "Person in the loop",
    personaName: "SRE / Release",
    personaLine:
      "Owns safe continuous delivery - smaller batches, observable pipelines, fast rollback. AI doesn't replace ops judgment; it removes toil so judgment shows up earlier.",
    metrics: [
      { value: "121", label: "Production releases in 13 months", tone: "purple" },
      { value: "Days", label: "Avg time from decision to delivered", tone: "amber" },
      { value: "↓ 95%", label: "Release cycle time vs. 2 years ago", tone: "green" },
    ],
    tools: ["Continuous delivery"],
    browserUrl: "deploy.goodleap.com · production · timeline",
    assetPath: "/assets/release-velocity.png",
    placeholderLabel: "Deploy pipeline, release train, or lead-time capture",
    chart: "deploy",
    legend: [
      { type: "dot", color: "rgba(98,62,221,.75)", text: "Releases per period" },
      { type: "line", color: "#F7B334", text: "Days from commit to live" },
      { type: "dash", color: "rgba(209,193,255,.25)", text: "Overall avg" },
    ],
  },
  {
    id: "document",
    label: "Document",
    color: "#4ADE80",
    eyebrow: "06 · Document & Accelerate",
    title: "Better docs make\nthe AI smarter.",
    lead:
      "Claude and MCP continuously improve documentation as we build. That documentation feeds back into AI - enabling story creation, technical scoping, test generation, RCA and more. More context means AI can do more, making every next cycle faster.",
    tagline: "Better docs make the AI smarter.",
    bullets: [
      "MCP grounds every AI surface",
      "Docs feed back into the loop",
      "More context = more capability",
      "Every cycle starts faster than the last",
    ],
    personaRole: "Person in the loop",
    personaName: "Tech Lead + PM",
    personaLine:
      "Curates the knowledge layer the org runs on - ADRs, runbooks, and product context - so every AI surface (MCP, code agents, analysis) starts from a grounded source of truth.",
    metrics: [
      { value: "∞", label: "Compounding loop", tone: "purple" },
      { value: "More", label: "AI capability per cycle", tone: "amber" },
    ],
    tools: ["Claude", "MCP", "Claude Code"],
    browserUrl: "claude.ai · MCP · internal knowledge graph",
    assetPath: "/assets/mcp-docs.png",
    placeholderLabel: "Doc refresh diff, MCP tools, or knowledge base",
    chart: "none",
    docChain: [
      "Identify problems",
      "Create stories",
      "Refine specs",
      "Tech solutions",
      "Gen test cases",
      "Execute testing",
    ],
  },
];

/** Chart datasets (from original board deck) */
export const CHART_PR = {
  labels: [
    "Q4'22",
    "Q1'23",
    "Q2'23",
    "Q3'23",
    "Q4'23",
    "Q1'24",
    "Q2'24",
    "Q3'24",
    "Q4'24",
    "Q1'25",
    "Q2'25",
    "Q3'25",
    "Q4'25",
    "Jan'26",
    "Feb'26",
    "Mar'26",
    "Apr'26",
    "May'26",
  ],
  bars: [2, 1, 3, 1, 1, 2, 4, 3, 2, 2, 2, 2, 3, 6, 10, 20, 17, 10],
  lines: [500, 500, 3000, 2700, 4000, 2000, 4000, 5000, 4000, 1200, 900, 4000, 3500, 1100, 1100, 1100, 1100, 1000],
};

export const CHART_TESTS = {
  labels: ["Unit", "Acceptance", "Integration", "Other"],
  nov2025: [21, 0, 0, 7],
  may2026: [129, 43, 6, 57],
};

export const CHART_DEPLOY = {
  labels: ["Q2'24", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Oct'25", "Nov'25", "Dec'25", "Jan'26", "Feb'26", "Mar'26", "Apr'26", "May'26"],
  deploys: [14, 12, 12, 13, 14, 15, 6, 5, 4, 4, 9, 7, 9, 7],
  leadDays: [17, 12, 10, 10, 8, 8, 7, 6, 6, 12, 2, 2, 1, 1],
};

/** Validate - grouped bar: test counts by category, Nov 2025 vs May 2026 */
export const CHART_TESTS_BY_CATEGORY = {
  labels: ["Unit", "Acceptance", "Integration", "E2E", "Other"],
  nov2025: [21, 0, 3, 2, 7],
  may2026: [128, 43, 6, 2, 57],
};

/** Validate - donut: test type breakdown (May 2026) */
export const CHART_TESTS_DONUT = {
  labels: ["Unit", "Acceptance", "Integration", "Other", "E2E"],
  values: [54, 18, 3, 24, 1],
  colors: ["#9B6DFF", "#F7B334", "#4ADE80", "rgba(209,193,255,0.45)", "#D551C9"],
};

/** Validate - horizontal bar: test cases + assertions Nov vs May */
export const CHART_TESTS_HORIZONTAL = {
  labels: ["Test cases", "Assertions"],
  nov2025: [71, 145],
  may2026: [2600, 4200],
  growth: ["+3,562%", "+2,797%"],
};

/**
 * Build - DORA lead-time stacked bar.
 * Bands: Elite (<1d) | High (1d-1w) | Medium (1w-1mo) | Low (>1mo)
 * Labels: Jun 2025 → May 2026 (12 months)
 */
export const CHART_BUILD_DORA = {
  labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
  low:    [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  medium: [4, 3, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0],
  high:   [5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1],
  elite:  [1, 1, 2, 3, 4, 4, 5, 6, 7, 9, 11, 6],
  stats: {
    meanLeadTime: "4.3 days",
    totalDeploys: "121",
    recentTrend: "Elite",
  },
};

/**
 * Build - scatter: PRs/week vs avg lines changed.
 * historical = 2022-2025 (purple) | recent = 2026 (orange)
 */
export const CHART_BUILD_SCATTER = {
  historical: [
    { x: 1,  y: 4800 }, { x: 1,  y: 7200 }, { x: 1,  y: 9000 },
    { x: 2,  y: 6800 }, { x: 2,  y: 7800 }, { x: 2,  y: 5200 },
    { x: 2,  y: 8200 }, { x: 3,  y: 3200 }, { x: 3,  y: 4400 },
    { x: 3,  y: 6000 }, { x: 4,  y: 2800 }, { x: 4,  y: 3600 },
    { x: 4,  y: 2200 }, { x: 5,  y: 2400 }, { x: 5,  y: 3000 },
    { x: 0,  y: 500  }, { x: 1,  y: 1800 }, { x: 2,  y: 1200 },
  ],
  recent: [
    { x: 10, y: 1100 }, { x: 11, y: 900  }, { x: 12, y: 800  },
    { x: 13, y: 700  }, { x: 14, y: 1000 }, { x: 15, y: 950  },
    { x: 16, y: 800  }, { x: 17, y: 750  }, { x: 18, y: 850  },
    { x: 19, y: 700  }, { x: 20, y: 900  }, { x: 20, y: 1100 },
    { x: 21, y: 800  }, { x: 22, y: 1050 },
  ],
  stats: [
    { label: "Release velocity", value: "~12", sub: "PRs/week avg (vs ~1–2 in 2023–24)", accent: true },
    { label: "Avg diff size (2026)", value: "~1k lines", sub: "Down from 4–7k spikes", accent: false },
    { label: "Production deploys", value: "121", sub: "2,945 commits shipped", accent: false },
    { label: "Change lead time", value: "4.3 days", sub: 'DORA "High" band average', accent: true },
  ],
};

export const OLD_WAY_STAGES = [
  { label: "Ideation", time: "1–2 wks", title: "Ideation", text: "Spreadsheets of ideas. Weeks of meetings. The right ones often surfaced late, after sunk cost was already real." },
  { label: "Requirements", time: "2 wks", title: "Requirements", text: "PMs ran user research by hand. Patterns took weeks to surface. Specs were stale before they were complete." },
  { label: "Design", time: "2–3 wks", title: "Design", text: "Two or three iterations per feature. Mockups and decks. Engineering received intent - not working components." },
  { label: "Build", time: "3–4 wks", title: "Build", text: "Engineers wrote boilerplate. Legacy comprehension took weeks. Every specialist became a bottleneck." },
  { label: "Test", time: "1–2 wks", title: "Test", text: "QA caught bugs days after merge. Each fix waited for the next release window. Quality vs. speed - a constant trade." },
  { label: "Launch", time: "bi-weekly", title: "Launch", text: "Bi-weekly release trains. Code finished today reached users in two weeks. By then, the team had already moved on." },
];
