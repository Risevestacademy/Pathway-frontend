import { careers } from "../../data/careers.mock";
import type { Career } from "../../types/career.types";

export async function fetchCareers(): Promise<{ data: Career[] }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: careers }), 800); // 800ms fake delay
  });
}
