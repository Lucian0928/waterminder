"use client";

import { useMemo, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlowCard } from "@/components/ui/GlowCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { IntakeBarChart } from "./IntakeBarChart";
import { DayTimeline } from "./DayTimeline";
import { HistoryStats } from "./HistoryStats";
import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useToday } from "@/hooks/useToday";
import {
  averageAchievement,
  bestStreak,
  buildDailyTotals,
  logsOfDay,
  monthSeries,
  monthTotal,
  weekSeries,
} from "@/lib/stats";
import {
  addDays,
  dateFromKey,
  formatMonthTitle,
  formatWeekTitle,
  startOfWeekKey,
  todayKey,
} from "@/lib/dates";

type Range = "day" | "week" | "month";

function shiftMonth(key: string, delta: number): string {
  const d = dateFromKey(key.slice(0, 8) + "01");
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function HistoryContent() {
  const hydrated = useHydrated();
  const today = useToday();
  const logs = useWaterStore((s) => s.logs);
  const removeLog = useWaterStore((s) => s.removeLog);
  const settings = useSettingsStore((s) => s.settings);

  const [range, setRange] = useState<Range>("week");
  const [anchor, setAnchor] = useState(() => todayKey());

  const goalMl = settings.goal.dailyTargetMl;
  const unit = settings.volumeUnit;
  const dark = settings.theme === "dark";

  const totals = useMemo(() => buildDailyTotals(logs), [logs]);
  const todayLogs = useMemo(() => logsOfDay(logs, today), [logs, today]);
  const week = useMemo(() => weekSeries(totals, anchor), [totals, anchor]);
  const month = useMemo(() => monthSeries(totals, anchor), [totals, anchor]);

  const weekAvg = useMemo(
    () => averageAchievement(totals, goalMl, 7),
    [totals, goalMl]
  );
  const best = useMemo(() => bestStreak(totals, goalMl), [totals, goalMl]);
  const monthMl = useMemo(() => monthTotal(totals, today), [totals, today]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-3">
        載入中…
      </div>
    );
  }

  const shift = (delta: number) => {
    setAnchor((a) =>
      range === "week" ? addDays(a, delta * 7) : shiftMonth(a, delta)
    );
  };

  const title =
    range === "day"
      ? "今天"
      : range === "week"
        ? formatWeekTitle(startOfWeekKey(anchor))
        : formatMonthTitle(anchor);

  const atCurrent =
    range === "week"
      ? startOfWeekKey(anchor) === startOfWeekKey(today)
      : anchor.slice(0, 7) === today.slice(0, 7);

  return (
    <PageTransition className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          歷史統計
        </h1>
      </header>

      <SegmentedControl<Range>
        options={[
          { value: "day", label: "日" },
          { value: "week", label: "週" },
          { value: "month", label: "月" },
        ]}
        value={range}
        onChange={(r) => {
          setRange(r);
          setAnchor(todayKey());
        }}
      />

      <GlowCard className="px-4 py-5">
        {range !== "day" && (
          <div className="mb-3 flex items-center justify-between px-1">
            <button
              onClick={() => shift(-1)}
              aria-label={range === "week" ? "上一週" : "上一個月"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2 hover:text-ink"
            >
              ‹
            </button>
            <span className="font-num text-sm font-bold text-ink">
              {title}
            </span>
            <button
              onClick={() => shift(1)}
              disabled={atCurrent}
              aria-label={range === "week" ? "下一週" : "下一個月"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2 hover:text-ink disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}

        {range === "day" ? (
          <DayTimeline logs={todayLogs} unit={unit} onDelete={removeLog} />
        ) : (
          <IntakeBarChart
            data={range === "week" ? week : month}
            goalMl={goalMl}
            unit={unit}
            dark={dark}
            compact={range === "month"}
          />
        )}
      </GlowCard>

      <HistoryStats
        weekAvg={weekAvg}
        bestStreak={best}
        monthTotalMl={monthMl}
        unit={unit}
      />
    </PageTransition>
  );
}
