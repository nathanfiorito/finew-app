import type { ForwardedRef, HTMLAttributes, JSX } from "react";
import { forwardRef } from "react";
import { Icon } from "../Icon/Icon.js";
import { Money } from "../Money/Money.js";
import { Sparkline, type SparklineTone } from "../Sparkline/Sparkline.js";
import { useLocale, type Locale } from "../../../config/locale/index.js";
import "./KPIStat.css";

export interface KPIStatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | null | undefined;
  currency?: string;
  delta?: number;
  deltaLabel?: string;
  sparkline?: number[];
  sparkTone?: SparklineTone;
}

function formatDeltaPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
}

function buildDeltaAriaLabel(
  delta: number,
  deltaLabel: string | undefined,
  locale: Locale,
): string {
  const magnitude = formatDeltaPercent(delta, locale);
  if (locale === "en-US") {
    const direction = delta >= 0 ? "up" : "down";
    return [`${direction} ${magnitude} percent`, deltaLabel]
      .filter(Boolean)
      .join(" ");
  }
  const direction = delta >= 0 ? "alta" : "baixa";
  return [`${direction} de ${magnitude} por cento`, deltaLabel]
    .filter(Boolean)
    .join(" ");
}

function KPIStatImpl(
  {
    label,
    value,
    currency = "BRL",
    delta,
    deltaLabel,
    sparkline,
    sparkTone,
    className,
    ...rest
  }: KPIStatProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const { locale } = useLocale();
  const classes = ["fw-kpi", className].filter(Boolean).join(" ");
  const isGain = delta !== undefined && delta >= 0;
  const deltaClass = `fw-kpi-delta ${isGain ? "is-gain" : "is-loss"}`;
  const deltaAria =
    delta !== undefined ? buildDeltaAriaLabel(delta, deltaLabel, locale) : "";
  const formattedDelta =
    delta !== undefined ? formatDeltaPercent(delta, locale) : "";

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="t-micro">{label}</div>
      <div className="fw-kpi-value">
        <Money amount={value} currency={currency} display sign="never" />
      </div>
      {delta !== undefined ? (
        <div className={deltaClass} aria-label={deltaAria}>
          <Icon name={isGain ? "arrowUp" : "arrowDown"} size={12} />
          <span aria-hidden="true">
            {isGain ? "+" : "−"}
            {formattedDelta}%
          </span>
          {deltaLabel ? (
            <span className="fw-kpi-delta-label" aria-hidden="true">
              {deltaLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      {sparkline ? (
        <div className="fw-kpi-spark">
          <Sparkline
            values={sparkline}
            width={240}
            height={36}
            tone={sparkTone}
          />
        </div>
      ) : null}
    </div>
  );
}

export const KPIStat = forwardRef(KPIStatImpl);
KPIStat.displayName = "KPIStat";
