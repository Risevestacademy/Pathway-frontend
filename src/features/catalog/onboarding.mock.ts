import type { OnboardingOption } from "./catalog.types";

export const FIELD_OF_STUDY_OPTIONS: OnboardingOption[] = [
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "BUSINESS", label: "Business" },
  { value: "ECONOMICS", label: "Economics" },
  { value: "HEALTH_SCIENCES", label: "Health Sciences" },
  { value: "LAW", label: "Law" },
  { value: "ARTS_HUMANITIES", label: "Arts and Humanities" },
  { value: "SOCIAL_SCIENCES", label: "Social Sciences" },
  { value: "NATURAL_SCIENCES", label: "Natural Sciences" },
  { value: "OTHER", label: "Other" },
];

export const JOB_TYPE_OPTIONS: OnboardingOption[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
];

export const GOAL_OPTIONS: OnboardingOption[] = [
  { value: "FIRST_JOB", label: "Land my first job" },
  { value: "SWITCH_CAREER", label: "Switch careers" },
  { value: "GET_PROMOTED", label: "Get promoted" },
  { value: "BUILD_PORTFOLIO", label: "Build a portfolio" },
  { value: "LEARN_SKILLS", label: "Learn new skills" },
];

export const TIME_COMMITMENT_OPTIONS: OnboardingOption[] = [
  { value: "UNDER_5", label: "Under 5 hours a week" },
  { value: "FIVE_TO_TEN", label: "5 to 10 hours a week" },
  { value: "TEN_TO_TWENTY", label: "10 to 20 hours a week" },
  { value: "TWENTY_PLUS", label: "20+ hours a week" },
];

export const SKILL_CHIP_OPTIONS: OnboardingOption[] = [
  { value: "CREATIVE_THINKING", label: "Creative thinking" },
  { value: "ATTENTION_TO_DETAIL", label: "Attention to detail" },
  { value: "VISUAL_STORYTELLING", label: "Visual storytelling" },
  { value: "PROBLEM_SOLVING", label: "Problem-solving" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "TIME_MANAGEMENT", label: "Time management" },
  { value: "CSS", label: "CSS" },
  { value: "HTML", label: "HTML" },
  { value: "ADAPTABILITY", label: "Adaptability" },
  { value: "JAVASCRIPT", label: "JavaScript" },
];