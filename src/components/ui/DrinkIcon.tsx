import type { CSSProperties, ReactNode } from "react";

/**
 * 線條風格飲品圖示（stroke: currentColor）。
 * DrinkType.icon 存 registry key；舊資料若還是 emoji 字串則原樣顯示。
 */
const ICONS: Record<string, ReactNode> = {
  water: (
    <path d="M12 3c0 0-6.5 7.2-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3 12 3Z" />
  ),
  sparkling: (
    <>
      <path d="M12 3c0 0-6.5 7.2-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3 12 3Z" />
      <circle cx="10" cy="14.6" r="1.15" />
      <circle cx="13.9" cy="12.6" r="0.85" />
      <circle cx="12.8" cy="16.8" r="0.8" />
    </>
  ),
  tea: (
    <>
      <path d="M5 9.5h11v3.5a5.5 5.5 0 0 1-11 0V9.5Z" />
      <path d="M16 10.5h1.4a2.3 2.3 0 0 1 0 4.6h-1.6" />
      <path d="M4.5 21h14" />
      <path d="M10.5 6.5c-2 0-3-1.2-3-3 2 0 3 1.2 3 3Zm0 0c0-1.8 1-3 3-3 0 1.8-1 3-3 3Z" />
    </>
  ),
  coffee: (
    <>
      <path d="M6.6 5h10.8l.6 3H6L6.6 5Z" />
      <path d="M6.3 8h11.4l-1.2 12.5H7.5L6.3 8Z" />
      <path d="M7 13h10" />
    </>
  ),
  juice: (
    <>
      <path d="M7 7.5h10l-1.3 13.5H8.3L7 7.5Z" />
      <path d="m13.5 7.5 2.4-5 1.9.8" />
      <path d="M7.5 12.5h9" />
    </>
  ),
  milk: (
    <>
      <path d="M8 3h8l2 5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V8l2-5Z" />
      <path d="M6 8h12" />
      <path d="M12 3v5" />
    </>
  ),
  soda: (
    <>
      <path d="M6.5 8h11l-.4-2.6H6.9L6.5 8Z" />
      <path d="M7 8h10l-1.3 13H8.3L7 8Z" />
      <path d="m12.4 5.4 1.7-4 1.9.7" />
    </>
  ),
  smoothie: (
    <>
      <path d="M7.5 5h9l-1 16h-7l-1-16Z" />
      <path d="m12.6 5 1.9-3.4" />
      <circle cx="16.4" cy="4.2" r="1.7" />
      <path d="M8 10.5c1.2.9 2.6.9 3.8 0s2.7-.9 3.9 0" />
    </>
  ),
  boba: (
    <>
      <path d="M7.5 6.5h9l-1 14.5h-7l-1-14.5Z" />
      <path d="m11.4 6.5 1.6-4.6 2 .7" />
      <circle cx="10.6" cy="17.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.3" cy="18.3" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.3" cy="15.4" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  "iced-tea": (
    <>
      <path d="M7 4h10l-1.2 17H8.2L7 4Z" />
      <path d="m9.7 9.6 2.3-1.4 2.3 1.4v2.6l-2.3 1.4-2.3-1.4V9.6Z" />
      <path d="M8 16.5h8" />
    </>
  ),
  lemonade: (
    <>
      <path d="M7 8h10l-1.3 13H8.3L7 8Z" />
      <circle cx="15.9" cy="5.8" r="2.6" />
      <path d="M15.9 3.2v5.2M13.3 5.8h5.2" />
    </>
  ),
  coconut: (
    <>
      <circle cx="12" cy="14" r="7.5" />
      <path d="m13.8 6.9 2.5-5 1.9.8" />
      <circle cx="10" cy="12.6" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="12.2" r="0.65" fill="currentColor" stroke="none" />
    </>
  ),
  sports: (
    <>
      <path d="M10 2.5h4v2.5h-4V2.5Z" />
      <path d="M9 7.5 10 5h4l1 2.5c1.2 1.2 2 2.8 2 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 18.5v-7c0-1.7.8-3.3 2-4.5Z" />
      <path d="M7.4 12.5h9.2M7.4 16h9.2" />
    </>
  ),
  energy: (
    <>
      <path d="M7.5 6.5h9V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V6.5Z" />
      <path d="M7.2 4.5h9.6l-.3 2H7.5l-.3-2Z" />
      <path d="M13 9.5 10.4 13.6h2l-1.1 3.9 2.9-4.4h-2l.8-3.6Z" fill="currentColor" stroke="none" />
    </>
  ),
  "hot-chocolate": (
    <>
      <path d="M5.5 9h11v7a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V9Z" />
      <path d="M16.5 10.5h.8a2.5 2.5 0 0 1 0 5h-1" />
      <path d="M9 3.2c-.6.8-.6 1.7 0 2.5M12.5 3.2c-.6.8-.6 1.7 0 2.5" />
    </>
  ),
  soup: (
    <>
      <path d="M4.5 12h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M9.5 4.2c-.6.9-.6 1.9 0 2.8M13.5 4.2c-.6.9-.6 1.9 0 2.8" />
      <path d="m19.5 12 2-2" />
    </>
  ),
  yogurt: (
    <>
      <path d="M9.5 3h5v3l1.2 2.2V19a2 2 0 0 1-2 2h-3.4a2 2 0 0 1-2-2V8.2L9.5 6V3Z" />
      <path d="M8.3 8.2h7.4" />
    </>
  ),
  beer: (
    <>
      <path d="M7 6.5h9V20a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7 20V6.5Z" />
      <path d="M16 9.5h1.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H16" />
      <path d="M7 6.3c.8-.9 2-.9 2.8 0 .8.9 2.1.9 2.9 0 .8-.9 2-.9 2.8 0" />
      <path d="M10 10.5v7M13 10.5v7" />
    </>
  ),
  wine: (
    <>
      <path d="M7.5 3h9c.3 4.9-1.5 8-4.5 8s-4.8-3.1-4.5-8Z" />
      <path d="M12 11v9.5" />
      <path d="M8.5 20.5h7" />
    </>
  ),
  glass: <path d="M7.5 4h9l-1.1 15.5a1 1 0 0 1-1 .9H9.6a1 1 0 0 1-1-.9L7.5 4Z" />,
  "glass-half": (
    <>
      <path d="M7.5 4h9l-1.1 15.5a1 1 0 0 1-1 .9H9.6a1 1 0 0 1-1-.9L7.5 4Z" />
      <path d="M8.1 11h7.8" />
    </>
  ),
  mug: (
    <>
      <path d="M6.5 6.5h8.5v9a4 4 0 0 1-4 4h-.5a4 4 0 0 1-4-4v-9Z" />
      <path d="M15 8.5h1.8a2.4 2.4 0 0 1 0 4.8H15" />
    </>
  ),
  espresso: (
    <>
      <path d="M7 9.5h7v2.5a3.5 3.5 0 0 1-7 0V9.5Z" />
      <path d="M14 10.3h1.4a2 2 0 0 1 0 4H14" />
      <path d="M5.5 18h11" />
    </>
  ),
  latte: (
    <>
      <path d="M8 4h8l-1 15.6a1 1 0 0 1-1 .9h-4a1 1 0 0 1-1-.9L8 4Z" />
      <path d="M8.5 9h7M8.8 13h6.4" />
    </>
  ),
  takeaway: (
    <>
      <path d="M7 8h10l-1.1 12.1a1 1 0 0 1-1 .9H9.1a1 1 0 0 1-1-.9L7 8Z" />
      <path d="M6.4 8h11.2l-.3-2.4H6.7L6.4 8Z" />
      <path d="M13 5.6V2.4" />
    </>
  ),
  can: (
    <>
      <path d="M8 5.5h8v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-14Z" />
      <path d="M8 8.2h8" />
      <path d="M10 5.5 10.4 3.5h3.2L14 5.5" />
    </>
  ),
  cola: (
    <>
      <path d="M10 2.5h4v1.8l1.3 1.9c.7 1 1 2.1 1 3.3V19a2.5 2.5 0 0 1-2.5 2.5h-3.6A2.5 2.5 0 0 1 7.7 19V9.5c0-1.2.3-2.3 1-3.3L10 4.3V2.5Z" />
      <path d="M7.8 12h8.4v3.8H7.8z" />
    </>
  ),
  cocktail: (
    <>
      <path d="M4.8 5h14.4L12 12.3 4.8 5Z" />
      <path d="M12 12.3V20M8.3 20h7.4" />
    </>
  ),
  margarita: (
    <>
      <path d="M5.5 7.5c0 3.4 2.9 5.5 6.5 5.5s6.5-2.1 6.5-5.5H5.5Z" />
      <path d="M12 13v7M8 20h8" />
    </>
  ),
  champagne: (
    <>
      <path d="M9.5 3h5l-.5 8.5a2 2 0 0 1-4 0L9.5 3Z" />
      <path d="M12 13.5V20M9.7 20h4.6" />
    </>
  ),
  whiskey: (
    <>
      <path d="M7 7.5h10l-.7 11.6a1 1 0 0 1-1 .9H8.7a1 1 0 0 1-1-.9L7 7.5Z" />
      <path d="M9.6 11l2.4 2.4M12 11l-2.4 2.4" />
    </>
  ),
  jug: (
    <>
      <path d="M6.8 7.5h7.4l.7 11.6a1.5 1.5 0 0 1-1.5 1.6H7.6a1.5 1.5 0 0 1-1.5-1.6L6.8 7.5Z" />
      <path d="M14.3 9.5h1.9a2.5 2.5 0 0 1 0 5h-1.6" />
      <path d="M6.9 7.5 8 5h4.5" />
    </>
  ),
  thermos: (
    <>
      <path d="M9 3h6v3l-.6 1.2v12.3a1.5 1.5 0 0 1-1.5 1.5h-1.8A1.5 1.5 0 0 1 9.6 19.5V7.2L9 6V3Z" />
      <path d="M9 6h6M9.5 10.5h5" />
    </>
  ),
  protein: (
    <>
      <path d="M8 6.5h8v12.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6.5Z" />
      <path d="M7.6 4.5h8.8l-.5 2H8.1l-.5-2Z" />
      <path d="M8 11h8M8 14.5h8" />
    </>
  ),
  "sports-bottle": (
    <>
      <path d="M9 5.5h6v2.2c1 .6 1.5 1.6 1.5 2.8V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-8.5c0-1.2.5-2.2 1.5-2.8V5.5Z" />
      <path d="M9.5 3.5h5v2h-5z" />
      <path d="M8 12.5h8" />
    </>
  ),
  "baby-bottle": (
    <>
      <path d="M9 8h6v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8Z" />
      <path d="M8.4 8h7.2l-.7-1.6H9.1L8.4 8Z" />
      <path d="M10.5 4.4h3v2h-3z" />
      <path d="M9.5 11.5h5M9.5 14.5h5" />
    </>
  ),
  gallon: (
    <>
      <path d="M7.5 8h9v11a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V8Z" />
      <path d="M10 4h4v4h-4z" />
      <path d="M7.5 14h9" />
    </>
  ),
  apple: (
    <>
      <path d="M12 7.5c-1.3-1.8-4-1.6-5 .2-1.1 2 0 5.6 1.7 7.5.9 1 1.8 1 3.3 1s2.4 0 3.3-1c1.7-1.9 2.8-5.5 1.7-7.5-1-1.8-3.7-2-5-.2Z" />
      <path d="M12 7.5c0-1.4.6-2.6 2-3" />
    </>
  ),
  citrus: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5v15M4.5 12h15M6.9 6.9l10.2 10.2M17.1 6.9 6.9 17.1" />
    </>
  ),
  grape: (
    <>
      <circle cx="9" cy="13" r="1.9" />
      <circle cx="12.5" cy="12" r="1.9" />
      <circle cx="10.7" cy="16.2" r="1.9" />
      <circle cx="14.2" cy="15.2" r="1.9" />
      <path d="M12.3 7v3M12.3 7c.8-1.6 2.4-2.2 4-2.2" />
    </>
  ),
  honey: (
    <>
      <path d="M7.5 8h9v11a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V8Z" />
      <path d="m7 8 1-2.5h8L17 8" />
      <path d="M10 5.5v-2h4v2" />
      <path d="M10 13h4" />
    </>
  ),
  ice: (
    <>
      <rect x="4.5" y="9.5" width="8" height="8" rx="1.6" />
      <rect x="11.5" y="6.5" width="8" height="8" rx="1.6" />
    </>
  ),
  milkshake: (
    <>
      <path d="M7.5 9h9l-1 11.6a1 1 0 0 1-1 .9H9.5a1 1 0 0 1-1-.9L7.5 9Z" />
      <path d="M7 9a5 5 0 0 1 10 0" />
      <path d="M13 8.5V4.5" />
      <circle cx="13" cy="3.4" r="1.2" />
    </>
  ),
  frappe: (
    <>
      <path d="M7.5 8.5h9l-1 12.1a1 1 0 0 1-1 .9h-5a1 1 0 0 1-1-.9L7.5 8.5Z" />
      <path d="M7 8.5c0-2.5 2.2-4 5-4s5 1.5 5 4" />
      <path d="M13.5 4.5V1.8" />
      <path d="M8.6 12.5h6.8" />
    </>
  ),
  carton: (
    <>
      <path d="M8 8h8v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8Z" />
      <path d="m8 8 4-4 4 4" />
      <path d="M12 4v4" />
    </>
  ),
  pint: (
    <>
      <path d="M7.5 5h9l-.8 14.9a1 1 0 0 1-1 .95H9.3a1 1 0 0 1-1-.95L7.5 5Z" />
      <path d="M7.7 9.5h8.6" />
    </>
  ),
  kettle: (
    <>
      <path d="M6 10.5h10.5l-.8 8.1a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 10.5Z" />
      <path d="M6 10.5 4 8" />
      <path d="M10 7.5h4l.4 3h-4.8l.4-3Z" />
      <path d="M11 5.5h2" />
    </>
  ),
  matcha: (
    <>
      <path d="M7 10h10v2.5a5 5 0 0 1-10 0V10Z" />
      <path d="M5.5 17.5h13" />
      <path d="M12 9c-.8-1-2.2-1-3 0m3 0c.8-1 2.2-1 3 0" />
    </>
  ),
};

export const DRINK_ICON_KEYS = Object.keys(ICONS);

export function DrinkIcon({
  icon,
  className,
  style,
}: {
  icon: string;
  className?: string;
  style?: CSSProperties;
}) {
  const content = ICONS[icon];
  if (!content) {
    /* 舊資料的 emoji 字串 → 原樣顯示 */
    return (
      <span className={className} style={style} aria-hidden>
        {icon}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {content}
    </svg>
  );
}
