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
    meta?.setAttribute("content", theme === "dark" ? "#141a22" : "#EEF4FB");
  }, [theme]);
}

/**
 * 前景提醒：每 15 秒輪詢是否到達下一個提醒點，到點就發通知並排下一個。
 * 回到前景（visibilitychange）時立即檢查一次——若在背景錯過了提醒點，
 * 重新開啟 App 時會補一則提醒。
 * 註：iOS 上 Web App 完全關閉後 JS 會被暫停，無法在背景觸發本機通知，
 *    可靠的背景提醒需要原生外殼或 Web Push 後端。
 */
function useReminderScheduler() {
  const reminder = useSettingsStore((s) => s.settings.reminder);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const nextAt = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated || !reminder.enabled) {
      nextAt.current = null;
      return;
    }
    nextAt.current = nextReminderAt(reminder);

    const fireIfDue = async () => {
      if (nextAt.current == null) {
        nextAt.current = nextReminderAt(reminder);
        return;
      }
      if (Date.now() >= nextAt.current) {
        await showNotification(
          "Time to hydrate 💧",
          "Have a glass of water and keep your pace today."
        );
        // 跳到「現在之後」的下一個提醒點，避免補發時連續轟炸
        nextAt.current = nextReminderAt(reminder);
      }
    };

    const interval = setInterval(fireIfDue, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void fireIfDue();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
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
