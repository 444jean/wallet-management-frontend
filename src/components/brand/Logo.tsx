import { useId } from "react";
import { cn } from "@/lib/utils";

/** SVG ids must be unique per instance and valid inside url(#...). */
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/** Gold radial gradient shared by every coin drawing. */
export function GoldGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#fde68a" />
      <stop offset="0.6" stopColor="#fbbf24" />
      <stop offset="1" stopColor="#d97706" />
    </radialGradient>
  );
}

/** The smiling coin and its sparkle, in the 64x64 logo grid. */
function CoinFace({ gold }: { gold: string }) {
  return (
    <>
      <circle cx="31" cy="34" r="20" fill={`url(#${gold})`} />
      <circle cx="31" cy="34" r="15" fill="none" stroke="#b45309" strokeOpacity="0.45" strokeWidth="2.4" />
      <circle cx="25" cy="31" r="2.3" fill="#78350f" />
      <circle cx="37" cy="31" r="2.3" fill="#78350f" />
      <path d="M24.5 37.5q6.5 6 13 0" fill="none" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M51 7c.7 3.1 2.2 4.7 6 6-3.8 1.3-5.3 2.9-6 6-.7-3.1-2.2-4.7-6-6 3.8-1.3 5.3-2.9 6-6z" fill="#fff" />
    </>
  );
}

/**
 * "Chauchita sonriente" (T14): a smiling gold coin on the palette colour.
 * The tile follows the user's palette; the coin is always gold. Same drawing
 * as public/favicon.svg, which is fixed to purple.
 */
export function Logo({ className }: { className?: string }) {
  const shade = useSvgId("logo-shade");
  const gold = useSvgId("logo-gold");

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-9 shrink-0", className)}>
      <defs>
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <GoldGradient id={gold} />
      </defs>
      <rect width="64" height="64" rx="17" fill="var(--primary)" />
      <rect width="64" height="64" rx="17" fill={`url(#${shade})`} />
      <CoinFace gold={gold} />
    </svg>
  );
}

/** Only the smiling coin, without the tile (for illustrations). */
export function Chauchita({ gold, ...props }: { gold: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <CoinFace gold={gold} />
    </svg>
  );
}
