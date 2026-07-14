"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { GlowCard } from "@/components/ui/GlowCard";
import { GoalSetting } from "./GoalSetting";
import { UnitSetting } from "./UnitSetting";
import { DrinksManager } from "./DrinksManager";
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
        Loading…
      </div>
    );
  }

  return (
    <PageTransition className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Settings
        </h1>
      </header>

      <Section title="Daily Goal">
        <GoalSetting />
      </Section>

      <Section title="Units">
        <UnitSetting />
      </Section>

      <DrinksManager />

      <Section title="Reminders">
        <ReminderSetting />
      </Section>

      <Section title="Appearance">
        <ThemeToggle />
      </Section>

      <Section title="Data">
        <DataSection />
      </Section>

      <p className="pb-2 text-center text-xs text-ink-3">
        WaterMinder · Data is stored on this device (IndexedDB)
      </p>
    </PageTransition>
  );
}
