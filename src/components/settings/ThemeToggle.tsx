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
        { value: "dark", label: "深色" },
        { value: "light", label: "淺色" },
      ]}
      value={theme}
      onChange={setTheme}
    />
  );
}
