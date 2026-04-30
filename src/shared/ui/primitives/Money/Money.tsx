import type { ForwardedRef, HTMLAttributes, JSX } from "react";
import { forwardRef } from "react";
import {
  useLocale,
  type Locale,
} from "../../../../app/providers/LocaleProvider.js";
import "./Money.css";

export type MoneySign = "auto" | "always" | "never";

export interface MoneyProps extends HTMLAttributes<HTMLSpanElement> {
  amount: number | null | undefined;
  currency?: string;
  locale?: Locale;
  sign?: MoneySign;
  display?: boolean;
}

interface FormattedParts {
  prefix: string;
  symbol: string;
  body: string;
  ariaLabel: string;
}

function isInvalid(
  amount: number | null | undefined,
): amount is null | undefined {
  return amount === null || amount === undefined || Number.isNaN(amount);
}

function format(
  amount: number,
  currency: string,
  locale: Locale,
  sign: MoneySign,
): FormattedParts {
  const abs = Math.abs(amount);
  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = fmt.formatToParts(abs);
  const symbolPart = parts.find((p) => p.type === "currency");
  const symbol = symbolPart ? symbolPart.value : "";
  const body = parts
    .filter((p) => p.type !== "currency" && p.type !== "literal")
    .map((p) => p.value)
    .join("")
    .trim();
  let prefix = "";
  if (sign === "always") prefix = amount >= 0 ? "+" : "−";
  else if (sign === "auto" && amount < 0) prefix = "−";
  const ariaLabel = `${prefix}${fmt.format(abs).replace(/-/g, "−")}`;
  return { prefix, symbol, body, ariaLabel };
}

function MoneyImpl(
  {
    amount,
    currency = "BRL",
    locale,
    sign = "auto",
    display = false,
    className,
    ...rest
  }: MoneyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const ctx = useLocale();
  const effectiveLocale: Locale = locale ?? ctx.locale;
  const classes = [
    "fw-money",
    display ? "fw-money-display" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isInvalid(amount)) {
    if (import.meta.env.DEV) {
      console.warn(
        `<Money> received invalid amount: ${String(amount)}. Rendering em-dash.`,
      );
    }
    return (
      <span ref={ref} className={classes} aria-label="—" {...rest}>
        {"—"}
      </span>
    );
  }

  const { prefix, symbol, body, ariaLabel } = format(
    amount,
    currency,
    effectiveLocale,
    sign,
  );
  return (
    <span ref={ref} className={classes} aria-label={ariaLabel} {...rest}>
      {prefix ? (
        <span className="fw-money-sign" aria-hidden="true">
          {prefix}
        </span>
      ) : null}
      <span className="fw-money-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="fw-money-body" aria-hidden="true">
        {body}
      </span>
    </span>
  );
}

export const Money = forwardRef(MoneyImpl);
Money.displayName = "Money";
