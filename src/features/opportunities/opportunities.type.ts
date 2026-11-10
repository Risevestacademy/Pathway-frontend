export type WorkMode = "Onsite" | "Hybrid" | "Remote";

export type DeliveryMode = "In-Person" | "Online" | "Hybrid";

export interface Requirement {
  name: string;
  level: "high" | "medium" | "low";
}

export interface Opportunity {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  organisation: string;
  location: string;
  workMode?: WorkMode;
  deliveryMode?: DeliveryMode;
  category: string;
  pricing?: "Free" | "Paid";
  description: string;
  customMessage: string;
  status: "Open" | "Closed";
  deadline?: string;
  duration?: string;
  whatToDo: string[];
  whoIsItFor: string[];
  howItFits: {
    desc: string;
    tags: string[];
  };
  requirements: Requirement[];
  applyLink?: string;
}

export type OpportunityType =
  | "INTERNSHIP"
  | "JOB"
  | "FELLOWSHIP"
  | "HACKATHON"
  | "SCHOLARSHIP"
  | "PROGRAMME";

export interface FetchOpportunitiesParams {
  type?: OpportunityType;
  careerId?: string;
  excludeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OpportunitySummary {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  location: string;
  status: "VERIFIED" | "CLOSED";
  deadline: string;
  summary: string;
  workMode?: string;
  deliveryMode?: string;
  customMessage?: string;
}
