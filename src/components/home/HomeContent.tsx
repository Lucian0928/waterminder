"use client";

import { useMemo, useRef, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ProgressRing } from "./ProgressRing";
import { QuickAddButtons } from "./QuickAddButtons";
import { StatsCards } from "./StatsCards";
import { EmptyState } from "./EmptyState";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useToday } from "@/hooks/useToday";
import {
  averageAchievement,
  buildDailyTotals,
  currentStreak,
  logsOfDay,
} from "@/lib/stats";
import { formatTime } from "@/lib/dates";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "夜深了";
  if (h < 11) return "早安";
  if (h < 14) return "午安";
  if (h < 18) return "下午好";
  return "晚上好";
}

export function HomeContent() {
  const hydrated = useHydrated();
  const today = useToday();
  const logs = useWaterStore((s) => s.logs);
  const addLog = useWaterStore((s) => s.addLog);
  const removeLog = useWaterStore((s) => s.removeLog);
  const settings = useSettingsStore((s) => s.settings);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);

  const [selectedDrinkId, setSelectedDrinkId] = useState("water");
  const [toast, setToast] = useState<ToastData | null>(null);
  const lastLogId = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayLogs = useMemo(() => logsOfDay(logs, today), [logs, today]);
  const totals = useMemo(() => buildDailyTotals(logs), [logs]);
  const currentMl = totals.get(today) ?? 0;
  const goalMl = settings.goal.dailyTargetMl;

  const streak = useMemo(() => currentStreak(totals, goalMl), [totals, goalMl]);
  const avg = useMemo(
    () => averageAchievement(totals, goalMl, 7),
    [totals, goalMl]
  );
  const lastLog = todayLogs[0] ?? null;

  const handleAdd = (volumeMl: number) => {
    const drink =
      drinkTypes.find((t) => t.id === selectedDrinkId) ?? drinkTypes[0];
    if (!drink) return;
    const log = addLog(drink, volumeMl);
    lastLogId.current = log.id;

    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: log.id, message: `已記錄 ${volumeMl} ml` });
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const handleUndo = () => {
    if (lastLogId.current) {
      removeLog(lastLogId.current);
      lastLogId.current = null;
    }
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-3">
        載入中…
      </div>
    );
  }

  const isEmpty = todayLogs.length === 0;

  return (
    <PageTransition className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-semibold text-ink-2">{greeting()} 👋</p>
        <h1 className="font-display mt-0.5 text-2xl font-bold tracking-tight">
          今日進度
        </h1>
      </header>

      <ProgressRing
        currentMl={currentMl}
        goalMl={goalMl}
        unit={settings.volumeUnit}
        emptyHint={isEmpty ? "還沒有記錄，先來一杯吧" : undefined}
      />

      <QuickAddButtons
        drinkTypes={drinkTypes}
        selectedId={selectedDrinkId}
        onSelect={setSelectedDrinkId}
        quickVolumes={settings.quickVolumesMl}
        unit={settings.volumeUnit}
        onAdd={handleAdd}
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <StatsCards
          streak={streak}
          avgAchievement={avg}
          lastLogTime={lastLog ? formatTime(lastLog.timestamp) : null}
        />
      )}

      <Toast toast={toast} onUndo={handleUndo} />
    </PageTransition>
  );
}
