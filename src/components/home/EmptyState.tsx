"use client";

import { GlowCard } from "@/components/ui/GlowCard";

export function EmptyState() {
  return (
    <GlowCard className="flex items-center gap-4 px-5 py-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-2xl">
        💧
      </div>
      <div>
        <p className="font-display text-base font-bold text-ink">
          今天的第一杯，從現在開始
        </p>
        <p className="mt-0.5 text-sm text-ink-2">
          點上方按鈕記錄，起步永遠是最有感的一步。
        </p>
      </div>
    </GlowCard>
  );
}
