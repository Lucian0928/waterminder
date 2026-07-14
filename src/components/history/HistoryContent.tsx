"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageTransition } from "@/components/layout/PageTransition";
import { OtherDrinksSheet } from "@/components/home/OtherDrinksSheet";
import { DrinkIcon } from "@/components/ui/DrinkIcon";
import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useToday } from "@/hooks/useToday";
import { addDays, dateFromKey, daysInMonth, formatTime } from "@/lib/dates";
import type { DrinkLog, DrinkType } from "@/types";

type StatTab = "D" | "W" | "M" | "Y";

const nf = new Intl.NumberFormat("en-US");
const FALLBACK_COLOR = "#94A3B8";

/* ── 小圖示 ─────────────────────────────────────────── */

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m14.5 6-5.5 6 5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m9.5 6 5.5 6-5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── 期間計算 ───────────────────────────────────────── */

function shiftMonthKey(key: string, delta: number): string {
  const d = dateFromKey(key.slice(0, 8) + "01");
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function sundayStartKey(key: string): string {
  const d = dateFromKey(key);
  return addDays(key, -d.getDay());
}

function periodLabel(tab: StatTab, anchor: string, today: string): string {
  if (tab === "D") {
    if (anchor === today) return "Today";
    if (anchor === addDays(today, -1)) return "Yesterday";
    return dateFromKey(anchor).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (tab === "W") {
    const start = sundayStartKey(anchor);
    const end = addDays(start, 6);
    const fmt = (k: string) => {
      const d = dateFromKey(k);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };
    return `${fmt(start)}  to  ${fmt(end)}`;
  }
  if (tab === "M") {
    return dateFromKey(anchor.slice(0, 8) + "01").toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  return anchor.slice(0, 4);
}

/* ── 資料彙總 ───────────────────────────────────────── */

interface TypeInfo {
  id: string;
  color: string;
}

/** 出現在記錄中的飲品類型，依設定順序；已刪除的類型用記錄裡的顏色 */
function typesInLogs(logs: DrinkLog[], drinkTypes: DrinkType[]): TypeInfo[] {
  const seen = new Set(logs.map((l) => l.drinkTypeId));
  const ordered: TypeInfo[] = [];
  for (const t of drinkTypes) {
    if (seen.has(t.id)) {
      ordered.push({ id: t.id, color: t.color });
      seen.delete(t.id);
    }
  }
  for (const id of seen) {
    const sample = logs.find((l) => l.drinkTypeId === id);
    ordered.push({ id, color: sample?.drinkColor || FALLBACK_COLOR });
  }
  return ordered;
}

/** 一組日期的堆疊資料列：{ label, [typeId]: effectiveMl } */
function stackRows(
  logs: DrinkLog[],
  dayKeys: string[],
  labels: string[]
): Record<string, string | number>[] {
  const byDay = new Map<string, Map<string, number>>();
  for (const l of logs) {
    let m = byDay.get(l.dateKey);
    if (!m) byDay.set(l.dateKey, (m = new Map()));
    m.set(l.drinkTypeId, (m.get(l.drinkTypeId) ?? 0) + l.effectiveMl);
  }
  return dayKeys.map((key, i) => {
    const row: Record<string, string | number> = { label: labels[i] };
    const m = byDay.get(key);
    if (m) m.forEach((v, id) => (row[id] = Math.round(v)));
    return row;
  });
}

/* ── 圖表 ───────────────────────────────────────────── */

const TICK_STYLE = { fill: "#94A3B8", fontSize: 11, fontWeight: 600 };

function kFmt(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(v);
}

function DayChart({
  logs,
  dayKey,
  goal,
}: {
  logs: DrinkLog[];
  dayKey: string;
  goal: number;
}) {
  const data = useMemo(() => {
    const dayLogs = logs
      .filter((l) => l.dateKey === dayKey)
      .sort((a, b) => a.timestamp - b.timestamp);
    let running = 0;
    let idx = 0;
    return Array.from({ length: 25 }, (_, h) => {
      const cutoff = dateFromKey(dayKey).getTime() + h * 3_600_000;
      while (idx < dayLogs.length && dayLogs[idx].timestamp < cutoff) {
        running += dayLogs[idx].effectiveMl;
        idx++;
      }
      return { hour: h, total: Math.round(running) };
    });
  }, [logs, dayKey]);

  const yMax = Math.round(
    Math.max(goal * 1.15, ...data.map((d) => d.total)) * 1.02
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="hydro-day-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          ticks={[0, 12, 24]}
          tickFormatter={(v: number) => (v === 12 ? "12" : "00")}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={[Math.round(goal / 2), goal]}
          tickFormatter={(v: number) => nf.format(v)}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
          domain={[0, yMax]}
        />
        <ReferenceLine y={goal} stroke="#3B82F6" strokeWidth={1.5} />
        <Tooltip
          formatter={(v: number) => [`${nf.format(v)}ml`, "Total"]}
          contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#hydro-day-grad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StackedChart({
  data,
  types,
  goal,
  ticks,
  thinBars,
}: {
  data: Record<string, string | number>[];
  types: TypeInfo[];
  goal: number;
  ticks?: string[];
  thinBars?: boolean;
}) {
  const maxTotal = Math.max(
    goal * 1.15,
    ...data.map((row) =>
      types.reduce((sum, t) => sum + (Number(row[t.id]) || 0), 0)
    )
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
        barSize={thinBars ? 10 : undefined}
      >
        <XAxis
          dataKey="label"
          ticks={ticks}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={[Math.round(goal / 2), goal]}
          tickFormatter={kFmt}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
          domain={[0, Math.round(maxTotal * 1.02)]}
        />
        <ReferenceLine y={goal} stroke="#3B82F6" strokeWidth={1.5} />
        <Tooltip
          formatter={(v: number, name: string) => [`${nf.format(v)}ml`, name]}
          contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }}
        />
        {types.map((t, i) => (
          <Bar
            key={t.id}
            dataKey={t.id}
            stackId="a"
            fill={t.color}
            radius={i === types.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Today's Logs ───────────────────────────────────── */

function MiniRing({ pct }: { pct: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="36" height="36" className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="rgb(var(--c-accent))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(1, pct))}
      />
    </svg>
  );
}

function TodayLogs({ logs, goal }: { logs: DrinkLog[]; goal: number }) {
  const rows = useMemo(() => {
    const asc = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    let running = 0;
    return asc
      .map((l) => {
        running += l.effectiveMl;
        return { log: l, pct: goal > 0 ? running / goal : 0 };
      })
      .reverse();
  }, [logs, goal]);

  if (rows.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-bold text-ink">{"Today's Logs"}</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(({ log, pct }) => (
          <div
            key={log.id}
            className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${log.drinkColor}2b` }}
            >
              <DrinkIcon
                icon={log.drinkIcon}
                className="h-5 w-5"
                style={{ color: log.drinkColor }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">
                {log.drinkName} — {log.volumeMl}ml
              </div>
              <div className="font-num text-xs text-ink-3">
                {formatTime(log.timestamp)}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-ink-3">daily goal</span>
              <div className="relative flex items-center justify-center">
                <MiniRing pct={pct} />
                <span className="font-num absolute text-[9px] font-bold text-accent">
                  {Math.round(pct * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 主頁面 ─────────────────────────────────────────── */

export function HistoryContent() {
  const hydrated = useHydrated();
  const today = useToday();
  const logs = useWaterStore((s) => s.logs);
  const addLog = useWaterStore((s) => s.addLog);
  const settings = useSettingsStore((s) => s.settings);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);

  const [tab, setTab] = useState<StatTab>("D");
  const [anchor, setAnchor] = useState(() => today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const goal = settings.goal.dailyTargetMl;
  const tabs: StatTab[] = ["D", "W", "M", "Y"];

  /* 篩選選項：使用者杯型 + 記錄裡出現過但已不在清單的類型 */
  const filterOptions = useMemo(() => {
    const opts = drinkTypes.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
    }));
    const known = new Set(opts.map((o) => o.id));
    for (const l of logs) {
      if (!known.has(l.drinkTypeId)) {
        known.add(l.drinkTypeId);
        opts.push({
          id: l.drinkTypeId,
          name: l.drinkName,
          icon: l.drinkIcon,
          color: l.drinkColor || FALLBACK_COLOR,
        });
      }
    }
    return opts;
  }, [drinkTypes, logs]);

  const activeFilter = filterOptions.find((o) => o.id === filterId) ?? null;
  const filteredLogs = useMemo(
    () => (filterId ? logs.filter((l) => l.drinkTypeId === filterId) : logs),
    [logs, filterId]
  );

  const period = useMemo(() => {
    if (tab === "W") {
      const start = sundayStartKey(anchor);
      const keys = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      return { keys, labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
    }
    if (tab === "M") {
      const start = anchor.slice(0, 8) + "01";
      const n = daysInMonth(anchor);
      const keys = Array.from({ length: n }, (_, i) => addDays(start, i));
      return { keys, labels: keys.map((_, i) => String(i + 1)) };
    }
    return { keys: [anchor], labels: [anchor] };
  }, [tab, anchor]);

  const types = useMemo(
    () => typesInLogs(filteredLogs, drinkTypes),
    [filteredLogs, drinkTypes]
  );

  const barData = useMemo(() => {
    if (tab === "W" || tab === "M") {
      return stackRows(filteredLogs, period.keys, period.labels);
    }
    if (tab === "Y") {
      /* 每月一根：該月「平均每日」攝取，按飲品拆分堆疊 */
      const year = anchor.slice(0, 4);
      const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
      return Array.from({ length: 12 }, (_, m) => {
        const prefix = `${year}-${String(m + 1).padStart(2, "0")}`;
        const monthLogs = filteredLogs.filter((l) => l.dateKey.startsWith(prefix));
        const days = new Set(monthLogs.map((l) => l.dateKey)).size;
        const row: Record<string, string | number> = { label: monthLabels[m] };
        if (days > 0) {
          const perType = new Map<string, number>();
          for (const l of monthLogs) {
            perType.set(
              l.drinkTypeId,
              (perType.get(l.drinkTypeId) ?? 0) + l.effectiveMl
            );
          }
          perType.forEach((v, id) => (row[id] = Math.round(v / days)));
        }
        return row;
      });
    }
    return [];
  }, [tab, anchor, filteredLogs, period]);

  const metric = useMemo(() => {
    let inPeriod: DrinkLog[];
    if (tab === "D") {
      inPeriod = filteredLogs.filter((l) => l.dateKey === anchor);
    } else if (tab === "Y") {
      const year = anchor.slice(0, 4);
      inPeriod = filteredLogs.filter((l) => l.dateKey.startsWith(year));
    } else {
      const keySet = new Set(period.keys);
      inPeriod = filteredLogs.filter((l) => keySet.has(l.dateKey));
    }
    const total = inPeriod.reduce((s, l) => s + l.effectiveMl, 0);
    if (tab === "D") return { label: "Total", value: Math.round(total) };
    const days = new Set(inPeriod.map((l) => l.dateKey)).size;
    return { label: "Average", value: days > 0 ? Math.round(total / days) : 0 };
  }, [tab, anchor, filteredLogs, period]);

  const todayLogs = useMemo(
    () => filteredLogs.filter((l) => l.dateKey === today),
    [filteredLogs, today]
  );

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-3">
        Loading…
      </div>
    );
  }

  const shift = (delta: number) => {
    setAnchor((a) => {
      if (tab === "D") return addDays(a, delta);
      if (tab === "W") return addDays(a, delta * 7);
      if (tab === "M") return shiftMonthKey(a, delta);
      const y = parseInt(a.slice(0, 4), 10) + delta;
      return `${y}${a.slice(4)}`;
    });
  };

  const atCurrent =
    tab === "D"
      ? anchor === today
      : tab === "W"
        ? sundayStartKey(anchor) === sundayStartKey(today)
        : tab === "M"
          ? anchor.slice(0, 7) === today.slice(0, 7)
          : anchor.slice(0, 4) === today.slice(0, 4);

  return (
    <PageTransition className="flex flex-col gap-4">
      {/* Header：三欄 grid 讓標題永遠置中，不受左右寬度影響 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-4">
        <div className="relative justify-self-start">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            aria-expanded={filterOpen}
            className="flex items-center gap-1.5 rounded-2xl bg-surface px-4 py-2 text-sm font-semibold text-accent"
          >
            {activeFilter && (
              <DrinkIcon
                icon={activeFilter.icon}
                className="h-4 w-4"
                style={{ color: activeFilter.color }}
              />
            )}
            {activeFilter?.name ?? "All Drinks"}{" "}
            <span className="text-[10px]">▼</span>
          </button>

          <AnimatePresence>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setFilterOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-0 top-full z-40 mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl bg-surface p-1.5"
                  style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}
                >
                  <button
                    onClick={() => {
                      setFilterId(null);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      filterId === null ? "bg-bg text-accent" : "text-ink-2"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    All Drinks
                  </button>
                  {filterOptions.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setFilterId(o.id);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        filterId === o.id ? "bg-bg text-accent" : "text-ink-2"
                      }`}
                    >
                      <DrinkIcon
                        icon={o.icon}
                        className="h-5 w-5"
                        style={{ color: o.color }}
                      />
                      {o.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <span className="text-lg font-bold text-ink">History</span>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setSheetOpen(true)}
          aria-label="Add log"
          className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full bg-accent text-white"
        >
          <PlusIcon />
        </motion.button>
      </div>

      {/* D/W/M/Y tabs */}
      <div className="flex rounded-2xl bg-surface-2 p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setAnchor(today);
            }}
            className="flex-1 rounded-xl py-2 text-sm font-bold transition-all"
            style={{
              background: tab === t ? "rgb(var(--c-accent))" : "transparent",
              color: tab === t ? "#fff" : "rgb(var(--c-ink-2))",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div
        className="rounded-3xl bg-surface p-4"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => shift(-1)}
            aria-label="Previous period"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-accent"
          >
            <ChevronLeft />
          </motion.button>
          <span className="font-num flex-1 px-2 text-center text-sm font-semibold text-ink">
            {periodLabel(tab, anchor, today)}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => shift(1)}
            disabled={atCurrent}
            aria-label="Next period"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-accent disabled:text-ink-3"
          >
            <ChevronRight />
          </motion.button>
        </div>

        <div className="mb-3">
          <div className="text-sm font-semibold text-ink-2">{metric.label}</div>
          <div className="font-num text-3xl font-extrabold tracking-tight text-accent">
            {nf.format(metric.value)} ml
          </div>
        </div>

        {tab === "D" ? (
          <DayChart logs={filteredLogs} dayKey={anchor} goal={goal} />
        ) : (
          <StackedChart
            data={barData}
            types={types}
            goal={goal}
            ticks={tab === "M" ? ["1", "8", "15", "22", "29"] : undefined}
            thinBars={tab === "M"}
          />
        )}
      </div>

      {/* Today's Logs — 只在 D + 今天 */}
      {tab === "D" && anchor === today && (
        <TodayLogs logs={todayLogs} goal={goal} />
      )}

      <OtherDrinksSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        drinkTypes={drinkTypes}
        onAdd={(d, ml, ts) => addLog(d, ml, ts)}
      />
    </PageTransition>
  );
}
