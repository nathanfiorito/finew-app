import type {
  HTMLAttributes,
  CSSProperties,
  ForwardedRef,
  JSX,
} from "react";
import { forwardRef } from "react";
import "./Skeleton.css";

export type SkeletonVariant = "rect" | "text" | "circle";
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  lines?: number;
}

function toLength(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${String(v)}px` : v;
}

function SkeletonImpl(
  {
    variant = "rect",
    width,
    height,
    lines,
    className,
    style,
    ...rest
  }: SkeletonProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const inline: CSSProperties = {
    ...(style ?? {}),
    width: toLength(width) ?? style?.width,
    height: toLength(height) ?? style?.height,
  };
  const classes = ["fw-skeleton", `fw-skeleton-${variant}`, className]
    .filter(Boolean)
    .join(" ");
  if (variant === "text" && typeof lines === "number" && lines > 1) {
    return (
      <span ref={ref} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className={classes} style={inline} />
        ))}
      </span>
    );
  }
  return (
    <span
      ref={ref}
      className={classes}
      style={inline}
      aria-hidden="true"
      {...rest}
    />
  );
}

export const Skeleton = forwardRef(SkeletonImpl);
Skeleton.displayName = "Skeleton";
