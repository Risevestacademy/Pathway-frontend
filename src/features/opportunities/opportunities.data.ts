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
    duration: "6 Months",
    whatToDo: [
      "Help plan and run interviews with real users.",
      "Turn research notes into clear findings the team can act on.",
      "Sketch and test early ideas with the product team.",
    ],
    whoIsItFor: [
      "Final year students and graduates from the last two years.",
      "Some design practice, such as a class project or a personal project.",
      "No paid experience needed.",
    ],
    howItFits: {
      desc: "This role builds on step 5 of your Product Designer pathway: Learning the basics of user research.",
      tags: ["User research", "Wireframing", "Teamwork"],
    },
    applyLink: "www.linktoapply.com",
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
    duration: "1 year",
    whatToDo: [
      "Help plan and run interviews with real users.",
      "Turn research notes into clear findings the team can act on.",
      "Sketch and test early ideas with the product team.",
    ],
    whoIsItFor: [
      "Final year students and graduates from the last two years.",
      "Some design practice, such as a class project or a personal project.",
      "No paid experience needed.",
    ],
    howItFits: {
      desc: "This role builds on step 5 of your Product Designer pathway: Learning the basics of user research.",
      tags: ["User research", "Teamwork"],
    },
    applyLink: "www.linktoapply.com",
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
    whatToDo: [
      "Help plan and run interviews with real users.",
      "Turn research notes into clear findings the team can act on.",
      "Sketch and test early ideas with the product team.",
    ],
    whoIsItFor: [
      "Final year students and graduates from the last two years.",
      "Some design practice, such as a class project or a personal project.",
      "No paid experience needed.",
    ],
    howItFits: {
      desc: "This role builds on step 5 of your Product Designer pathway: Learning the basics of user research.",
      tags: ["Wireframing", "Teamwork"],
    },
    applyLink: "www.linktoapply.com",
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
    duration: "12 Months",
    whatToDo: [
      "Help plan and run interviews with real users.",
      "Turn research notes into clear findings the team can act on.",
      "Sketch and test early ideas with the product team.",
    ],
    whoIsItFor: [
      "Final year students and graduates from the last two years.",
      "Some design practice, such as a class project or a personal project.",
      "No paid experience needed.",
    ],
    howItFits: {
      desc: "This role builds on step 5 of your Product Designer pathway: Learning the basics of user research.",
      tags: ["User research", "Wireframing"],
    },
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
    whatToDo: [
      "Help plan and run interviews with real users.",
      "Turn research notes into clear findings the team can act on.",
      "Sketch and test early ideas with the product team.",
    ],
    whoIsItFor: [
      "Final year students and graduates from the last two years.",
      "Some design practice, such as a class project or a personal project.",
      "No paid experience needed.",
    ],
    howItFits: {
      desc: "This role builds on step 5 of your Product Designer pathway: Learning the basics of user research.",
      tags: ["Teamwork"],
    },
  },
];
