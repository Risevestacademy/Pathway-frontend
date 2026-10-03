export type ResourceKind =
  | "article"
  | "course"
  | "documentation"
  | "interactive"
  | "video"
  | "book"
  | "certification";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  kind: ResourceKind;
  url: string;
  costLabel?: string;
  certificationLabel?: string;
}
