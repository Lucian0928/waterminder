"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWaterStore } from "@/store/useWaterStore";
import { nextReminderAt, showNotification } from "@/lib/notifications";

/** 主題套用到 <html data-theme> */
function useThemeSync() {
  const theme = useSettingsStore((s) => s.settings.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#070b14" : "#f0f6fa");
  }, [theme]);
}

/** 前景提醒排程：頁面存活期間用 setTimeout 鏈輪詢下一個提醒點 */
function useReminderScheduler() {
  const reminder = useSettingsStore((s) => s.settings.reminder);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!hydrated || !reminder.enabled) return;

    const schedule = () => {
      const at = nextReminderAt(reminder);
      if (at === null) return;
      const delay = Math.max(1000, at - Date.now());
      timer.current = setTimeout(async () => {
        await showNotification("該喝水囉 💧", "補充一杯水，保持今天的節奏。");
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [hydrated, reminder]);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateWater = useWaterStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateSettings();
    void hydrateWater();
  }, [hydrateSettings, hydrateWater]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 開發模式或不支援時靜默略過
      });
    }
  }, []);

  useThemeSync();
  useReminderScheduler();

  return <>{children}</>;
}
