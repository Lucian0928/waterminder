/**
 * Apple Health 同步（免付費方案）：
 * Web App 無法直接存取 HealthKit，改由「捷徑」App 當橋樑。
 * 我們用 x-callback-url 開啟使用者的捷徑，把要記錄的毫升數當文字輸入傳進去，
 * 捷徑內用「記錄健康範例 → 水」寫入健康 App。
 *
 * 傳進捷徑的值一律是「毫升（ml）」的整數字串，捷徑端以毫升為單位記錄即可。
 */
export function healthShortcutUrl(shortcutName: string, ml: number): string {
  const name = encodeURIComponent(shortcutName.trim());
  const text = encodeURIComponent(String(Math.round(ml)));
  return `shortcuts://run-shortcut?name=${name}&input=text&text=${text}`;
}

/** 開啟捷徑並把毫升數送進去（會短暫切到「捷徑」App 再返回） */
export function runHealthShortcut(shortcutName: string, ml: number): void {
  if (typeof window === "undefined") return;
  window.location.href = healthShortcutUrl(shortcutName, ml);
}
