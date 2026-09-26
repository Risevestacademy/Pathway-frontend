import { createFileRoute } from "@tanstack/react-router";
import Catalogue from "../../features/catalog/components/Catalogue";

export const Route = createFileRoute('/careers/')({
  component: Catalogue,
});