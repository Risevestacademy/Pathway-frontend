import {
  BriefcaseBusiness,
  UserRoundGroup,
  GraduationCap,
  Computer,
  Globe,
} from "lucide-react";
import { type OpportunityType } from "../opportunities.type";

export default function OpportunityIcon({
  type,
  className,
}: {
  type: OpportunityType;
  className: string;
}) {
  if (type === "INTERNSHIP" || type === "JOB")
    return <BriefcaseBusiness className={className} />;
  if (type === "FELLOWSHIP" || type === "PROGRAMME")
    return <UserRoundGroup className={className} />;
  if (type === "HACKATHON") return <Computer className={className} />;
  if (type === "SCHOLARSHIP") return <GraduationCap className={className} />;
  if (type === "PROGRAMME") return <Globe className={className} />;
}
