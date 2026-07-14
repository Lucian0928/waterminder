"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

const ACTIVE_COLOR = "#1C6EF7";
const OPT_W = 56;
const PILL_PAD = 3;

function DrippingIcon() {
  return (
    <svg width="22" height="25" viewBox="0 0 22 25" fill="none" aria-hidden>
      <path
        d="M11 2C11 2 3 10.8 3 16C3 20.4 6.58 24 11 24C15.42 24 19 20.4 19 16C19 10.8 11 2 11 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M11 24V26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M11 26C11 26 9 26 8.5 26.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatisticsIcon() {
  return (
    <svg width="24" height="22" viewBox="0 0 24 22" fill="none" aria-hidden>
      <rect x="1.5" y="12" width="4.5" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.75" y="7" width="4.5" height="14" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="18" y="2" width="4.5" height="19" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5L13.6 6.2C14.1 6.32 14.57 6.52 15 6.78L18.8 5.58L21.2 9.7L18.1 12.2C18.2 12.8 18.2 13.4 18.1 14L21.2 16.5L18.8 20.6L15 19.4C14.57 19.66 14.1 19.86 13.6 19.98L12 23.5L10.4 19.98C9.9 19.86 9.43 19.66 9 19.4L5.2 20.6L2.8 16.5L5.9 14C5.8 13.4 5.8 12.8 5.9 12.2L2.8 9.7L5.2 5.58L9 6.78C9.43 6.52 9.9 6.32 10.4 6.2L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "Today", Icon: DrippingIcon },
  { href: "/history", label: "History", Icon: StatisticsIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const rawIndex = TABS.findIndex((t) => t.href === pathname);
  const activeIndex = rawIndex === -1 ? 0 : rawIndex;

  const [liveOffset, setLiveOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startIndex = useRef(0);

  const onBubblePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startIndex.current = activeIndex;
    setDragging(true);
    setLiveOffset(0);
  };

  const onBubblePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    const maxRight = (TABS.length - 1 - startIndex.current) * OPT_W;
    const maxLeft = -startIndex.current * OPT_W;
    setLiveOffset(clamp(delta, maxLeft, maxRight));
  };

  const onBubblePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    const steps = Math.round(delta / OPT_W);
    const newIndex = clamp(startIndex.current + steps, 0, TABS.length - 1);
    setDragging(false);
    setLiveOffset(0);
    const target = TABS[newIndex].href;
    if (target !== pathname) router.push(target);
  };

  const displayIndex = dragging
    ? clamp(startIndex.current + Math.round(liveOffset / OPT_W), 0, TABS.length - 1)
    : activeIndex;

  const bubbleTranslate = dragging ? activeIndex * OPT_W + liveOffset : activeIndex * OPT_W;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Main navigation"
    >
      <div
        className="glass-pill relative flex items-center rounded-full"
        style={{ padding: PILL_PAD, width: OPT_W * TABS.length + PILL_PAD * 2 }}
      >
        <div
          className="tab-bubble absolute"
          onPointerDown={onBubblePointerDown}
          onPointerMove={onBubblePointerMove}
          onPointerUp={onBubblePointerUp}
          onPointerCancel={onBubblePointerUp}
          style={{
            top: PILL_PAD,
            left: PILL_PAD,
            width: OPT_W,
            height: `calc(100% - ${PILL_PAD * 2}px)`,
            zIndex: 2,
            cursor: dragging ? "grabbing" : "grab",
            transform: `translateX(${bubbleTranslate}px)`,
            transition: dragging ? "none" : "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />

        {TABS.map((tab, i) => {
          const active = displayIndex === i;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={pathname === tab.href ? "page" : undefined}
              className="tab-icon relative flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: OPT_W,
                height: `calc(100% - ${PILL_PAD * 2}px)`,
                color: active ? ACTIVE_COLOR : undefined,
              }}
            >
              <tab.Icon />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
