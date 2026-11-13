/** The signed-in home screen. Sections are added one at a time. */
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
      <h1 className="font-display text-4xl font-medium text-ink">Dashboard</h1>
    </div>
  );
}
