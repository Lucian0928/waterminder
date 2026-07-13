import type { DataProvider } from "./dataProvider";
import { IndexedDbProvider } from "./indexedDbProvider";

let provider: DataProvider | null = null;

/** 取得目前的資料層實作（未來雲端同步的切換點） */
export function getDataProvider(): DataProvider {
  if (!provider) provider = new IndexedDbProvider();
  return provider;
}

export type { DataProvider };
