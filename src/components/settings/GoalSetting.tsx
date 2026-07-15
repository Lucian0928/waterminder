"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { suggestedIntakeMl } from "@/lib/goal";
import { formatVolume } from "@/lib/units";
import { useVolumeUnit } from "@/hooks/useVolumeUnit";
import type { WeightUnit } from "@/types";

export function GoalSetting() {
  const settings = useSettingsStore((s) => s.settings);
  const setGoal = useSettingsStore((s) => s.setGoal);
  const { label, raw, toMl, step } = useVolumeUnit();

  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    settings.goal.weightUnit ?? "kg"
  );
  const [weight, setWeight] = useState<string>(
    settings.goal.weightValue ? String(settings.goal.weightValue) : ""
  );

  const weightNum = Number(weight);
  const suggested =
    weight !== "" && weightNum > 0
      ? suggestedIntakeMl(weightNum, weightUnit)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-ink-2">Daily goal ({label})</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={raw(settings.goal.dailyTargetMl)}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v) && v > 0) {
              setGoal({ ...settings.goal, dailyTargetMl: toMl(v) });
            }
          }}
          className="font-num w-28 rounded-xl border border-line bg-surface-2 px-3 py-2 text-right text-base font-bold text-ink"
        />
      </label>

      <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
        <p className="text-sm font-semibold text-ink-2">Estimate from body weight</p>
        <div className="mt-3 flex items-center gap-2.5">
          <input
            type="number"
            inputMode="decimal"
            min={1}
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            aria-label={`Weight (${weightUnit})`}
            className="font-num w-24 rounded-xl border border-line bg-surface px-3 py-2 text-right text-base font-bold text-ink"
          />
          <SegmentedControl<WeightUnit>
            options={[
              { value: "kg", label: "kg" },
              { value: "lb", label: "lb" },
            ]}
            value={weightUnit}
            onChange={setWeightUnit}
            className="w-28"
          />
        </div>
        {suggested !== null && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-2">
              Suggested daily intake{" "}
              <span className="font-num font-bold text-accent">
                {formatVolume(suggested, settings.volumeUnit)}
              </span>
            </p>
            <Button
              variant="ghost"
              className="shrink-0 px-4 py-2"
              onClick={() =>
                setGoal({
                  dailyTargetMl: suggested,
                  weightValue: weightNum,
                  weightUnit,
                })
              }
            >
              Apply
            </Button>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-3">
          Formula: kg × 33 ml; lb × 0.5 oz. A reference only — adjust for activity level.
        </p>
      </div>
    </div>
  );
}
