import { useId } from "react";
import { Chauchita, GoldGradient } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const CURVE = "M40 240C90 235 110 205 150 200S210 170 245 150 300 95 340 80";

/**
 * Login illustration (T14): the savings curve with growing coins and the
 * chauchita reaching the top. Decorative only, no amounts. The curve draws
 * itself and the coin floats, both only when motion is allowed.
 */
export function SavingsCurve({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const area = `curve-area-${id}`;
  const gold = `curve-gold-${id}`;

  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" className={cn("w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={area} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </linearGradient>
        <GoldGradient id={gold} />
      </defs>
      <path
        d="M30 260H370"
        stroke="#fff"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeDasharray="4 8"
        strokeLinecap="round"
      />
      <path d={`${CURVE}V260H40Z`} fill={`url(#${area})`} />
      <path
        d={CURVE}
        pathLength={1}
        fill="none"
        stroke="#fde68a"
        strokeWidth="4"
        strokeLinecap="round"
        className="[stroke-dasharray:1] motion-safe:animate-[curve-draw_1.6s_0.2s_ease-out_both]"
      />
      <g fill={`url(#${gold})`} stroke="#b45309" strokeOpacity="0.5" strokeWidth="2">
        <circle cx="95" cy="229" r="9" opacity="0.75" />
        <circle cx="150" cy="200" r="11" opacity="0.85" />
        <circle cx="245" cy="150" r="13" />
      </g>
      <g className="motion-safe:animate-[coin-float_3.2s_ease-in-out_infinite_alternate]">
        <Chauchita gold={gold} x="300" y="26" width="84" height="84" />
      </g>
    </svg>
  );
}
