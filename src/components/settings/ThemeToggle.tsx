"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ThemeMode } from "@/types";

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <SegmentedControl<ThemeMode>
      options={[
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" },
      ]}
      value={theme}
      onChange={setTheme}
    />
  );
}
