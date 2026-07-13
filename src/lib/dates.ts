/** 本地時區的 "YYYY-MM-DD" */
export function dateKeyOf(ts: number | Date): string {
  const d = typeof ts === "number" ? new Date(ts) : ts;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKeyOf(new Date());
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const d = dateFromKey(key);
  d.setDate(d.getDate() + delta);
  return dateKeyOf(d);
}

/** 該週的週一 */
export function startOfWeekKey(key: string): string {
  const d = dateFromKey(key);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return dateKeyOf(d);
}

export function startOfMonthKey(key: string): string {
  return key.slice(0, 8) + "01";
}

export function daysInMonth(key: string): number {
  const d = dateFromKey(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/** 週檢視 X 軸標籤（週一起算） */
export function weekdayLabel(index: number): string {
  return WEEKDAYS[index];
}

export function formatMonthTitle(key: string): string {
  const d = dateFromKey(key);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

export function formatWeekTitle(weekStartKey: string): string {
  const start = dateFromKey(weekStartKey);
  const end = dateFromKey(addDays(weekStartKey, 6));
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

/** "HH:mm" → 當日對應的分鐘數 */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
