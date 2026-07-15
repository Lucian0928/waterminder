"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DrinkIcon } from "@/components/ui/DrinkIcon";
import { useVolumeUnit } from "@/hooks/useVolumeUnit";
import { mergeWithCatalog } from "@/lib/defaults";
import { dateKeyOf } from "@/lib/dates";
import type { DrinkLog, DrinkType } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

export function LogEditSheet({
  log,
  drinkTypes,
  onClose,
  onSave,
  onDelete,
}: {
  log: DrinkLog | null;
  drinkTypes: DrinkType[];
  onClose: () => void;
  onSave: (log: DrinkLog) => void;
  onDelete: (id: string) => void;
}) {
  const { label, raw, toMl, step } = useVolumeUnit();
  const [drinkTypeId, setDrinkTypeId] = useState("");
  const [amount, setAmount] = useState("0");
  const [when, setWhen] = useState(() => new Date());

  useEffect(() => {
    if (!log) return;
    setDrinkTypeId(log.drinkTypeId);
    setAmount(String(raw(log.volumeMl)));
    setWhen(new Date(log.timestamp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  /* 可選類別：全部類別 + 保留這筆紀錄原本的類別（即使已停用/刪除） */
  const options = useMemo(() => {
    const all = mergeWithCatalog(drinkTypes);
    const list = all.filter((t) => t.active || t.id === log?.drinkTypeId);
    if (log && !list.some((t) => t.id === log.drinkTypeId)) {
      list.unshift({
        id: log.drinkTypeId,
        name: log.drinkName,
        icon: log.drinkIcon,
        color: log.drinkColor,
        defaultVolumeMl: log.volumeMl,
        hydrationFactor: log.volumeMl ? log.effectiveMl / log.volumeMl : 1,
        active: true,
        isBuiltIn: false,
      });
    }
    return list;
  }, [drinkTypes, log]);

  const selected = options.find((t) => t.id === drinkTypeId) ?? options[0];
  const ml = Math.max(0, toMl(Number(amount) || 0));

  const dateValue = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`;
  const timeValue = `${pad(when.getHours())}:${pad(when.getMinutes())}`;

  const setDatePart = (val: string) => {
    const [y, m, d] = val.split("-").map(Number);
    if (!y || !m || !d) return;
    const next = new Date(when);
    next.setFullYear(y, m - 1, d);
    setWhen(next);
  };
  const setTimePart = (val: string) => {
    const [h, mi] = val.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(mi)) return;
    const next = new Date(when);
    next.setHours(h, mi, 0, 0);
    setWhen(next);
  };

  const save = () => {
    if (!log || !selected || ml <= 0) return;
    const ts = when.getTime();
    onSave({
      ...log,
      timestamp: ts,
      dateKey: dateKeyOf(ts),
      volumeMl: ml,
      effectiveMl: Math.round(ml * selected.hydrationFactor),
      drinkTypeId: selected.id,
      drinkName: selected.name,
      drinkIcon: selected.icon,
      drinkColor: selected.color,
    });
    onClose();
  };

  return (
    <Modal open={log !== null} onClose={onClose} title="Edit Log">
      {log && selected && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-1 pt-1">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: selected.color }}
            >
              <DrinkIcon icon={selected.icon} className="h-8 w-8 text-white" />
            </span>
            <span className="font-num pt-1 text-2xl font-extrabold text-ink">
              {amount} {label}
            </span>
            <span className="text-sm font-medium text-ink-2">{selected.name}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-ink-3">Drink Type</span>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {options.map((t) => {
                const active = t.id === drinkTypeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDrinkTypeId(t.id)}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-2 text-xs font-semibold"
                    style={{
                      background: active ? "rgb(var(--c-surface))" : "rgb(var(--c-surface-2))",
                      color: active ? "rgb(var(--c-accent))" : "rgb(var(--c-ink-2))",
                      border: active ? "2px solid rgb(var(--c-accent))" : "2px solid transparent",
                    }}
                  >
                    <DrinkIcon
                      icon={t.icon}
                      className="h-4 w-4"
                      style={{ color: active ? "rgb(var(--c-accent))" : t.color }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-3">Amount ({label})</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={step}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-num rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-bold text-ink"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Date</span>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDatePart(e.target.value)}
                className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Time</span>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimePart(e.target.value)}
                className="font-num rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="danger"
              onClick={() => {
                onDelete(log.id);
                onClose();
              }}
            >
              Delete
            </Button>
            <Button className="flex-1" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
