export const FRONTEND = "11111111-1111-4111-8111-111111111111";
export const DATA = "22222222-2222-4222-8222-222222222222";
export const DESIGN = "33333333-3333-4333-8333-333333333333";

const base = {
  slug: "x",
  roleSummary: "",
  exampleActivities: [] as string[],
  typicalEducationNote: "",
  certificationsNote: "",
  targetLevels: ["STUDENT"],
  status: "PUBLISHED",
  publishedAt: null,
  updatedAt: "2026-01-01",
};

function outlook(median: string, growth: string, demand: string) {
  const common = {
    sourceUrl: null,
    period: "2024",
    percentile25: null,
    percentile75: null,
    experienceLevel: null,
    baseYear: null,
    baseValue: null,
    projectedYear: null,
    projectedValue: null,
    updatedAt: "2026-01-01",
  };
  return [
    {
      ...common,
      id: "o1",
      type: "SALARY",
      geography: "United States",
      source: "BLS",
      median,
      currency: "USD",
      payPeriod: "year",
      grossOrNet: "GROSS",
      growthPercent: null,
      demandLevel: null,
    },
    {
      ...common,
      id: "o2",
      type: "OUTLOOK",
      geography: "United States",
      source: "BLS",
      median: null,
      currency: null,
      payPeriod: null,
      grossOrNet: null,
      growthPercent: growth,
      demandLevel: demand,
    },
  ];
}

export const details = {
  [FRONTEND]: {
    ...base,
    id: FRONTEND,
    title: "Frontend Developer",
    description: "Builds what people see.",
    roleSummary: "Turns designs into interfaces.",
    exampleActivities: ["Build components"],
    field: { name: "Software", slug: "software" },
    skills: [
      { id: "s1", name: "JavaScript" },
      { id: "s2", name: "Git" },
      { id: "s3", name: "CSS" },
    ],
    outlook: outlook("92750", "8", "HIGH"),
    pathway: { id: "p1", title: "Frontend", stepCount: 12 },
  },
  [DATA]: {
    ...base,
    id: DATA,
    title: "Data Analyst",
    description: "Finds answers in data.",
    roleSummary: "Turns numbers into decisions.",
    field: { name: "Data", slug: "data" },
    skills: [
      { id: "s4", name: "SQL" },
      { id: "s5", name: "git" },
    ],
    outlook: outlook("78000", "11", "MEDIUM"),
    pathway: null,
  },
  [DESIGN]: {
    ...base,
    id: DESIGN,
    title: "Product Designer",
    description: "Shapes how products feel.",
    field: { name: "Design", slug: "design" },
    skills: [{ id: "s6", name: "Figma" }],
    outlook: [],
    pathway: null,
  },
} as const;

export function detailFor(id: string) {
  return details[id as keyof typeof details];
}

export const list = Object.values(details).map((d) => ({
  id: d.id,
  slug: d.slug,
  title: d.title,
  shortDescription: d.description,
}));

export const pathways: Record<string, unknown> = {
  [FRONTEND]: {
    pathway: {
      id: "p1",
      careerId: FRONTEND,
      title: "Frontend",
      description: "",
      steps: [
        { id: "st2", order: 2, title: "CSS basics", resources: [] },
        { id: "st1", order: 1, title: "How the web works", resources: [] },
      ],
    },
  },
};