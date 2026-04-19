/**
 * Week counter for the rafban header.
 *
 * Personal/cycle-based counter (not ISO week). Today (Sun 2026-04-19)
 * should fall in "semana 5" per the user, so week 1 starts the Monday
 * of 2026-03-16 → 2026-03-22.
 *
 * Adjust WEEK_START_ANCHOR to re-align the counter with a new cycle
 * (e.g. start of a new quarter, sprint, or year).
 */
const WEEK_START_ANCHOR = new Date(2026, 2, 16); // 2026-03-16 (Monday)

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getCurrentWeek(now: Date = new Date()): number {
  const anchor = startOfWeek(WEEK_START_ANCHOR);
  const current = startOfWeek(now);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.floor((current.getTime() - anchor.getTime()) / msPerWeek);
  return weeks + 1;
}
