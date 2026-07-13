"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { GlowCard } from "@/components/ui/GlowCard";
import { GoalSetting } from "./GoalSetting";
import { UnitSetting } from "./UnitSetting";
import { DrinkTypeManager } from "./DrinkTypeManager";
import { ReminderSetting } from "./ReminderSetting";
import { ThemeToggle } from "./ThemeToggle";
import { DataSection } from "./DataSection";
import { useHydrated } from "@/hooks/useHydrated";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlowCard className="p-5">
      <h2 className="font-display mb-4 text-base font-bold">{title}</h2>
      {children}
    </GlowCard>
  );
}

export function SettingsContent() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-3">
        載入中…
      </div>
    );
  }

  return (
    <PageTransition className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          設定
        </h1>
      </header>

      <Section title="每日目標">
        <GoalSetting />
      </Section>

      <Section title="單位">
        <UnitSetting />
      </Section>

      <Section title="飲品類型">
        <DrinkTypeManager />
      </Section>

      <Section title="提醒">
        <ReminderSetting />
      </Section>

      <Section title="外觀">
        <ThemeToggle />
      </Section>

      <Section title="資料">
        <DataSection />
      </Section>

      <p className="pb-2 text-center text-xs text-ink-3">
        WaterMinder · 資料儲存在此裝置（IndexedDB）
      </p>
    </PageTransition>
  );
}
