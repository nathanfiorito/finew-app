import type { HTMLAttributes, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import "./CategoryPill.css";

export interface CategoryPillProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  color?: string;
}

function CategoryPillImpl(
  { label, color = "var(--fg-3)", className, ...rest }: CategoryPillProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-pill", className].filter(Boolean).join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      <span className="fw-pill-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

export const CategoryPill = forwardRef(CategoryPillImpl);
CategoryPill.displayName = "CategoryPill";
