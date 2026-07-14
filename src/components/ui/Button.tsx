"use client";

type Variant = "primary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-accent to-accent-deep text-white shadow-[0_4px_16px_rgba(14,143,214,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110",
  ghost:
    "bg-surface-2 text-ink border border-line hover:border-accent/40",
  danger: "bg-rose-500/12 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
