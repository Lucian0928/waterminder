"use client";

import { motion } from "framer-motion";
import { DrinkIcon } from "@/components/ui/DrinkIcon";
import { useVolumeUnit } from "@/hooks/useVolumeUnit";
import type { DrinkType } from "@/types";

/** hex 色 + 透明度 → 卡片粉彩底 */
function tint(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}

export interface CupCard {
  id: string;
  name: string;
  volumeMl: number;
  type: DrinkType;
}

export function DrinkGrid({
  cups,
  onAdd,
  onOther,
}: {
  cups: CupCard[];
  onAdd: (type: DrinkType, volumeMl: number) => void;
  onOther: () => void;
}) {
  const { fmt } = useVolumeUnit();
  return (
    <div className="grid grid-cols-2 gap-3">
      {cups.map((c) => (
        <motion.button
          key={c.id}
          whileTap={{ scale: 0.96 }}
          onClick={() => onAdd(c.type, c.volumeMl)}
          className="flex flex-col gap-1 rounded-2xl p-4 text-left"
          style={{
            background: tint(c.type.color, "2b"),
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold text-ink">{c.name}</span>
            <DrinkIcon icon={c.type.icon} className="h-6 w-6" style={{ color: c.type.color }} />
          </div>
          <span className="font-num text-xl font-bold" style={{ color: c.type.color }}>
            {fmt(c.volumeMl)}
          </span>
        </motion.button>
      ))}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onOther}
        className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-4 text-left"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between">
          <span className="text-sm font-bold text-ink">Other Drinks</span>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
            <circle cx="9" cy="14" r="2" fill="rgb(var(--c-ink-3))" />
            <circle cx="14" cy="14" r="2" fill="rgb(var(--c-ink-3))" />
            <circle cx="19" cy="14" r="2" fill="rgb(var(--c-ink-3))" />
          </svg>
        </div>
        <span className="text-xl font-bold text-ink-2">+ Add</span>
      </motion.button>
    </div>
  );
}
