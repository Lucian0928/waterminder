"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  {
    href: "/",
    label: "今日",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 2.7c3.4 4.1 6.5 7.8 6.5 11.4a6.5 6.5 0 1 1-13 0C5.5 10.5 8.6 6.8 12 2.7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 14.4a2.9 2.9 0 0 0 2.4 2.9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "歷史",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 20V10.5M10 20V4.5M16 20v-8M21 20H3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "設定",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 3.2v2.2M12 18.6v2.2M20.8 12h-2.2M5.4 12H3.2M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5M18.2 18.2l-1.5-1.5M7.3 7.3 5.8 5.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="主導覽"
    >
      <div className="glass-pill flex items-center gap-1 rounded-full p-1.5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                active ? "text-bg" : "text-ink-2 hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-accent-deep shadow-[0_0_18px_rgba(0,212,184,0.45)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span
                className={`relative z-10 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                  active ? "max-w-[4rem] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
