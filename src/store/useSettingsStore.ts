"use client";

import { create } from "zustand";
import type {
  DrinkType,
  ReminderSettings,
  Settings,
  ThemeMode,
  UserGoal,
  VolumeUnit,
} from "@/types";
import { getDataProvider } from "@/lib/data";
import {
  DEFAULT_DRINK_TYPES,
  DEFAULT_SETTINGS,
  LEGACY_ICON_MAP,
  LEGACY_NAME_MAP,
} from "@/lib/defaults";

/** 舊版中文名稱 / emoji 圖示 → 英文名稱 / icon key 的一次性遷移 */
function migrateTypes(types: DrinkType[]): { types: DrinkType[]; changed: boolean } {
  let changed = false;
  const next = types.map((t) => {
    const name = LEGACY_NAME_MAP[t.name] ?? t.name;
    const icon = LEGACY_ICON_MAP[t.icon] ?? t.icon;
    if (name !== t.name || icon !== t.icon) {
      changed = true;
      return { ...t, name, icon };
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
    set({
      hydrated: true,
      settings: saved
        ? { ...DEFAULT_SETTINGS, ...saved, reminder: { ...DEFAULT_SETTINGS.reminder, ...saved.reminder } }
        : DEFAULT_SETTINGS,
      drinkTypes: migrated.types,
    });
    if (migrated.changed) persistTypes(migrated.types);
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
  },

  importAll: (settings, drinkTypes) => {
    set({ settings, drinkTypes });
    persistSettings(settings);
    persistTypes(drinkTypes);
  },

  resetAll: () => {
    set({ settings: DEFAULT_SETTINGS, drinkTypes: DEFAULT_DRINK_TYPES });
    persistSettings(DEFAULT_SETTINGS);
    persistTypes(DEFAULT_DRINK_TYPES);
  },
}));
