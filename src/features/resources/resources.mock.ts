import type { Resource } from "./resources.types";

export const mockResources: Resource[] = [
  {
    id: "r-mdn-html",
    title: "HTML basics",
    provider: "MDN Web Docs · Article",
    kind: "documentation",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
  },
  {
    id: "r-fcc-web",
    title: "Responsive Web Design",
    provider: "freeCodeCamp · Interactive",
    kind: "course",
    url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    costLabel: "Course: free",
    certificationLabel: "Certification: free",
  },
  {
    id: "r-a11y-video",
    title: "Accessibility fundamentals",
    provider: "W3C Web Accessibility Initiative · Video",
    kind: "video",
    url: "https://www.w3.org/WAI/videos/standards-and-benefits/",
  },
  {
    id: "r-css-course",
    title: "Learn CSS",
    provider: "web.dev · Course",
    kind: "course",
    url: "https://web.dev/learn/css",
  },
  {
    id: "r-grid-game",
    title: "Grid Garden",
    provider: "Codepip · Interactive",
    kind: "course",
    url: "https://cssgridgarden.com/",
  },
  {
    id: "r-js-info",
    title: "JavaScript Guide",
    provider: "MDN Web Docs · Documentation",
    kind: "documentation",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  },
  {
    id: "r-meta-cert",
    title: "Introduction to Front-End Development",
    provider: "Meta · Course",
    kind: "course",
    url: "https://www.coursera.org/learn/introduction-to-front-end-development",
  },
  {
    id: "r-react-docs",
    title: "React Learn",
    provider: "React · Documentation",
    kind: "documentation",
    url: "https://react.dev/learn",
  },
];
