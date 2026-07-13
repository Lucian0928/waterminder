"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { newId } from "@/lib/defaults";
import type { DrinkType } from "@/types";

const ICON_CHOICES = ["💧", "🫧", "🍵", "☕", "🧃", "🥛", "🥤", "🍺", "🍶", "🧋", "🥥", "🍋"];
const COLOR_CHOICES = [
  "#00d4b8",
  "#38bdf8",
  "#7c8cff",
  "#a78bfa",
  "#a3e635",
  "#f59e0b",
  "#fb7185",
  "#e2e8f0",
];

interface Draft {
  id: string | null; // null = 新增
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
  icon: "💧",
  color: "#00d4b8",
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
      name: draft.name.trim() || "未命名",
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
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${t.color}1f` }}
              >
                {t.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{t.name}</span>
                <span className="font-num block text-xs text-ink-3">
                  {t.defaultVolumeMl} ml · 水合 {Math.round(t.hydrationFactor * 100)}%
                </span>
              </span>
              <span className="text-ink-3">›</span>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" onClick={() => setDraft(EMPTY_DRAFT)}>
        ＋ 新增杯型
      </Button>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "編輯杯型" : "新增杯型"}
      >
        {draft && (
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">名稱</span>
              <input
                type="text"
                value={draft.name}
                maxLength={12}
                placeholder="例如：運動水壺"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">
                預設容量（ml）
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
              <span className="text-xs font-semibold text-ink-3">圖示</span>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {ICON_CHOICES.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setDraft({ ...draft, icon })}
                    aria-pressed={draft.icon === icon}
                    className={`flex h-11 items-center justify-center rounded-xl border text-xl transition-all ${
                      draft.icon === icon
                        ? "border-accent bg-accent/10"
                        : "border-line bg-surface-2"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-ink-3">顏色</span>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {COLOR_CHOICES.map((color) => (
                  <button
                    key={color}
                    onClick={() => setDraft({ ...draft, color })}
                    aria-label={`顏色 ${color}`}
                    aria-pressed={draft.color === color}
                    className={`h-9 w-9 rounded-full transition-transform ${
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
                  水合係數
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
                aria-label="水合係數（%）"
              />
              <p className="mt-1.5 text-xs text-ink-3">
                實際計入的水量 = 容量 × 水合係數（咖啡、含糖飲料通常低於 100%）
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
                  刪除
                </Button>
              )}
              <Button className="flex-1" onClick={save}>
                儲存
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
