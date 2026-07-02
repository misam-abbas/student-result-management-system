import { cn } from "@/utils/cn";

/**
 * The recurring "seal" mark — a vector medallion echoing an official
 * transcript stamp. Used on the landing page hero (animated) and in
 * compact form in the admin/HOD/student headers (static).
 */
export function Seal({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-gold-400", animated && "animate-[seal-rotate_40s_linear_infinite]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="23.5" stroke="currentColor" strokeWidth="0.8" />
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const x1 = 32 + Math.cos(angle) * 23.5;
        const y1 = 32 + Math.sin(angle) * 23.5;
        const x2 = 32 + Math.cos(angle) * 26.5;
        const y2 = 32 + Math.sin(angle) * 26.5;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.8" />;
      })}
      <path
        d="M32 16 L36.5 27 L48 27 L38.7 33.8 L42.2 45 L32 38 L21.8 45 L25.3 33.8 L16 27 L27.5 27 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
