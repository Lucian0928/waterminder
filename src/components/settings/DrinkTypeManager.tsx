"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DrinkIcon, DRINK_ICON_KEYS } from "@/components/ui/DrinkIcon";
import { newId } from "@/lib/defaults";
import type { DrinkType } from "@/types";

const COLOR_CHOICES = [
  "#3B82F6",
  "#60A5FA",
  "#0EA5E9",
  "#06B6D4",
  "#14B8A6",
  "#22C55E",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#F43F5E",
  "#EC4899",
  "#A855F7",
  "#8B5CF6",
  "#6366F1",
  "#92400E",
  "#78716C",
  "#94A3B8",
  "#334155",
];

interface Draft {
  id: string | null; // null = new
  name: string;
  volume: string;
  icon: string;
  color: string;
  hydration: number; // 0–100
  isBuiltIn: boolean;
}

const EMPTY_DRAFT: Draft = {
  id: null,
  name: "",
  volume: "300",
  icon: "water",
  color: "#3B82F6",
  hydration: 100,
  isBuiltIn: false,
};

export function DrinkTypeManager() {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const addDrinkType = useSettingsStore((s) => s.addDrinkType);
  const updateDrinkType = useSettingsStore((s) => s.updateDrinkType);
  const deleteDrinkType = useSettingsStore((s) => s.deleteDrinkType);

  const [draft, setDraft] = useState<Draft | null>(null);

  const openEdit = (t: DrinkType) =>
    setDraft({
      id: t.id,
      name: t.name,
      volume: String(t.defaultVolumeMl),
      icon: t.icon,
      color: t.color,
      hydration: Math.round(t.hydrationFactor * 100),
      isBuiltIn: t.isBuiltIn,
    });

  const save = () => {
    if (!draft) return;
    const volume = Math.max(10, Math.round(Number(draft.volume) || 0));
    const type: DrinkType = {
      id: draft.id ?? newId(),
      name: draft.name.trim() || "Untitled",
      defaultVolumeMl: volume,
      icon: draft.icon,
      color: draft.color,
      hydrationFactor: draft.hydration / 100,
      isBuiltIn: draft.isBuiltIn,
    };
    if (draft.id) updateDrinkType(type);
    else addDrinkType(type);
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {drinkTypes.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => openEdit(t)}
              className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-3.5 py-3 text-left transition-colors hover:border-accent/40"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${t.color}1f` }}
              >
                <DrinkIcon icon={t.icon} className="h-5 w-5" style={{ color: t.color }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{t.name}</span>
                <span className="font-num block text-xs text-ink-3">
                  {t.defaultVolumeMl} ml · hydration {Math.round(t.hydrationFactor * 100)}%
                </span>
              </span>
              <span className="text-ink-3">›</span>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" onClick={() => setDraft(EMPTY_DRAFT)}>
        ＋ Add Drink
      </Button>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit Drink" : "New Drink"}
      >
        {draft && (
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Name</span>
              <input
                type="text"
                value={draft.name}
                maxLength={20}
                placeholder="e.g. Sports Bottle"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">
                Default volume (ml)
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={10}
                step={10}
                value={draft.volume}
                onChange={(e) => setDraft({ ...draft, volume: e.target.value })}
                className="font-num rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-bold text-ink"
              />
            </label>

            <div>
              <span className="text-xs font-semibold text-ink-3">Icon</span>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {DRINK_ICON_KEYS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setDraft({ ...draft, icon })}
                    aria-label={icon}
                    aria-pressed={draft.icon === icon}
                    className={`flex h-11 items-center justify-center rounded-xl border transition-all ${
                      draft.icon === icon
                        ? "border-accent bg-accent/10"
                        : "border-line bg-surface-2"
                    }`}
                    style={{
                      color: draft.icon === icon ? draft.color : "rgb(var(--c-ink-2))",
                    }}
                  >
                    <DrinkIcon icon={icon} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-ink-3">Color</span>
              <div className="mt-2 grid grid-cols-8 gap-2.5">
                {COLOR_CHOICES.map((color) => (
                  <button
                    key={color}
                    onClick={() => setDraft({ ...draft, color })}
                    aria-label={`Color ${color}`}
                    aria-pressed={draft.color === color}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      draft.color === color
                        ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-3">
                  Hydration factor
                </span>
                <span className="font-num text-sm font-bold text-accent">
                  {draft.hydration}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft.hydration}
                onChange={(e) =>
                  setDraft({ ...draft, hydration: Number(e.target.value) })
                }
                className="mt-2 w-full accent-[rgb(var(--c-accent))]"
                aria-label="Hydration factor (%)"
              />
              <p className="mt-1.5 text-xs text-ink-3">
                Counted water = volume × hydration factor (coffee and sugary
                drinks are usually below 100%).
              </p>
            </div>

            <div className="flex gap-2.5">
              {draft.id && !draft.isBuiltIn && (
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteDrinkType(draft.id!);
                    setDraft(null);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button className="flex-1" onClick={save}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
