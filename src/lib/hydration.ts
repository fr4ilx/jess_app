/**
 * Hydration store — localStorage-backed, keyed per day.
 * Falls back to 0 oz if nothing logged yet today.
 *
 * TODO: persist to Supabase once the water_logs table exists.
 */

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `pandawell:water:${y}-${m}-${day}`;
};

export function getWaterToday(): number {
  if (typeof localStorage === "undefined") return 0;
  const raw = localStorage.getItem(todayKey());
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function setWaterToday(oz: number) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(todayKey(), String(Math.max(0, Math.round(oz))));
  // Notify listeners (e.g. open Progress page) so the UI refreshes
  window.dispatchEvent(new CustomEvent("pandawell:water-changed"));
}

export function addWaterToday(deltaOz: number): number {
  const next = Math.max(0, getWaterToday() + deltaOz);
  setWaterToday(next);
  return next;
}
