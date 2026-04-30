import type { ForwardedRef, JSX } from "react";
import { forwardRef, useId, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DayPicker, type DateRange as RdpDateRange } from "react-day-picker";
import { ptBR, enUS } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns/locale";
import { useLocale, type Locale } from "../../../config/locale/index.js";
import { Icon } from "../Icon/Icon.js";
import "react-day-picker/dist/style.css";
import "./DateRangePicker.css";

export type DateRangePickerSize = "sm" | "md" | "lg";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (next: DateRange) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: DateRangePickerSize;
  error?: string;
  locale?: Locale;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const LOCALE_MAP: Record<Locale, DateFnsLocale> = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

function formatRange(
  range: DateRange | undefined,
  locale: Locale,
): string | null {
  if (!range?.from) return null;
  const fmt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const fromStr = fmt.format(range.from);
  const toStr = range.to ? fmt.format(range.to) : "…";
  return `${fromStr} — ${toStr}`;
}

function DateRangePickerImpl(
  {
    value,
    defaultValue,
    onChange,
    disabled,
    placeholder = "Selecionar período",
    size = "md",
    error,
    locale,
    className,
    id,
    "aria-label": ariaLabel,
  }: DateRangePickerProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const ctx = useLocale();
  const effectiveLocale: Locale = locale ?? ctx.locale;
  const dfLocale = LOCALE_MAP[effectiveLocale];

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DateRange | undefined>(defaultValue);
  const current = isControlled ? value : internal;

  const reactId = useId();
  const errorId = error ? `${reactId}-error` : undefined;
  const hasError = error !== undefined && error.length > 0;
  const triggerClasses = ["fw-drp-trigger", `fw-drp-${size}`, className]
    .filter(Boolean)
    .join(" ");

  const display = formatRange(current, effectiveLocale);

  const handleSelect = (next: RdpDateRange | undefined): void => {
    const normalized: DateRange = {
      from: next?.from,
      to: next?.to,
    };
    if (!isControlled) setInternal(normalized);
    onChange?.(normalized);
  };

  return (
    <span data-state={hasError ? "error" : undefined}>
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger
          ref={ref}
          id={id}
          className={triggerClasses}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorId}
          data-state={hasError ? "error" : undefined}
        >
          <span className={display ? undefined : "fw-drp-placeholder"}>
            {display ?? placeholder}
          </span>
          <span className="fw-drp-icon" aria-hidden="true">
            <Icon name="calendar" size={16} />
          </span>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="fw-drp-content"
            sideOffset={6}
            align="start"
          >
            <DayPicker
              mode="range"
              selected={current}
              onSelect={handleSelect}
              locale={dfLocale}
              numberOfMonths={1}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {hasError ? (
        <span className="fw-drp-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export const DateRangePicker = forwardRef(DateRangePickerImpl);
DateRangePicker.displayName = "DateRangePicker";
