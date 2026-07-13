"use client";

import { useState } from "react";
import type { DrinkType, VolumeUnit } from "@/types";
import { formatVolume } from "@/lib/units";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function QuickAddButtons({
  drinkTypes,
  selectedId,
  onSelect,
  quickVolumes,
  unit,
  onAdd,
}: {
  drinkTypes: DrinkType[];
  selectedId: string;
  onSelect: (id: string) => void;
  quickVolumes: number[];
  unit: VolumeUnit;
  onAdd: (volumeMl: number) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customMl, setCustomMl] = useState(200);
  const selected =
    drinkTypes.find((t) => t.id === selectedId) ?? drinkTypes[0];

  return (
    <div>
      {/* 飲品選擇列 */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {drinkTypes.map((t) => {
          const active = t.id === selected?.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all ${
                active
                  ? "border-transparent text-bg"
                  : "border-line bg-surface-2 text-ink-2 hover:text-ink"
              }`}
              style={
                active
                  ? {
                      backgroundColor: t.color,
                      boxShadow: `0 0 16px ${t.color}55`,
                    }
                  : undefined
              }
            >
              <span aria-hidden>{t.icon}</span>
              {t.name}
              {t.hydrationFactor < 1 && (
                <span
                  className={`font-num text-[11px] font-bold ${active ? "opacity-70" : "text-ink-3"}`}
                >
                  {Math.round(t.hydrationFactor * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 快速容量按鈕 */}
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {quickVolumes.map((ml) => (
          <button
            key={ml}
            onClick={() => onAdd(ml)}
            className="glow-card flex flex-col items-center gap-0.5 rounded-2xl py-3.5 transition-transform active:scale-95"
          >
            <span className="font-num text-lg font-bold text-ink">{ml}</span>
            <span className="text-[11px] font-semibold text-ink-3">ml</span>
          </button>
        ))}
        <button
          onClick={() => {
            setCustomMl(selected?.defaultVolumeMl ?? 200);
            setCustomOpen(true);
          }}
          className="glow-card flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3.5 transition-transform active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-accent">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] font-semibold text-ink-3">自訂</span>
        </button>
      </div>

      {/* 自訂容量 */}
      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title={`自訂容量 — ${selected?.name ?? ""}`}
      >
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <span className="font-num text-5xl font-bold text-accent">
              {customMl}
            </span>
            <span className="ml-1 text-sm font-semibold text-ink-2">ml</span>
          </div>
          <input
            type="range"
            min={50}
            max={1500}
            step={10}
            value={customMl}
            onChange={(e) => setCustomMl(Number(e.target.value))}
            className="w-full accent-[rgb(var(--c-accent))]"
            aria-label="容量（ml）"
          />
          <div className="grid grid-cols-4 gap-2">
            {[100, 200, 300, 600].map((ml) => (
              <button
                key={ml}
                onClick={() => setCustomMl(ml)}
                className="rounded-full border border-line bg-surface-2 py-2 text-sm font-semibold text-ink-2 hover:text-ink"
              >
                <span className="font-num">{formatVolume(ml, unit)}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              onAdd(customMl);
              setCustomOpen(false);
            }}
          >
            記錄 {customMl} ml
          </Button>
        </div>
      </Modal>
    </div>
  );
}
