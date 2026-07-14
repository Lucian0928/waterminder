"use client";

import { useMemo, useRef, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ProgressRing } from "./ProgressRing";
import { DrinkGrid } from "./DrinkGrid";
import { OtherDrinksSheet } from "./OtherDrinksSheet";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useToday } from "@/hooks/useToday";
import { buildDailyTotals } from "@/lib/stats";
import type { DrinkType } from "@/types";

export function HomeContent() {
  const hydrated = useHydrated();
  const today = useToday();
  const logs = useWaterStore((s) => s.logs);
  const addLog = useWaterStore((s) => s.addLog);
  const removeLog = useWaterStore((s) => s.removeLog);
  const settings = useSettingsStore((s) => s.settings);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const lastLogId = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totals = useMemo(() => buildDailyTotals(logs), [logs]);
  const currentMl = totals.get(today) ?? 0;
  const goalMl = settings.goal.dailyTargetMl;

  const handleAdd = (drink: DrinkType, volumeMl: number) => {
    const log = addLog(drink, volumeMl);
    lastLogId.current = log.id;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: log.id, message: `Logged ${volumeMl} ml` });
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
        Loading…
      </div>
    );
  }

  return (
    <PageTransition className="flex flex-col gap-6">
      <header className="pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Current Hydration
        </h1>
      </header>

      <div className="flex justify-center py-2">
        <ProgressRing currentMl={currentMl} goalMl={goalMl} />
      </div>

      <DrinkGrid
        drinkTypes={drinkTypes}
        onAdd={(d) => handleAdd(d, d.defaultVolumeMl)}
        onOther={() => setSheetOpen(true)}
      />

      <Toast toast={toast} onUndo={handleUndo} />

      <OtherDrinksSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        drinkTypes={drinkTypes}
        onAdd={handleAdd}
      />
    </PageTransition>
  );
}
