import { ReactNode } from "react";

/**
 * Layout grid: 4 columns < 680px, 8 columns < 1100px, 12 columns above.
 * Children set their span with Tailwind `col-span-*` utilities (mobile-first).
 */
export default function Grid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`layout-grid ${className}`}>{children}</div>;
}
