"use client";

import { GlowCard } from "@/components/ui/GlowCard";

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <GlowCard className="flex flex-col gap-1 px-4 py-4">
      <span className="text-xs font-semibold text-ink-3">{label}</span>
      <span className="font-num text-2xl font-bold leading-none text-ink">
        {value}
        {suffix && (
          <span className="ml-0.5 text-sm font-semibold text-ink-2">
            {suffix}
          </span>
        )}
      </span>
    </GlowCard>
  );
}

export function StatsCards({
  streak,
  avgAchievement,
  lastLogTime,
}: {
  streak: number;
  avgAchievement: number | null;
  lastLogTime: string | null;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard label="連續達標" value={String(streak)} suffix="天" />
      <StatCard
        label="7 日達成率"
        value={avgAchievement === null ? "—" : String(Math.round(avgAchievement * 100))}
        suffix={avgAchievement === null ? undefined : "%"}
      />
      <StatCard label="最後記錄" value={lastLogTime ?? "—"} />
    </div>
  );
}
