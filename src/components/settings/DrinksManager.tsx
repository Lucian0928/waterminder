"use client";

import { useMemo, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { GlowCard } from "@/components/ui/GlowCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DrinkIcon, DRINK_ICON_KEYS } from "@/components/ui/DrinkIcon";
import { cupFromType, mergeWithCatalog, newId } from "@/lib/defaults";
import type { Cup, DrinkType } from "@/types";

const COLOR_CHOICES = [
  "#3B82F6", "#60A5FA", "#0EA5E9", "#06B6D4", "#14B8A6", "#22C55E", "#84CC16", "#EAB308",
  "#F59E0B", "#F97316", "#EF4444", "#F43F5E", "#EC4899", "#A855F7", "#8B5CF6", "#6366F1",
  "#92400E", "#78716C", "#94A3B8", "#334155",
];

/* ── 圖示圓 ─────────────────────────────────────────── */

function IconCircle({
  type,
  volumeMl,
  size = 40,
}: {
  type: DrinkType;
  volumeMl?: number;
  size?: number;
}) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: type.color }}
    >
      <DrinkIcon icon={type.icon} className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
      {volumeMl != null && (
        <span
          className="font-num absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[9px] font-bold text-white"
          style={{ background: type.color, boxShadow: "0 0 0 2px rgb(var(--c-surface))" }}
        >
          {volumeMl}ml
        </span>
      )}
    </span>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ink-3" aria-hidden>
      <path d="m9.5 6 5.5 6-5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 草稿型別 ───────────────────────────────────────── */

interface CupDraft {
  id: string | null;
  drinkTypeId: string;
  name: string;
  volume: string;
}

interface TypeDraft {
  id: string | null;
  name: string;
  icon: string;
  color: string;
  hydration: number; // 0–100
  active: boolean;
  isBuiltIn: boolean;
}

export function DrinksManager() {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const settings = useSettingsStore((s) => s.settings);
  const addDrinkType = useSettingsStore((s) => s.addDrinkType);
  const updateDrinkType = useSettingsStore((s) => s.updateDrinkType);
  const deleteDrinkType = useSettingsStore((s) => s.deleteDrinkType);
  const addCup = useSettingsStore((s) => s.addCup);
  const updateCup = useSettingsStore((s) => s.updateCup);
  const deleteCup = useSettingsStore((s) => s.deleteCup);

  const [cupDraft, setCupDraft] = useState<CupDraft | null>(null);
  const [typeDraft, setTypeDraft] = useState<TypeDraft | null>(null);

  /* 全部飲品類別（使用者杯型 + 內建目錄，依 id 去重） */
  const allTypes = useMemo(() => mergeWithCatalog(drinkTypes), [drinkTypes]);
  const typeById = useMemo(() => new Map(allTypes.map((t) => [t.id, t])), [allTypes]);
  const inLibrary = useMemo(() => new Set(drinkTypes.map((t) => t.id)), [drinkTypes]);

  const cups = settings.cups;

  /* ── Cup 儲存 ───────────────────────────────────── */
  const saveCup = () => {
    if (!cupDraft) return;
    const type = typeById.get(cupDraft.drinkTypeId);
    if (!type) return;
    if (!inLibrary.has(type.id)) addDrinkType({ ...type }); // 確保 Home 能解析
    const volumeMl = Math.max(10, Math.round(Number(cupDraft.volume) || 0));
    const cup: Cup = {
      id: cupDraft.id ?? newId(),
      drinkTypeId: type.id,
      name: cupDraft.name.trim() || type.name,
      volumeMl,
    };
    if (cupDraft.id) updateCup(cup);
    else addCup(cup);
    setCupDraft(null);
  };

  /* ── Type 儲存 ──────────────────────────────────── */
  const saveType = () => {
    if (!typeDraft) return;
    const existing = typeById.get(typeDraft.id ?? "");
    const type: DrinkType = {
      id: typeDraft.id ?? newId(),
      name: typeDraft.name.trim() || "Untitled",
      defaultVolumeMl: existing?.defaultVolumeMl ?? 300,
      icon: typeDraft.icon,
      color: typeDraft.color,
      hydrationFactor: typeDraft.hydration / 100,
      active: typeDraft.active,
      isBuiltIn: typeDraft.isBuiltIn,
    };
    if (typeDraft.id && inLibrary.has(typeDraft.id)) updateDrinkType(type);
    else addDrinkType(type); // 目錄類別首次編輯 → 加入使用者清單
    setTypeDraft(null);
  };

  const cupPreviewType =
    cupDraft ? typeById.get(cupDraft.drinkTypeId) ?? allTypes[0] : undefined;

  return (
    <>
      {/* ── My Cup ─────────────────────────────────── */}
      <GlowCard className="p-5">
        <h2 className="font-display mb-1 text-base font-bold">My Cup</h2>
        <p className="mb-4 text-xs text-ink-3">
          Quick-add shortcuts on your Home screen. Each cup is a drink at a set amount.
        </p>

        <ul className="flex flex-col gap-2">
          {cups.map((cup) => {
            const type = typeById.get(cup.drinkTypeId);
            if (!type) return null;
            return (
              <li
                key={cup.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-3.5 py-3"
              >
                <button
                  onClick={() =>
                    setCupDraft({
                      id: cup.id,
                      drinkTypeId: cup.drinkTypeId,
                      name: cup.name,
                      volume: String(cup.volumeMl),
                    })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <IconCircle type={type} volumeMl={cup.volumeMl} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{cup.name}</span>
                    <span className="font-num block text-xs text-ink-3">
                      {cup.volumeMl} ml · {type.name}
                    </span>
                  </span>
                  <Chevron />
                </button>
                <button
                  onClick={() => deleteCup(cup.id)}
                  aria-label={`Remove ${cup.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink-3 transition-colors hover:text-ink"
                >
                  <CloseIcon />
                </button>
              </li>
            );
          })}
        </ul>

        <Button
          variant="ghost"
          className="mt-3 w-full"
          onClick={() =>
            setCupDraft({
              id: null,
              drinkTypeId: allTypes[0]?.id ?? "water",
              name: "",
              volume: String(allTypes[0]?.defaultVolumeMl ?? 250),
            })
          }
        >
          ＋ Add Cup
        </Button>
      </GlowCard>

      {/* ── Drinks ─────────────────────────────────── */}
      <GlowCard className="p-5">
        <h2 className="font-display mb-1 text-base font-bold">Drinks</h2>
        <p className="mb-4 text-xs text-ink-3">
          Every drink type you can log. Tap to edit its icon, color and hydration.
        </p>

        <ul className="flex flex-col gap-2">
          {allTypes.map((t) => (
            <li key={t.id}>
              <button
                onClick={() =>
                  setTypeDraft({
                    id: t.id,
                    name: t.name,
                    icon: t.icon,
                    color: t.color,
                    hydration: Math.round(t.hydrationFactor * 100),
                    active: t.active,
                    isBuiltIn: t.isBuiltIn,
                  })
                }
                className={`flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-3.5 py-3 text-left transition-colors hover:border-accent/40 ${
                  t.active ? "" : "opacity-50"
                }`}
              >
                <IconCircle type={t} />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{t.name}</span>
                {!t.active && <span className="text-xs font-semibold text-ink-3">Off</span>}
                <Chevron />
              </button>
            </li>
          ))}
        </ul>

        <Button
          variant="ghost"
          className="mt-3 w-full"
          onClick={() =>
            setTypeDraft({
              id: null,
              name: "",
              icon: "water",
              color: "#3B82F6",
              hydration: 100,
              active: true,
              isBuiltIn: false,
            })
          }
        >
          ＋ Drink
        </Button>
      </GlowCard>

      {/* ── Cup 編輯器 ─────────────────────────────── */}
      <Modal
        open={cupDraft !== null}
        onClose={() => setCupDraft(null)}
        title={cupDraft?.id ? "Edit Cup" : "New Cup"}
      >
        {cupDraft && cupPreviewType && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 pt-1">
              <IconCircle type={cupPreviewType} size={72} />
              <span className="font-num pt-1 text-lg font-bold text-ink">
                {Math.max(0, Math.round(Number(cupDraft.volume) || 0))}ml
              </span>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Name</span>
              <input
                type="text"
                value={cupDraft.name}
                maxLength={20}
                placeholder={cupPreviewType.name}
                onChange={(e) => setCupDraft({ ...cupDraft, name: e.target.value })}
                className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>

            <div>
              <span className="text-xs font-semibold text-ink-3">Drink Type</span>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                {allTypes.map((t) => {
                  const active = t.id === cupDraft.drinkTypeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        setCupDraft({
                          ...cupDraft,
                          drinkTypeId: t.id,
                          // 名稱若仍是預設，跟著換
                          name:
                            cupDraft.name === "" || cupDraft.name === cupPreviewType.name
                              ? t.name
                              : cupDraft.name,
                        })
                      }
                      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-2 text-xs font-semibold"
                      style={{
                        background: active ? "rgb(var(--c-surface))" : "rgb(var(--c-surface-2))",
                        color: active ? "rgb(var(--c-accent))" : "rgb(var(--c-ink-2))",
                        border: active ? "2px solid rgb(var(--c-accent))" : "2px solid transparent",
                      }}
                    >
                      <DrinkIcon
                        icon={t.icon}
                        className="h-4 w-4"
                        style={{ color: active ? "rgb(var(--c-accent))" : t.color }}
                      />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Amount (ml)</span>
              <input
                type="number"
                inputMode="numeric"
                min={10}
                step={10}
                value={cupDraft.volume}
                onChange={(e) => setCupDraft({ ...cupDraft, volume: e.target.value })}
                className="font-num rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-bold text-ink"
              />
            </label>

            <div className="flex gap-2.5">
              {cupDraft.id && (
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteCup(cupDraft.id!);
                    setCupDraft(null);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button className="flex-1" onClick={saveCup}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Drink 類別編輯器 ───────────────────────── */}
      <Modal
        open={typeDraft !== null}
        onClose={() => setTypeDraft(null)}
        title={typeDraft?.id ? "Edit Drink" : "New Drink"}
      >
        {typeDraft && (
          <div className="flex flex-col gap-5">
            <button
              onClick={() => setTypeDraft({ ...typeDraft, active: !typeDraft.active })}
              className="flex items-center justify-between rounded-2xl border border-line bg-surface-2 px-4 py-3"
            >
              <span className="text-sm font-semibold text-ink">Active</span>
              <span
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  typeDraft.active ? "bg-accent" : "bg-surface"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    typeDraft.active ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-3">Name</span>
              <input
                type="text"
                value={typeDraft.name}
                maxLength={20}
                placeholder="e.g. Matcha Latte"
                onChange={(e) => setTypeDraft({ ...typeDraft, name: e.target.value })}
                className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-ink"
              />
            </label>

            <div>
              <span className="text-xs font-semibold text-ink-3">Icon</span>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {DRINK_ICON_KEYS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setTypeDraft({ ...typeDraft, icon })}
                    aria-label={icon}
                    aria-pressed={typeDraft.icon === icon}
                    className={`flex h-11 items-center justify-center rounded-xl border transition-all ${
                      typeDraft.icon === icon ? "border-accent bg-accent/10" : "border-line bg-surface-2"
                    }`}
                    style={{ color: typeDraft.icon === icon ? typeDraft.color : "rgb(var(--c-ink-2))" }}
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
                    onClick={() => setTypeDraft({ ...typeDraft, color })}
                    aria-label={`Color ${color}`}
                    aria-pressed={typeDraft.color === color}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      typeDraft.color === color
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
                <span className="text-xs font-semibold text-ink-3">Hydration Impact</span>
                <span className="font-num text-sm font-bold text-accent">
                  {(typeDraft.hydration / 100).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={typeDraft.hydration}
                onChange={(e) => setTypeDraft({ ...typeDraft, hydration: Number(e.target.value) })}
                className="mt-2 w-full accent-[rgb(var(--c-accent))]"
                aria-label="Hydration impact"
              />
              <p className="mt-1.5 text-xs text-ink-3">
                Counted water = amount × hydration impact (coffee and sugary drinks are
                usually below 1).
              </p>
            </div>

            <div className="flex gap-2.5">
              {typeDraft.id && !typeDraft.isBuiltIn && (
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteDrinkType(typeDraft.id!);
                    setTypeDraft(null);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button className="flex-1" onClick={saveType}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
