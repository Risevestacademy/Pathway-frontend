export function getDaysLeft(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
}

export function formatDate(dateStr: string) {
  const dateObj = new Date(dateStr);

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
