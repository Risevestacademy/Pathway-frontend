import { careers } from "../../features/catalog/catalog.mock";
import type { Career } from "../../types/career.types";

export async function fetchCareers(): Promise<{ data: Career[] }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: careers }), 800); // 800ms fake delay
  });
}
