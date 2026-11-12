export const FRONTEND = "11111111-1111-4111-8111-111111111111";
export const DATA = "22222222-2222-4222-8222-222222222222";
export const DESIGN = "33333333-3333-4333-8333-333333333333";

/** GET /careers/{id}, as the public API returns it. */
function detail({
  title,
  description,
  roleSummary = "",
  exampleActivities = [],
  skills,
  projection,
  topicCount,
}: {
  title: string;
  description: string;
  roleSummary?: string;
  exampleActivities?: string[];
  skills: { id: string; name: string }[];
  projection: ReturnType<typeof outlook> | [];
  topicCount: number;
}) {
  return {
    overview: {
      title,
      description,
      roleSummary,
      exampleActivities,
      imageUrl: null,
      skills: skills.map((skill) => ({ ...skill, importance: "REQUIRED" })),
      topicCount,
      resourceCount: 0,
    },
    projection,
    requirements: { courses: [], certifications: [] },
  };
}

function outlook(median: string, growth: string, demand: string) {
  const common = {
    sourceId: "src-bls",
    period: "2024",
    percentile25: null,
    percentile75: null,
    experienceLevel: null,
    baseYear: null,
    baseValue: null,
    projectedYear: null,
    projectedValue: null,
  };
  return [
    {
      ...common,
      id: "o1",
      type: "SALARY",
      geography: "United States",
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
      type: "EMPLOYMENT_GROWTH",
      geography: "United States",
      median: null,
      currency: null,
      payPeriod: null,
      grossOrNet: null,
      growthPercent: growth,
      demandLevel: demand,
    },
  ];
}

const cards = [
  { id: FRONTEND, slug: "frontend-developer", title: "Frontend Developer", description: "Builds what people see." },
  { id: DATA, slug: "data-analyst", title: "Data Analyst", description: "Finds answers in data." },
  { id: DESIGN, slug: "product-designer", title: "Product Designer", description: "Shapes how products feel." },
];

export const details = {
  [FRONTEND]: detail({
    ...cards[0],
    roleSummary: "Turns designs into interfaces.",
    exampleActivities: ["Build components"],
    skills: [
      { id: "s1", name: "JavaScript" },
      { id: "s2", name: "Git" },
      { id: "s3", name: "CSS" },
    ],
    projection: outlook("92750", "8", "HIGH"),
    topicCount: 12,
  }),
  [DATA]: detail({
    ...cards[1],
    roleSummary: "Turns numbers into decisions.",
    skills: [
      { id: "s4", name: "SQL" },
      { id: "s5", name: "git" },
    ],
    projection: outlook("78000", "11", "MEDIUM"),
    topicCount: 0,
  }),
  [DESIGN]: detail({
    ...cards[2],
    skills: [{ id: "s6", name: "Figma" }],
    projection: [],
    topicCount: 0,
  }),
};

export function detailFor(id: string) {
  return details[id as keyof typeof details];
}

/** GET /careers items, as the public API returns them. */
export const list = cards.map((card) => ({
  ...card,
  iconKey: null,
  targetLevels: ["STUDENT"],
  topicCount: detailFor(card.id).overview.topicCount,
  resourceCount: 0,
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
