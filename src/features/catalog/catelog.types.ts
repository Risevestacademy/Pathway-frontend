import type { CareerLevel } from "@/types/career.types";

export interface SessionProfile {
  level: CareerLevel | null;
  education: { degree: string; field: string };
  experience: { years: string; internships: string };
  skills: string[];
  interest: string | null;
}
