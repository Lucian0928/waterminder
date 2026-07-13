"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { VolumeUnit } from "@/types";

export function UnitSetting() {
  const unit = useSettingsStore((s) => s.settings.volumeUnit);
  const setVolumeUnit = useSettingsStore((s) => s.setVolumeUnit);

  return (
    <SegmentedControl<VolumeUnit>
      options={[
        { value: "ml", label: "ml" },
        { value: "L", label: "L" },
        { value: "oz", label: "US oz" },
      ]}
      value={unit}
      onChange={setVolumeUnit}
    />
  );
}
