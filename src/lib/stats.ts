import type { DrinkLog } from "@/types";
import { addDays, startOfWeekKey, startOfMonthKey, daysInMonth, todayKey } from "./dates";

/** dateKey → 當日有效攝取量（effectiveMl 加總） */
export function buildDailyTotals(logs: DrinkLog[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    totals.set(log.dateKey, (totals.get(log.dateKey) ?? 0) + log.effectiveMl);
  }
  return totals;
}

/**
 * 目前連續達標天數。今日已達標則含今日；
 * 今日未達標不中斷（一天還沒結束），從昨天往回數。
 */
export function currentStreak(
  totals: Map<string, number>,
  goalMl: number
): number {
  const today = todayKey();
  let streak = 0;
  let key = today;
  if ((totals.get(today) ?? 0) >= goalMl) {
    streak = 1;
  }
  key = addDays(today, -1);
  for (let i = 0; i < 3660; i++) {
    if ((totals.get(key) ?? 0) >= goalMl) {
      streak++;
      key = addDays(key, -1);
    } else {
      break;
    }
  }
  return streak;
}

/** 歷史最佳連續達標天數 */
export function bestStreak(
  totals: Map<string, number>,
  goalMl: number
): number {
  const achieved = [...totals.entries()]
    .filter(([, v]) => v >= goalMl)
    .map(([k]) => k)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of achieved) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

/**
 * 近 N 天（含今日）的平均達成率 0–1，單日以 100% 為上限。
 * 只計入「有記錄的第一天」之後的日子，避免剛開始使用時被大量 0 拉低。
 */
export function averageAchievement(
  totals: Map<string, number>,
  goalMl: number,
  days: number
): number | null {
  if (totals.size === 0 || goalMl <= 0) return null;
  const firstDay = [...totals.keys()].sort()[0];
  const today = todayKey();
  let sum = 0;
  let counted = 0;
  for (let i = 0; i < days; i++) {
    const key = addDays(today, -i);
    if (key < firstDay) break;
    sum += Math.min(1, (totals.get(key) ?? 0) / goalMl);
    counted++;
  }
  return counted === 0 ? null : sum / counted;
}

export interface SeriesPoint {
  dateKey: string;
  label: string;
  total: number;
  isToday: boolean;
}

/** 一週（週一起）7 天的每日有效攝取量 */
export function weekSeries(
  totals: Map<string, number>,
  anchorKey: string
): SeriesPoint[] {
  const start = startOfWeekKey(anchorKey);
  const today = todayKey();
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
  return labels.map((label, i) => {
    const key = addDays(start, i);
    return {
      dateKey: key,
      label,
      total: Math.round(totals.get(key) ?? 0),
      isToday: key === today,
    };
  });
}

/** 一個月每日的有效攝取量 */
export function monthSeries(
  totals: Map<string, number>,
  anchorKey: string
): SeriesPoint[] {
  const start = startOfMonthKey(anchorKey);
  const n = daysInMonth(anchorKey);
  const today = todayKey();
  return Array.from({ length: n }, (_, i) => {
    const key = addDays(start, i);
    return {
      dateKey: key,
      label: String(i + 1),
      total: Math.round(totals.get(key) ?? 0),
      isToday: key === today,
    };
  });
}

/** 本月總攝取量（有效 ml） */
export function monthTotal(
  totals: Map<string, number>,
  anchorKey: string
): number {
  const prefix = anchorKey.slice(0, 7);
  let sum = 0;
  totals.forEach((v, k) => {
    if (k.startsWith(prefix)) sum += v;
  });
  return Math.round(sum);
}

export function logsOfDay(logs: DrinkLog[], key: string): DrinkLog[] {
  return logs
    .filter((l) => l.dateKey === key)
    .sort((a, b) => b.timestamp - a.timestamp);
}
