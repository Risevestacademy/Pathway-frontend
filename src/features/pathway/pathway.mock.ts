import type { Roadmap, RoadmapCareer } from "./pathway.types";

/**
 * Deliberate edge cases:
 *  - ux-designer is retired, so its roadmap must not be reachable
 *  - product-manager is published but has no roadmap yet
 *  - fe-html has an estimate with assumptions, so it's shown
 *  - fe-css has an estimate without assumptions, so it's omitted
 *  - fe-js has no prerequisites, so that section is hidden
 *  - fe-react has a required prerequisite step
 */
export const mockCareers: RoadmapCareer[] = [
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    status: "published",
    roadmapId: "rm-frontend",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    status: "published",
    roadmapId: "rm-data-analyst",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    status: "published",
    roadmapId: null,
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    status: "retired",
    roadmapId: "rm-ux",
  },
];

export const mockRoadmaps: Roadmap[] = [
  {
    id: "rm-frontend",
    careerId: "frontend-developer",
    title: "Frontend Developer roadmap",
    steps: [
      {
        stepId: "fe-html",
        title: "HTML & accessibility foundations",
        learningObjective:
          "Structure a web page with semantic HTML that works with screen readers and keyboards.",
        prerequisites: [],
        expectedEvidence:
          "Build a single-page profile site that passes an automated accessibility check.",
        estimate: {
          hours: 20,
          assumptions: {
            priorKnowledge: "No prior coding experience",
            weeklyStudyHours: 5,
          },
        },
        resourceIds: ["r-mdn-html", "r-fcc-web", "r-a11y-video"],
      },
      {
        stepId: "fe-css",
        title: "Layout with modern CSS",
        learningObjective:
          "Lay out responsive pages with Flexbox and Grid that adapt from phone to desktop.",
        prerequisites: ["Comfortable writing semantic HTML"],
        expectedEvidence:
          "Recreate a provided landing-page design at three screen sizes.",
        estimate: { hours: 25, assumptions: null },
        resourceIds: ["r-css-course", "r-grid-game"],
      },
      {
        stepId: "fe-js",
        title: "JavaScript essentials",
        learningObjective:
          "Write JavaScript that responds to user input and fetches data from an API.",
        prerequisites: [],
        expectedEvidence:
          "Pass a scored quiz and build a small app that loads data from a public API.",
        estimate: {
          hours: 40,
          assumptions: {
            priorKnowledge: "Assumes no prior JavaScript knowledge",
            weeklyStudyHours: 6,
          },
        },
        resourceIds: ["r-js-info", "r-meta-cert"],
      },
      {
        stepId: "fe-react",
        title: "Building interfaces with React",
        learningObjective:
          "Compose an interactive interface from reusable React components with state.",
        prerequisites: [
          "JavaScript essentials: functions, arrays and async code",
        ],
        requiredPrerequisiteStepId: "fe-js",
        expectedEvidence:
          "Build a multi-screen React app with loading, empty and error states.",
        resourceIds: ["r-react-docs", "r-meta-cert"],
      },
      {
        stepId: "fe-portfolio",
        title: "Portfolio & job readiness",
        learningObjective:
          "Present your work so employers can quickly assess your skills.",
        prerequisites: ["At least two finished projects"],
        expectedEvidence:
          "Publish a portfolio site with three projects and case-study write-ups.",
        resourceIds: [],
      },
    ],
  },
  {
    id: "rm-data-analyst",
    careerId: "data-analyst",
    title: "Data Analyst roadmap",
    steps: [
      {
        stepId: "da-sheets",
        title: "Spreadsheets for analysis",
        learningObjective: "Clean, summarise and chart data in a spreadsheet.",
        prerequisites: [],
        expectedEvidence:
          "Produce a pivot-table summary of a provided dataset.",
        resourceIds: [],
      },
      {
        stepId: "da-sql",
        title: "SQL fundamentals",
        learningObjective:
          "Query and join relational data to answer business questions.",
        prerequisites: [],
        expectedEvidence:
          "Answer ten questions against a sample database with SQL.",
        estimate: { hours: 15, assumptions: { weeklyStudyHours: 5 } },
        resourceIds: [],
      },
    ],
  },
  {
    id: "rm-ux",
    careerId: "ux-designer",
    title: "UX Designer roadmap",
    steps: [
      {
        stepId: "ux-research",
        title: "User research basics",
        learningObjective: "Plan and run a small round of user interviews.",
        prerequisites: [],
        expectedEvidence: "Write up findings from five interviews.",
        resourceIds: [],
      },
    ],
  },
];
