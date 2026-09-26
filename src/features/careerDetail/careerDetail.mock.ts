import type { Career } from "./careerDetail.types";

/**
 * ILLUSTRATIVE content for reference designs only. Figures are placeholders
 * shaped like real sourced data — they are not real statistics.
 *
 * Deliberate edge cases (each one exercises a spec rule):
 *  - frontend-developer: full data, two geographies, a source-provided projection series
 *  - data-analyst: several values missing → "Unavailable" states; salary band without median
 *  - ux-researcher: no roadmap linked yet
 *  - cloud-support-engineer: status "draft" → must never render
 *  - flash-developer: status "retired" → must never render
 */
export const careers: Career[] = [
  {
    id: "frontend-developer",
    status: "published",
    title: "Frontend Developer",
    description:
      "Builds the parts of websites and apps people see and interact with.",
    levels: ["university-student", "recent-graduate", "early-career"],
    tags: [
      "javascript",
      "frontend development",
      "web",
      "design",
      "react",
      "html",
      "css",
    ],
    roleSummary:
      "Frontend developers turn designs into fast, accessible interfaces that run in the browser. They work closely with designers and backend engineers, write and test UI code, and make sure products work well across devices and for everyone who uses them.",
    workActivities: [
      "Build reusable interface components from design files",
      "Connect screens to APIs and handle loading and error states",
      "Fix layout and performance issues across browsers and devices",
      "Review teammates’ code and write automated tests",
      "Improve accessibility so products work with assistive technology",
    ],
    entryConsiderations: [
      {
        label: "Typical education",
        detail:
          "Degree in computing or a related field is common but not required; many enter through bootcamps or self-study with a portfolio.",
      },
      {
        label: "Key skills",
        detail:
          "HTML, CSS, JavaScript, a UI framework such as React, version control with Git.",
      },
      {
        label: "Certifications",
        detail:
          "Rarely required. A strong project portfolio usually matters more.",
      },
    ],
    roadmapId: "rm-frontend",
    stats: [
      {
        kind: "salary-median",
        id: "s1",
        value: 92750,
        currency: "USD",
        payPeriod: "year",
        basis: "gross",
        source: "U.S. Bureau of Labor Statistics",
        period: "May 2024",
        geography: "United States",
        meaning: "Median annual salary, all experience levels",
      },
      {
        kind: "salary-range",
        id: "s2",
        currency: "USD",
        payPeriod: "year",
        basis: "gross",
        low: { label: "25th percentile", value: 68400 },
        high: { label: "75th percentile", value: 124100 },
        source: "U.S. Bureau of Labor Statistics",
        period: "May 2024",
        geography: "United States",
        meaning: "Middle 50% of annual salaries",
      },
      {
        kind: "salary-median",
        id: "s3",
        value: 450000,
        currency: "NGN",
        payPeriod: "month",
        basis: "unspecified",
        experienceLevel: "entry-level",
        source: "Rise Academy Salary Survey",
        period: "Q2 2025",
        geography: "Lagos, Nigeria",
        meaning: "Median monthly salary, entry-level roles",
      },
      {
        kind: "employment-projection",
        id: "o1",
        value: 8,
        series: [
          { label: "2023", value: 208 },
          { label: "2033 (projected)", value: 225 },
        ],
        seriesUnit: "jobs (thousands)",
        source: "U.S. Bureau of Labor Statistics",
        period: "2023–2033",
        geography: "United States",
        meaning: "Projected 10-year employment growth",
      },
      {
        kind: "demand",
        id: "o2",
        value: "High",
        source: "LinkedIn Economic Graph",
        period: "Jan 2025",
        geography: "Lagos, Nigeria",
        meaning: "Current hiring demand",
      },
    ],
  },
  {
    id: "data-analyst",
    status: "published",
    title: "Data Analyst",
    description: "Finds patterns in data to help teams make better decisions.",
    levels: ["university-student", "recent-graduate"],
    tags: ["python", "sql", "data science", "excel", "statistics", "analytics"],
    roleSummary:
      "Data analysts collect, clean and interpret data, then communicate what it means. They build reports and dashboards, answer business questions with evidence, and help teams track whether decisions are working.",
    workActivities: [
      "Write SQL queries to pull and combine data",
      "Clean messy datasets and document assumptions",
      "Build dashboards that teams check every week",
      "Present findings to non-technical stakeholders",
    ],
    entryConsiderations: [
      {
        label: "Typical education",
        detail:
          "Degree in a quantitative field such as economics, statistics, maths or computing.",
      },
      {
        label: "Key skills",
        detail:
          "SQL, spreadsheets, a BI tool, basic statistics; Python or R is a plus.",
      },
      {
        label: "Certifications",
        detail:
          "Vendor certificates (e.g. Google Data Analytics) can help early-career candidates stand out.",
      },
    ],
    roadmapId: "rm-data-analyst",
    stats: [
      {
        kind: "salary-median",
        id: "s1",
        value: null,
        currency: "USD",
        payPeriod: "year",
        basis: "gross",
        source: "U.S. Bureau of Labor Statistics",
        period: "May 2024",
        geography: "United States",
        meaning: "Median annual salary, all experience levels",
      },
      {
        kind: "salary-range",
        id: "s2",
        currency: "NGN",
        payPeriod: "month",
        basis: "unspecified",
        low: { label: "25th percentile", value: 280000 },
        high: { label: "75th percentile", value: null },
        source: "Rise Academy Salary Survey",
        period: "Q2 2025",
        geography: "Lagos, Nigeria",
        meaning: "Middle 50% of monthly salaries",
      },
      {
        kind: "employment-projection",
        id: "o1",
        value: null,
        source: "U.S. Bureau of Labor Statistics",
        period: "2023–2033",
        geography: "United States",
        meaning: "Projected 10-year employment growth",
      },
      {
        kind: "demand",
        id: "o2",
        value: "Very high",
        source: "LinkedIn Economic Graph",
        period: "Jan 2025",
        geography: "Lagos, Nigeria",
        meaning: "Current hiring demand",
      },
    ],
  },
  {
    id: "ux-researcher",
    status: "published",
    title: "UX Researcher",
    description:
      "Studies how people use products so teams build the right thing.",
    levels: ["recent-graduate", "early-career"],
    tags: [
      "design",
      "research",
      "psychology",
      "product management",
      "interviews",
    ],
    roleSummary:
      "UX researchers plan and run studies — interviews, usability tests, surveys — to understand people’s needs and behaviour, then turn what they learn into clear recommendations for design and product teams.",
    workActivities: [
      "Plan research studies and recruit participants",
      "Run interviews and usability sessions",
      "Synthesise findings into insights and recommendations",
    ],
    entryConsiderations: [
      {
        label: "Typical education",
        detail:
          "Backgrounds vary: psychology, HCI, design, anthropology and more.",
      },
      {
        label: "Key skills",
        detail:
          "Interviewing, study design, synthesis, clear writing and presenting.",
      },
    ],
    roadmapId: null,
    stats: [
      {
        kind: "salary-median",
        id: "s1",
        value: 101200,
        currency: "USD",
        payPeriod: "year",
        basis: "gross",
        source: "Glassdoor",
        period: "Mar 2025",
        geography: "United States",
        meaning: "Median annual base salary, all experience levels",
      },
      {
        kind: "demand",
        id: "o1",
        value: "Moderate",
        source: "LinkedIn Economic Graph",
        period: "Jan 2025",
        geography: "United States",
        meaning: "Current hiring demand",
      },
    ],
  },
  {
    id: "product-manager",
    status: "published",
    title: "Associate Product Manager",
    description: "Decides what a product team builds next and why.",
    levels: ["recent-graduate", "early-career"],
    tags: ["product management", "strategy", "communication", "analytics"],
    roleSummary:
      "Associate product managers help define problems worth solving, prioritise work, and coordinate designers and engineers to ship.",
    workActivities: [
      "Write product requirements",
      "Prioritise a backlog",
      "Talk to customers",
      "Track launch metrics",
    ],
    entryConsiderations: [
      {
        label: "Typical education",
        detail: "Any degree; APM programmes often hire graduates directly.",
      },
    ],
    roadmapId: null,
    stats: [],
  },
  {
    id: "backend-developer",
    status: "published",
    title: "Backend Developer",
    description:
      "Builds the servers, APIs and databases that power applications.",
    levels: ["recent-graduate", "early-career"],
    tags: [
      "python",
      "javascript",
      "java",
      "databases",
      "apis",
      "backend development",
    ],
    roleSummary:
      "Backend developers design and run the services, data stores and APIs behind apps.",
    workActivities: ["Design APIs", "Model data", "Monitor production systems"],
    entryConsiderations: [
      {
        label: "Key skills",
        detail: "A server language, SQL, HTTP fundamentals.",
      },
    ],
    roadmapId: null,
    stats: [],
  },
  {
    id: "digital-marketer",
    status: "published",
    title: "Digital Marketing Specialist",
    description: "Grows audiences through search, social, email and content.",
    levels: ["university-student", "recent-graduate"],
    tags: [
      "marketing",
      "content",
      "social media",
      "analytics",
      "communication",
    ],
    roleSummary:
      "Digital marketers plan and run campaigns across online channels and measure what works.",
    workActivities: [
      "Plan campaigns",
      "Write content",
      "Analyse channel performance",
    ],
    entryConsiderations: [
      {
        label: "Typical education",
        detail:
          "Marketing, communications or any degree with a portfolio of campaigns.",
      },
    ],
    roadmapId: null,
    stats: [],
  },
  {
    id: "qa-engineer",
    status: "published",
    title: "QA Engineer",
    description:
      "Makes sure software works as expected before it reaches users.",
    levels: ["university-student", "recent-graduate", "early-career"],
    tags: ["testing", "javascript", "python", "automation"],
    roleSummary:
      "QA engineers design test plans, automate checks and help teams ship with confidence.",
    workActivities: [
      "Write test cases",
      "Automate regression suites",
      "Report and triage bugs",
    ],
    entryConsiderations: [
      {
        label: "Key skills",
        detail: "Attention to detail, a scripting language, test tooling.",
      },
    ],
    roadmapId: null,
    stats: [],
  },
  // ── Must never render ──
  {
    id: "cloud-support-engineer",
    status: "draft",
    title: "Cloud Support Engineer (DRAFT — should not render)",
    description: "Draft content.",
    levels: ["recent-graduate"],
    tags: [],
    roleSummary: "",
    workActivities: [],
    entryConsiderations: [],
    roadmapId: null,
    stats: [],
  },
  {
    id: "flash-developer",
    status: "retired",
    title: "Flash Developer (RETIRED — should not render)",
    description: "Retired content.",
    levels: ["early-career"],
    tags: [],
    roleSummary: "",
    workActivities: [],
    entryConsiderations: [],
    roadmapId: "rm-retired",
    stats: [],
  },
];
