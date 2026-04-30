import type { ForwardedRef, JSX, SVGAttributes } from "react";
import { forwardRef } from "react";
import "./Sparkline.css";

export type SparklineTone = "gain" | "loss" | "neutral";

export interface SparklineProps
  extends Omit<SVGAttributes<SVGSVGElement>, "values" | "color"> {
  values: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  color?: string;
  fill?: boolean;
}

const TONE_COLOR: Record<SparklineTone, string> = {
  gain: "var(--gain)",
  loss: "var(--loss)",
  neutral: "var(--accent)",
};

function SparklineImpl(
  {
    values,
    width = 120,
    height = 32,
    tone = "neutral",
    color,
    fill = true,
    className,
    ...rest
  }: SparklineProps,
  ref: ForwardedRef<SVGSVGElement>,
): JSX.Element | null {
  if (values.length === 0) {
    if (import.meta.env.DEV) {
      console.warn("<Sparkline> received an empty values array.");
    }
    return null;
  }

  const stroke = color ?? TONE_COLOR[tone];
  const classes = ["fw-sparkline", className].filter(Boolean).join(" ");

  if (values.length === 1) {
    const y = height / 2;
    return (
      <svg
        ref={ref}
        className={classes}
        width={width}
        height={height}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        {...rest}
      >
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fillPath = `${path} L${String(width)},${String(height)} L0,${String(height)} Z`;

  return (
    <svg
      ref={ref}
      className={classes}
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      {...rest}
    >
      {fill ? <path d={fillPath} fill={stroke} opacity="0.08" /> : null}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Sparkline = forwardRef(SparklineImpl);
Sparkline.displayName = "Sparkline";
