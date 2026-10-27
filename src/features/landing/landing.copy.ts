export type NavLink =
  | { label: string; to: "/explore"; comingSoon?: false }
  | { label: string; href: `#${string}`; comingSoon?: false }
  | { label: string; comingSoon: true };

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Explore", to: "/explore" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Opportunities", comingSoon: true },
  { label: "Mentors", comingSoon: true },
];

export const NAV_CTA = { login: "Log in", getStarted: "Get Started" } as const;

export const HERO = {
  /** Rendered as `headingLead` / `headingStart [briefcase] headingEnd [send]`. */
  headingLead: "Don't guess your",
  headingStart: "career.",
  headingEnd: "Map it.",
  subtitle:
    "Pathway helps students and graduates explore careers and plan their next steps.",
  explore: "Explore careers",
  getStarted: "Get started",
} as const;

export type StickerTone = "blue" | "purple" | "yellow" | "pink";

export interface StickerCard {
  id: StickerTone;
  copy: string;
}

/** "\n" marks the export's line breaks; render with `whitespace-pre-line`. */
export const STICKER_SECTION = {
  heading: "Choosing a career\nshouldn't feel like guessing.",
} as const;

export const STICKER_CARDS: readonly StickerCard[] = [
  { id: "blue", copy: "Curated set of careers, side by side, with no best or worst." },
  { id: "purple", copy: "A roadmap in the order you should learn it." },
  { id: "yellow", copy: "One resource per step, with a reason it's there." },
  { id: "pink", copy: "A plan built from your skills, studies and goals." },
];

export interface Step {
  id: string;
  title: string;
  body: string;
}

export const HOW_IT_WORKS = {
  anchor: "how-it-works",
  eyebrow: "How it works",
  heading: "From “I'm not\nsure” to your first step.",
} as const;

export const STEPS: readonly Step[] = [
  {
    id: "tell-us",
    title: "Tell us\nabout you",
    body: "Your studies, skills and interests. About 3 minutes, and you can finish later.",
  },
  {
    id: "see-fit",
    title: "See\nyour fit",
    body: "Know how many key skills you already have for a career, and what's left to learn.",
  },
  {
    id: "roadmap",
    title: "Follow\nyour roadmap",
    body: "Stages and steps in order, with courses and certificates picked for each one.",
  },
  {
    id: "take-action",
    title: "Take\naction",
    body: "Apply to internships, scholarships and more that match your pathway.",
  },
];

export type CareerTone = "peach" | "white" | "green" | "lavender";

export interface CareerFolder {
  id: "fullstack" | "data" | "ux" | "pm";
  tone: CareerTone;
  title: string;
  description: string;
  chips: readonly [string, string, string];
}

export const CAREERS_SECTION = {
  heading: "Explore careers,\nmapped end to end.",
  subtitle: "Career outlook, skills, roadmaps, and\nopportunities in one place.",
  cta: "Explore careers",
} as const;

export const CAREERS: readonly CareerFolder[] = [
  {
    id: "fullstack",
    tone: "peach",
    title: "Full Stack Developer",
    description: "Build complete web applications, front to back.",
    chips: ["Frontend", "Backend", "Databases"],
  },
  {
    id: "data",
    tone: "white",
    title: "Data Analyst",
    description: "Turn data into insights that guide decisions.",
    chips: ["SQL", "Visualisation", "Statistics"],
  },
  {
    id: "ux",
    tone: "green",
    title: "UX Researcher",
    description: "Understand users and uncover what they really need.",
    chips: ["Interviews", "Usability", "Analysis"],
  },
  {
    id: "pm",
    tone: "lavender",
    title: "Product Manager",
    description: "Guide products from idea to launch and beyond.",
    chips: ["Product Strategy", "Prioritisation", "Stakeholder Management"],
  },
];

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_SECTION = {
  eyebrow: "FAQs",
  heading: "Frequently asked questions",
  defaultOpen: "who",
} as const;

export const FAQS: readonly Faq[] = [
  {
    id: "who",
    question: "Who is Pathway for?",
    answer:
      "University students and graduates who want to see where careers are heading and how to get skilled for one.",
  },
  {
    id: "change-mind",
    question: "Can I change my mind?",
    answer:
      "Yes. Update your pathway any time, or switch careers. Your earlier progress stays saved.",
  },
  {
    id: "setup-time",
    question: "How long does setup take?",
    answer:
      "About 3 minutes. You can skip any question and finish later in your profile.",
  },
  {
    id: "get-job",
    question: "Will Pathway get me a job?",
    answer:
      "No one can promise that. We show you what to learn, in what order, and opportunities that match, so your next move is clearer.",
  },
];

export const DOWNLOAD_CTA = {
  heading: "Ready to see where you could go?",
  subtitle: "Compare careers and build a plan around your skills, studies, and goals.",
  ios: "Download iOS",
  android: "Download Android",
} as const;

export const FOOTER = {
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Careers", to: "/explore" },
    { label: "Help", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  socials: [
    { id: "instagram", label: "Pathway on Instagram", href: "#" },
    { id: "x", label: "Pathway on X", href: "#" },
    { id: "linkedin", label: "Pathway on LinkedIn", href: "#" },
  ],
} as const;
