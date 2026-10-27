/** Copy for the public explore page and career profile page. */

export const EXPLORE_HERO = {
  eyebrow: "Find your path",
  heading: "Explore careers\nbefore you commit",
  cta: "Explore careers",
  pills: { plan: "Plan", explore: "Explore" },
} as const;

export const EXPLORE_LIST = {
  anchor: "careers",
  searchLabel: "Search careers",
  searchPlaceholder: "Search a career...",
  filter: "Filter",
  fieldHeading: "Field",
  anyField: "Any field",
  levelsLabel: "Career stage",
  allLevels: "All",
  openPathway: "Open Pathway",
  emptyTitle: "No careers match",
  emptyBody: "Try a different search, career stage or field.",
  clearFilters: "Clear filters",
  errorTitle: "We couldn’t load careers",
  errorBody: "Something went wrong while loading the catalogue. Please try again.",
  retry: "Try again",
} as const;

export const PATHWAY_CTA = {
  heading: "Not sure which career fits you?",
  subtitle: "Share your skills and goals. We’ll suggest careers & how to reach them.",
  action: "Build my pathway",
} as const;

export const CAREER_PROFILE = {
  back: "All careers",
  start: "Start this pathway",
  roadmapSoon: "Roadmap coming soon",
  stats: { stages: "Stages", resources: "Resources", skills: "Skills" },
  role: "What the role involves",
  activities: "Example work activities",
  activityLabel: "Task",
  outlook: "Pay & Job outlook",
  growthLabel: "Projected 10-year employment growth",
  demandLabel: "Current hiring demand",
  payUnavailable: "Pay data isn’t available for this career yet.",
  growthUnavailable: "Employment projections aren’t available for this career yet.",
  skills: "Skills you will need",
  firstStep: "Your first step",
  roadmap: "Roadmap",
  education: "Typical education",
  notYet: "Not known yet",
  footnote: "Every figure shows its source and the date it was checked. When we do not have a figure, we say so.",
  notFoundTitle: "This career isn’t available",
  notFoundBody: "It may have been removed from the catalogue.",
  browse: "Browse careers",
  errorTitle: "We couldn’t load this career",
  errorBody: "Something went wrong while loading the career details. Please try again.",
} as const;
