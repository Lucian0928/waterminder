"use client";

import { useMemo, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { GlowCard } from "@/components/ui/GlowCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DrinkIcon, DRINK_ICON_KEYS } from "@/components/ui/DrinkIcon";
import { useVolumeUnit } from "@/hooks/useVolumeUnit";
import { mergeWithCatalog, newId } from "@/lib/defaults";
import type { Cup, DrinkType } from "@/types";

const COLOR_CHOICES = [
  "#3B82F6", "#2563EB", "#1D4ED8", "#0EA5E9", "#38BDF8", "#06B6D4", "#14B8A6", "#10B981",
  "#22C55E", "#4ADE80", "#84CC16", "#A3E635", "#EAB308", "#FACC15", "#F59E0B", "#FB923C",
  "#F97316", "#EF4444", "#DC2626", "#F43F5E", "#FB7185", "#EC4899", "#D946EF", "#A855F7",
  "#8B5CF6", "#6366F1", "#92400E", "#B45309", "#57534E", "#334155",
];

/* ── 小元件 ─────────────────────────────────────────── */

function IconCircle({
  type,
  volumeMl,
  size = 40,
}: {
  type: DrinkType;
  volumeMl?: number;
  size?: number;
}) {
  const { fmt } = useVolumeUnit();
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
          {fmt(volumeMl)}
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

/** 設定頁的可點列（帶前導圖示 + 右側值 + chevron） */
function NavRow({
  leading,
  label,
  value,
  onClick,
}: {
  leading?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      {leading}
      <span className="flex-1 font-semibold text-ink">{label}</span>
      {value != null && <span className="text-sm font-semibold text-ink-3">{value}</span>}
      <Chevron />
    </button>
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

type Sheet = "cups" | "drinks" | null;
type Picker = "icon" | "color" | null;

export function DrinksManager() {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const settings = useSettingsStore((s) => s.settings);
  const addDrinkType = useSettingsStore((s) => s.addDrinkType);
  const updateDrinkType = useSettingsStore((s) => s.updateDrinkType);
  const deleteDrinkType = useSettingsStore((s) => s.deleteDrinkType);
  const addCup = useSettingsStore((s) => s.addCup);
  const updateCup = useSettingsStore((s) => s.updateCup);
  const deleteCup = useSettingsStore((s) => s.deleteCup);

  const { label, raw, toMl, fmt, step } = useVolumeUnit();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [cupDraft, setCupDraft] = useState<CupDraft | null>(null);
  const [typeDraft, setTypeDraft] = useState<TypeDraft | null>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [iconQuery, setIconQuery] = useState("");

  const allTypes = useMemo(() => mergeWithCatalog(drinkTypes), [drinkTypes]);
  const typeById = useMemo(() => new Map(allTypes.map((t) => [t.id, t])), [allTypes]);
  const inLibrary = useMemo(() => new Set(drinkTypes.map((t) => t.id)), [drinkTypes]);
  const cups = settings.cups;

  /* ── 儲存 ───────────────────────────────────────── */
  const saveCup = () => {
    if (!cupDraft) return;
    const type = typeById.get(cupDraft.drinkTypeId);
    if (!type) return;
    if (!inLibrary.has(type.id)) addDrinkType({ ...type });
    const volumeMl = Math.max(10, toMl(Number(cupDraft.volume) || 0));
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
    else addDrinkType(type);
    setTypeDraft(null);
  };

  const cupPreviewType = cupDraft ? typeById.get(cupDraft.drinkTypeId) ?? allTypes[0] : undefined;
  const isCustomColor = typeDraft
    ? !COLOR_CHOICES.some((c) => c.toLowerCase() === typeDraft.color.toLowerCase())
    : false;
  const filteredIcons = DRINK_ICON_KEYS.filter((k) =>
    k.includes(iconQuery.trim().toLowerCase())
  );

  const waterType = typeById.get("water") ?? allTypes[0];
  const drinksType = typeById.get("soda") ?? allTypes[0];

  return (
    <>
      {/* ── 摺疊入口 ───────────────────────────────── */}
      <GlowCard className="px-5 py-2">
        <div className="divide-y divide-line">
          <NavRow
            leading={waterType ? <IconCircle type={waterType} size={34} /> : undefined}
            label="My Cup"
            value={String(cups.length)}
            onClick={() => setSheet("cups")}
          />
          <NavRow
            leading={drinksType ? <IconCircle type={drinksType} size={34} /> : undefined}
            label="Drinks"
            onClick={() => setSheet("drinks")}
          />
        </div>
      </GlowCard>

      {/* ── My Cup 清單 ───────────────────────────── */}
      <Modal open={sheet === "cups"} onClose={() => setSheet(null)} title="My Cup">
        <p className="mb-3 text-xs text-ink-3">
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
                      volume: String(raw(cup.volumeMl)),
                    })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <IconCircle type={type} volumeMl={cup.volumeMl} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{cup.name}</span>
                    <span className="font-num block text-xs text-ink-3">
                      {fmt(cup.volumeMl)} · {type.name}
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
              volume: String(raw(allTypes[0]?.defaultVolumeMl ?? 250)),
            })
          }
        >
          ＋ Add Cup
        </Button>
      </Modal>

      {/* ── Drinks 清單 ───────────────────────────── */}
      <Modal open={sheet === "drinks"} onClose={() => setSheet(null)} title="Drinks">
        <p className="mb-3 text-xs text-ink-3">
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
      </Modal>

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
                {cupDraft.volume || 0} {label}
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
              <span className="text-xs font-semibold text-ink-3">Amount ({label})</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={step}
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

      {/* ── Drink 類別編輯器（Icon / Color 改成可點列） ── */}
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

            <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
              <button
                onClick={() => {
                  setIconQuery("");
                  setPicker("icon");
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex-1 text-sm font-semibold text-ink">Icon</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: typeDraft.color }}
                >
                  <DrinkIcon icon={typeDraft.icon} className="h-4 w-4 text-white" />
                </span>
                <Chevron />
              </button>
              <div className="mx-4 h-px bg-line" />
              <button
                onClick={() => setPicker("color")}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex-1 text-sm font-semibold text-ink">Color</span>
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ background: typeDraft.color }}
                />
                <Chevron />
              </button>
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

      {/* ── Icon 選擇器 ───────────────────────────── */}
      <Modal open={picker === "icon"} onClose={() => setPicker(null)} title="Icon">
        {typeDraft && (
          <div className="flex flex-col gap-3">
            <input
              type="search"
              value={iconQuery}
              placeholder="Search"
              onChange={(e) => setIconQuery(e.target.value)}
              className="rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink"
            />
            <div className="grid grid-cols-5 gap-2.5">
              {filteredIcons.map((icon) => {
                const active = icon === typeDraft.icon;
                return (
                  <button
                    key={icon}
                    onClick={() => {
                      setTypeDraft({ ...typeDraft, icon });
                      setPicker(null);
                    }}
                    aria-label={icon}
                    aria-pressed={active}
                    className={`flex aspect-square items-center justify-center rounded-full ${
                      active ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
                    }`}
                    style={{ background: active ? typeDraft.color : "rgb(var(--c-surface-2))" }}
                  >
                    <DrinkIcon
                      icon={icon}
                      className="h-6 w-6"
                      style={{ color: active ? "#fff" : "rgb(var(--c-ink-2))" }}
                    />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-3">No icons found.</p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Color 選擇器 ──────────────────────────── */}
      <Modal open={picker === "color"} onClose={() => setPicker(null)} title="Choose Color">
        {typeDraft && (
          <div className="grid grid-cols-5 gap-3">
            {COLOR_CHOICES.map((color) => {
              const active = typeDraft.color.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  onClick={() => {
                    setTypeDraft({ ...typeDraft, color });
                    setPicker(null);
                  }}
                  aria-label={`Color ${color}`}
                  aria-pressed={active}
                  className={`aspect-square rounded-full transition-transform ${
                    active ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
            {/* 自訂顏色 */}
            <label
              className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full ${
                isCustomColor ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
              }`}
              style={{
                background: isCustomColor
                  ? typeDraft.color
                  : "conic-gradient(from 0deg,#ef4444,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ec4899,#ef4444)",
              }}
              aria-label="Custom color"
            >
              <input
                type="color"
                value={typeDraft.color}
                onChange={(e) => setTypeDraft({ ...typeDraft, color: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              {!isCustomColor && (
                <span className="pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white/90">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-ink" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
