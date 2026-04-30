import type { HTMLAttributes, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./Badge.css";

export type BadgeTone = "neutral" | "warn" | "gain" | "loss" | "info";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  iconLeading?: IconName;
}

function BadgeImpl(
  { tone = "neutral", iconLeading, className, children, ...rest }: BadgeProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-badge", `fw-badge-${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      {iconLeading ? <Icon name={iconLeading} size={12} /> : null}
      {children}
    </span>
  );
}

export const Badge = forwardRef(BadgeImpl);
Badge.displayName = "Badge";
