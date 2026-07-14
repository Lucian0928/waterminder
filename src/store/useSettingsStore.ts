"use client";

import { create } from "zustand";
import type {
  Cup,
  DrinkType,
  ReminderSettings,
  Settings,
  ThemeMode,
  UserGoal,
  VolumeUnit,
} from "@/types";
import { getDataProvider } from "@/lib/data";
import {
  DEFAULT_CUPS,
  DEFAULT_DRINK_TYPES,
  DEFAULT_SETTINGS,
  LEGACY_ICON_MAP,
  LEGACY_NAME_MAP,
  cupFromType,
} from "@/lib/defaults";

/** 舊版中文名稱 / emoji 圖示、缺少 active 欄位的一次性遷移 */
function migrateTypes(types: DrinkType[]): { types: DrinkType[]; changed: boolean } {
  let changed = false;
  const next = types.map((t) => {
    const name = LEGACY_NAME_MAP[t.name] ?? t.name;
    const icon = LEGACY_ICON_MAP[t.icon] ?? t.icon;
    const active = t.active ?? true;
    if (name !== t.name || icon !== t.icon || active !== t.active) {
      changed = true;
      return { ...t, name, icon, active };
    }
    return t;
  });
  return { types: next, changed };
}

interface SettingsState {
  hydrated: boolean;
  settings: Settings;
  drinkTypes: DrinkType[];

  hydrate: () => Promise<void>;
  setGoal: (goal: UserGoal) => void;
  setVolumeUnit: (unit: VolumeUnit) => void;
  setTheme: (theme: ThemeMode) => void;
  setReminder: (reminder: ReminderSettings) => void;
  setCups: (cups: Cup[]) => void;
  addCup: (cup: Cup) => void;
  updateCup: (cup: Cup) => void;
  deleteCup: (id: string) => void;
  addDrinkType: (type: DrinkType) => void;
  updateDrinkType: (type: DrinkType) => void;
  deleteDrinkType: (id: string) => void;
  importAll: (settings: Settings, drinkTypes: DrinkType[]) => void;
  resetAll: () => void;
}

function persistSettings(settings: Settings) {
  void getDataProvider().saveSettings(settings);
}
function persistTypes(types: DrinkType[]) {
  void getDataProvider().saveDrinkTypes(types);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  drinkTypes: DEFAULT_DRINK_TYPES,

  hydrate: async () => {
    if (get().hydrated) return;
    const provider = getDataProvider();
    const [saved, types] = await Promise.all([
      provider.getSettings(),
      provider.getDrinkTypes(),
    ]);
    const migrated =
      types && types.length > 0
        ? migrateTypes(types)
        : { types: DEFAULT_DRINK_TYPES, changed: false };

    let settings: Settings = saved
      ? { ...DEFAULT_SETTINGS, ...saved, reminder: { ...DEFAULT_SETTINGS.reminder, ...saved.reminder } }
      : DEFAULT_SETTINGS;

    /* 遷移 My Cup：舊資料是 cupIds（string[]）或缺少 cups → 轉成 Cup[] */
    let cupChanged = false;
    if (!Array.isArray(settings.cups) || settings.cups.length === 0) {
      const legacyIds = (saved as unknown as { cupIds?: string[] } | null)?.cupIds;
      if (Array.isArray(legacyIds) && legacyIds.length > 0) {
        settings = {
          ...settings,
          cups: legacyIds
            .map((id) => migrated.types.find((t) => t.id === id))
            .filter((t): t is DrinkType => Boolean(t))
            .map((t) => cupFromType(t)),
        };
      } else {
        settings = { ...settings, cups: DEFAULT_CUPS };
      }
      cupChanged = saved != null;
    }
    // 清掉遺留的舊欄位
    delete (settings as unknown as { cupIds?: string[] }).cupIds;

    set({ hydrated: true, settings, drinkTypes: migrated.types });
    if (migrated.changed) persistTypes(migrated.types);
    if (cupChanged) persistSettings(settings);
  },

  setGoal: (goal) => {
    const settings = { ...get().settings, goal };
    set({ settings });
    persistSettings(settings);
  },

  setVolumeUnit: (volumeUnit) => {
    const settings = { ...get().settings, volumeUnit };
    set({ settings });
    persistSettings(settings);
  },

  setTheme: (theme) => {
    const settings = { ...get().settings, theme };
    set({ settings });
    persistSettings(settings);
  },

  setReminder: (reminder) => {
    const settings = { ...get().settings, reminder };
    set({ settings });
    persistSettings(settings);
  },

  setCups: (cups) => {
    const settings = { ...get().settings, cups };
    set({ settings });
    persistSettings(settings);
  },

  addCup: (cup) => get().setCups([...get().settings.cups, cup]),

  updateCup: (cup) =>
    get().setCups(get().settings.cups.map((c) => (c.id === cup.id ? cup : c))),

  deleteCup: (id) =>
    get().setCups(get().settings.cups.filter((c) => c.id !== id)),

  addDrinkType: (type) => {
    const drinkTypes = [...get().drinkTypes, type];
    set({ drinkTypes });
    persistTypes(drinkTypes);
  },

  updateDrinkType: (type) => {
    const drinkTypes = get().drinkTypes.map((t) =>
      t.id === type.id ? type : t
    );
    set({ drinkTypes });
    persistTypes(drinkTypes);
  },

  deleteDrinkType: (id) => {
    const drinkTypes = get().drinkTypes.filter((t) => t.id !== id);
    set({ drinkTypes });
    persistTypes(drinkTypes);
    const { cups } = get().settings;
    if (cups.some((c) => c.drinkTypeId === id)) {
      get().setCups(cups.filter((c) => c.drinkTypeId !== id));
    }
  },

  importAll: (rawSettings, drinkTypes) => {
    const migrated = migrateTypes(drinkTypes).types;
    const legacyIds = (rawSettings as unknown as { cupIds?: string[] }).cupIds;
    const cups =
      Array.isArray(rawSettings.cups) && rawSettings.cups.length > 0
        ? rawSettings.cups
        : Array.isArray(legacyIds) && legacyIds.length > 0
          ? legacyIds
              .map((id) => migrated.find((t) => t.id === id))
              .filter((t): t is DrinkType => Boolean(t))
              .map((t) => cupFromType(t))
          : DEFAULT_CUPS;
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      reminder: { ...DEFAULT_SETTINGS.reminder, ...rawSettings.reminder },
      cups,
    };
    delete (settings as unknown as { cupIds?: string[] }).cupIds;
    set({ settings, drinkTypes: migrated });
    persistSettings(settings);
    persistTypes(drinkTypes);
  },

  resetAll: () => {
    set({ settings: DEFAULT_SETTINGS, drinkTypes: DEFAULT_DRINK_TYPES });
    persistSettings(DEFAULT_SETTINGS);
    persistTypes(DEFAULT_DRINK_TYPES);
  },
}));
