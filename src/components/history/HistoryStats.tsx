"use client";

import { GlowCard } from "@/components/ui/GlowCard";
import type { VolumeUnit } from "@/types";
import { formatVolume } from "@/lib/units";

export function HistoryStats({
  weekAvg,
  bestStreak,
  monthTotalMl,
  unit,
}: {
  weekAvg: number | null;
  bestStreak: number;
  monthTotalMl: number;
  unit: VolumeUnit;
}) {
  const items = [
    {
      label: "本週達成率",
      value: weekAvg === null ? "—" : `${Math.round(weekAvg * 100)}%`,
    },
    { label: "最佳連續", value: `${bestStreak} 天` },
    { label: "本月總量", value: formatVolume(monthTotalMl, unit) },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <GlowCard key={item.label} className="flex flex-col gap-1 px-3.5 py-4">
          <span className="whitespace-nowrap text-xs font-semibold text-ink-3">
            {item.label}
          </span>
          <span className="font-num text-lg font-bold leading-tight text-ink">
            {item.value}
          </span>
        </GlowCard>
      ))}
    </div>
  );
}
