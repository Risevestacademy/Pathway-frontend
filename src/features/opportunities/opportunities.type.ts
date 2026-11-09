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
