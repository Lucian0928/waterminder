"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { DrinkIcon } from "@/components/ui/DrinkIcon";
import { dateFromKey, formatTime } from "@/lib/dates";
import type { DrinkLog } from "@/types";

const nf = new Intl.NumberFormat("en-US");

function dayLabel(key: string, today: string): string {
  if (key === today) return "Today";
  const d = dateFromKey(key);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AllLogsSheet({
  open,
  onClose,
  logs,
  today,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  logs: DrinkLog[];
  today: string;
  onEdit: (log: DrinkLog) => void;
}) {
  const groups = useMemo(() => {
    const byDay = new Map<string, DrinkLog[]>();
    for (const l of logs) {
      const arr = byDay.get(l.dateKey);
      if (arr) arr.push(l);
      else byDay.set(l.dateKey, [l]);
    }
    return [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, items]) => ({
        key,
        items: items.sort((a, b) => b.timestamp - a.timestamp),
        total: items.reduce((s, l) => s + l.volumeMl, 0),
      }));
  }, [logs]);

  return (
    <Modal open={open} onClose={onClose} title="All Logs">
      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-3">No logs yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-bold text-ink">{dayLabel(g.key, today)}</span>
                <span className="font-num text-xs font-semibold text-ink-3">
                  {nf.format(g.total)} ml
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {g.items.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => onEdit(log)}
                    className="flex items-center gap-3 rounded-2xl bg-surface-2/60 px-3 py-2.5 text-left"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${log.drinkColor}2b` }}
                    >
                      <DrinkIcon icon={log.drinkIcon} className="h-5 w-5" style={{ color: log.drinkColor }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {log.drinkName} — {log.volumeMl}ml
                      </span>
                      <span className="font-num block text-xs text-ink-3">
                        {formatTime(log.timestamp)}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-accent">Edit</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
