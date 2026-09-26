import type { PayPeriod } from "./careerDetail.types";
import type { Statistic } from "./careerDetail.types";
import { careers } from "./careerDetail.mock";

export function getCareerInfo(careerId: string) {
  return careers.find((c) => c.id === careerId);
}

export function groupByGeo(items: Statistic[]) {
  const byGeo = new Map<string, typeof items>();
  for (const item of items) {
    const list = byGeo.get(item.geography) ?? [];
    list.push(item);
    byGeo.set(item.geography, list);
  }
  return byGeo;
}

export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const payPeriodLabel: Record<PayPeriod, string> = {
  year: "per year",
  month: "per month",
  hour: "per hour",
};
