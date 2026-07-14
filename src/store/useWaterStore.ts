"use client";

import { create } from "zustand";
import type { DrinkLog, DrinkType } from "@/types";
import { getDataProvider } from "@/lib/data";
import { newId } from "@/lib/defaults";
import { dateKeyOf } from "@/lib/dates";

interface WaterState {
  hydrated: boolean;
  logs: DrinkLog[];

  hydrate: () => Promise<void>;
  addLog: (drink: DrinkType, volumeMl: number, timestamp?: number) => DrinkLog;
  removeLog: (id: string) => void;
  importLogs: (logs: DrinkLog[]) => void;
  clearLogs: () => void;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  hydrated: false,
  logs: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const logs = await getDataProvider().getAllLogs();
    set({ hydrated: true, logs });
  },

  addLog: (drink, volumeMl, timestamp) => {
    const ts = timestamp ?? Date.now();
    const log: DrinkLog = {
      id: newId(),
      timestamp: ts,
      dateKey: dateKeyOf(ts),
      volumeMl,
      effectiveMl: Math.round(volumeMl * drink.hydrationFactor),
      drinkTypeId: drink.id,
      drinkName: drink.name,
      drinkIcon: drink.icon,
      drinkColor: drink.color,
    };
    set({ logs: [...get().logs, log] });
    void getDataProvider().addLog(log);
    return log;
  },

  removeLog: (id) => {
    set({ logs: get().logs.filter((l) => l.id !== id) });
    void getDataProvider().deleteLog(id);
  },

  importLogs: (logs) => {
    set({ logs });
    void getDataProvider().replaceLogs(logs);
  },

  clearLogs: () => {
    set({ logs: [] });
    void getDataProvider().replaceLogs([]);
  },
}));
