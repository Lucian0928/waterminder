import { createStore, get, set, del } from "idb-keyval";
import type { DrinkLog, DrinkType, Settings } from "@/types";
import type { DataProvider } from "./dataProvider";

const KEY_LOGS = "logs";
const KEY_SETTINGS = "settings";
const KEY_DRINK_TYPES = "drinkTypes";

const store =
  typeof indexedDB !== "undefined"
    ? createStore("waterminder", "kv")
    : undefined;

export class IndexedDbProvider implements DataProvider {
  async getAllLogs(): Promise<DrinkLog[]> {
    return (await get<DrinkLog[]>(KEY_LOGS, store)) ?? [];
  }

  async addLog(log: DrinkLog): Promise<void> {
    const logs = await this.getAllLogs();
    logs.push(log);
    await set(KEY_LOGS, logs, store);
  }

  async deleteLog(id: string): Promise<void> {
    const logs = await this.getAllLogs();
    await set(
      KEY_LOGS,
      logs.filter((l) => l.id !== id),
      store
    );
  }

  async replaceLogs(logs: DrinkLog[]): Promise<void> {
    await set(KEY_LOGS, logs, store);
  }

  async getSettings(): Promise<Settings | null> {
    return (await get<Settings>(KEY_SETTINGS, store)) ?? null;
  }

  async saveSettings(settings: Settings): Promise<void> {
    await set(KEY_SETTINGS, settings, store);
  }

  async getDrinkTypes(): Promise<DrinkType[] | null> {
    return (await get<DrinkType[]>(KEY_DRINK_TYPES, store)) ?? null;
  }

  async saveDrinkTypes(types: DrinkType[]): Promise<void> {
    await set(KEY_DRINK_TYPES, types, store);
  }

  async clearAll(): Promise<void> {
    await del(KEY_LOGS, store);
    await del(KEY_SETTINGS, store);
    await del(KEY_DRINK_TYPES, store);
  }
}
