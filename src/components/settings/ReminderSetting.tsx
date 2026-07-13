"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import {
  ensurePermission,
  notificationsSupported,
  showNotification,
} from "@/lib/notifications";
import { minutesOf } from "@/lib/dates";
import type { ReminderInterval } from "@/types";

export function ReminderSetting() {
  const reminder = useSettingsStore((s) => s.settings.reminder);
  const setReminder = useSettingsStore((s) => s.setReminder);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );

  useEffect(() => {
    if (notificationsSupported()) setPermission(Notification.permission);
  }, []);

  const invalidRange =
    minutesOf(reminder.sleepTime) <= minutesOf(reminder.wakeTime);

  const handleToggle = async () => {
    if (!reminder.enabled) {
      const p = await ensurePermission();
      setPermission(p);
      if (p !== "granted") return;
      setReminder({ ...reminder, enabled: true });
    } else {
      setReminder({ ...reminder, enabled: false });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">定時提醒</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {permission === "denied"
              ? "通知權限已被封鎖，請在瀏覽器設定中允許"
              : "在清醒時段內按間隔提醒喝水"}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={reminder.enabled}
          aria-label="啟用提醒"
          onClick={handleToggle}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
            reminder.enabled ? "bg-accent" : "bg-surface-2 border border-line"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
              reminder.enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {reminder.enabled && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-2/60 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">起床時間</span>
              <input
                type="time"
                value={reminder.wakeTime}
                onChange={(e) =>
                  setReminder({ ...reminder, wakeTime: e.target.value })
                }
                className="font-num rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">睡前時間</span>
              <input
                type="time"
                value={reminder.sleepTime}
                onChange={(e) =>
                  setReminder({ ...reminder, sleepTime: e.target.value })
                }
                className="font-num rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink"
              />
            </label>
          </div>
          {invalidRange && (
            <p className="text-xs font-semibold text-rose-400">
              睡前時間需晚於起床時間，目前設定不會發出提醒。
            </p>
          )}
          <div>
            <span className="text-xs font-semibold text-ink-3">提醒間隔</span>
            <SegmentedControl<ReminderInterval>
              className="mt-1.5"
              options={[
                { value: 30, label: "30 分" },
                { value: 60, label: "60 分" },
                { value: 90, label: "90 分" },
                { value: 120, label: "120 分" },
              ]}
              value={reminder.intervalMinutes}
              onChange={(v) => setReminder({ ...reminder, intervalMinutes: v })}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              showNotification("測試通知 💧", "通知運作正常，就這種感覺。")
            }
          >
            發送測試通知
          </Button>
          <p className="text-xs leading-relaxed text-ink-3">
            提醒在 App
            開啟（含加到主畫面後於前景）時最可靠；瀏覽器分頁完全關閉後，部分平台無法在背景觸發本機通知。
          </p>
        </div>
      )}
    </div>
  );
}
