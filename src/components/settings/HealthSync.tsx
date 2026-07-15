"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWaterStore } from "@/store/useWaterStore";
import { useToday } from "@/hooks/useToday";
import { useVolumeUnit } from "@/hooks/useVolumeUnit";
import { runHealthShortcut } from "@/lib/health";

export function HealthSync() {
  const health = useSettingsStore((s) => s.settings.healthSync);
  const setHealthSync = useSettingsStore((s) => s.setHealthSync);
  const logs = useWaterStore((s) => s.logs);
  const today = useToday();
  const { fmt } = useVolumeUnit();
  const [flash, setFlash] = useState<string | null>(null);

  /* 今天實際飲水總量（用實際容量，非水合後的量）→ 寫入 Health */
  const todayMl = useMemo(
    () =>
      logs
        .filter((l) => l.dateKey === today)
        .reduce((s, l) => s + l.volumeMl, 0),
    [logs, today]
  );

  const alreadySynced = health.syncedDate === today ? health.syncedMl : 0;
  const pendingMl = Math.max(0, todayMl - alreadySynced);

  const send = (ml: number, nextSyncedMl: number) => {
    if (ml <= 0) return;
    runHealthShortcut(health.shortcutName, ml);
    setHealthSync({ ...health, syncedDate: today, syncedMl: nextSyncedMl });
    setFlash(`Sent ${fmt(ml)} to Apple Health`);
    window.setTimeout(() => setFlash(null), 4000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="pr-3">
          <p className="text-sm font-semibold text-ink">Sync to Apple Health</p>
          <p className="mt-0.5 text-xs text-ink-3">
            Sends the day&apos;s water to Health through a Shortcut you set up.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={health.enabled}
          aria-label="Enable Apple Health sync"
          onClick={() => setHealthSync({ ...health, enabled: !health.enabled })}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
            health.enabled ? "bg-accent" : "bg-surface-2 border border-line"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
              health.enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {health.enabled && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-2/60 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-3">Shortcut name</span>
            <input
              type="text"
              value={health.shortcutName}
              onChange={(e) =>
                setHealthSync({ ...health, shortcutName: e.target.value })
              }
              placeholder="Log Water to Health"
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink"
            />
            <span className="text-[11px] text-ink-3">
              Must match the Shortcut&apos;s name exactly.
            </span>
          </label>

          <div className="rounded-xl bg-surface p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-2">Today so far</span>
              <span className="font-num font-bold text-ink">{fmt(todayMl)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-ink-2">Not yet in Health</span>
              <span className="font-num font-bold text-accent">{fmt(pendingMl)}</span>
            </div>
          </div>

          <Button
            onClick={() => send(pendingMl, todayMl)}
            disabled={pendingMl <= 0}
          >
            {pendingMl > 0 ? `Sync ${fmt(pendingMl)} to Health` : "All synced for today"}
          </Button>

          {todayMl > 0 && (
            <button
              onClick={() => send(todayMl, todayMl)}
              className="text-center text-xs font-semibold text-ink-3 underline-offset-2 hover:underline"
            >
              Re-send today&apos;s full total ({fmt(todayMl)})
            </button>
          )}

          {flash && (
            <p className="text-center text-xs font-semibold text-accent">{flash}</p>
          )}

          <label className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs font-semibold text-ink-3">
              Daily sync reminder
            </span>
            <input
              type="time"
              value={health.reminderTime}
              onChange={(e) =>
                setHealthSync({ ...health, reminderTime: e.target.value })
              }
              className="font-num rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink"
            />
          </label>

          <p className="text-xs leading-relaxed text-ink-3">
            At this time WaterMinder nudges you (while it&apos;s open or reachable)
            to tap Sync. A web app can&apos;t write to Health silently in the
            background, so syncing is one tap — the Shortcut also works on your
            Apple Watch face.
          </p>
        </div>
      )}
    </div>
  );
}
