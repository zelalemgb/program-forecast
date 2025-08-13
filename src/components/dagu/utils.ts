export function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export function getLastCompletedMonths(n: number): string[] {
  const now = new Date();
  // move to previous month (completed)
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setMonth(start.getMonth() - 1);
  const keys: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export function parseISODate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
