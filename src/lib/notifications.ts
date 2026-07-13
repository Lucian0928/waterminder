import type { ReminderSettings } from "@/types";
import { minutesOf } from "./dates";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensurePermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

/** 優先透過 Service Worker 顯示（PWA 安裝後在部分平台是唯一途徑） */
export async function showNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted")
    return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "waterminder-reminder",
      });
      return;
    }
  } catch {
    // fall through
  }
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}

/**
 * 計算下一次提醒的時間（epoch ms）。
 * 從起床時間開始、依間隔對齊；超出睡前時間則排到隔天起床後第一個間隔點。
 */
export function nextReminderAt(
  reminder: ReminderSettings,
  now: Date = new Date()
): number | null {
  if (!reminder.enabled) return null;
  const wake = minutesOf(reminder.wakeTime);
  const sleep = minutesOf(reminder.sleepTime);
  if (sleep <= wake) return null; // 視為設定錯誤，不排程

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const base = new Date(now);
  base.setSeconds(0, 0);

  let targetMin: number;
  if (nowMin < wake) {
    targetMin = wake + reminder.intervalMinutes;
  } else {
    const elapsed = nowMin - wake;
    const steps = Math.floor(elapsed / reminder.intervalMinutes) + 1;
    targetMin = wake + steps * reminder.intervalMinutes;
  }

  if (targetMin > sleep) {
    // 明天起床後的第一個間隔點
    base.setDate(base.getDate() + 1);
    targetMin = wake + reminder.intervalMinutes;
  }

  base.setHours(Math.floor(targetMin / 60), targetMin % 60, 0, 0);
  return base.getTime();
}
