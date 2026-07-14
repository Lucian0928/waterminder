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
          <p className="text-sm font-semibold text-ink">Scheduled reminders</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {permission === "denied"
              ? "Notifications are blocked — allow them in your browser settings"
              : "Remind you to drink at set intervals while awake"}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={reminder.enabled}
          aria-label="Enable reminders"
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
              <span className="text-xs font-semibold text-ink-3">Wake time</span>
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
              <span className="text-xs font-semibold text-ink-3">Bedtime</span>
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
              Bedtime must be later than wake time — no reminders will fire with the current setting.
            </p>
          )}
          <div>
            <span className="text-xs font-semibold text-ink-3">Interval</span>
            <SegmentedControl<ReminderInterval>
              className="mt-1.5"
              options={[
                { value: 30, label: "30 min" },
                { value: 60, label: "60 min" },
                { value: 90, label: "90 min" },
                { value: 120, label: "120 min" },
              ]}
              value={reminder.intervalMinutes}
              onChange={(v) => setReminder({ ...reminder, intervalMinutes: v })}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              showNotification("Test notification 💧", "Notifications are working — this is what they feel like.")
            }
          >
            Send test notification
          </Button>
          <p className="text-xs leading-relaxed text-ink-3">
            Reminders are most reliable while the app is open (including foreground after Add to Home Screen); some platforms can't fire local notifications once the tab is fully closed.
          </p>
        </div>
      )}
    </div>
  );
}
