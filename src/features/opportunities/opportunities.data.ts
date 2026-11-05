import { BriefcaseBusiness, GraduationCap, Users } from "lucide-react";

import type { Opportunity } from "./opportunities.type";

export const opportunities: Opportunity[] = [
  {
    id: "frontend-internship",
    icon: BriefcaseBusiness,
    title: "Frontend Development Internship",
    organisation: "Pathway Labs",
    location: "London",
    workMode: "Hybrid",
    category: "Internship",
    pricing: "Free",
    description:
      "Build accessible web experiences with a supportive product and engineering team.",
    customMessage: "Matches step 5 of your pathway",
    status: "Open",
    deadline: "2026-11-10",
  },
  {
    id: "product-design-workshop",
    icon: GraduationCap,
    title: "Product Design Workshop",
    organisation: "Northstar Studio",
    location: "Online",
    deliveryMode: "Online",
    category: "Workshop",
    pricing: "Paid",
    description:
      "Learn practical research, prototyping, and design critique skills from working designers.",
    customMessage: "Fits Data Analyst",
    status: "Open",
    deadline: "2027-06-30",
  },
  {
    id: "community-mentoring-circle",
    icon: Users,
    title: "Career Mentoring Circle",
    organisation: "Future Makers Network",
    location: "Manchester",
    deliveryMode: "Hybrid",
    category: "Mentoring",
    pricing: "Free",
    description:
      "Meet peers and experienced professionals for monthly conversations about career growth.",
    customMessage: "Fits your pathway",
    status: "Closed",
    deadline: "2026-06-30",
  },
  {
    id: "product-design-workshop2",
    icon: GraduationCap,
    title: "Product Design Workshop",
    organisation: "Northstar Studio",
    location: "Online",
    deliveryMode: "Online",
    category: "Workshop",
    pricing: "Paid",
    description:
      "Learn practical research, prototyping, and design critique skills from working designers.",
    customMessage: "Open to all pathways",
    status: "Open",
    deadline: "2027-06-30",
  },
  {
    id: "community-mentoring-circle2",
    icon: Users,
    title: "Career Mentoring Circle",
    organisation: "Future Makers Network",
    location: "Manchester",
    deliveryMode: "Hybrid",
    category: "Mentoring",
    pricing: "Free",
    description:
      "Meet peers and experienced professionals for monthly conversations about career growth.",
    customMessage: "Fits Product Manager",
    status: "Open",
    deadline: "2026-11-11",
  },
];
