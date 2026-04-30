import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef, useId } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import "./Radio.css";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export type RadioOrientation = "vertical" | "horizontal";

export interface RadioProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  orientation?: RadioOrientation;
  error?: string;
  className?: string;
  "aria-label"?: string;
}

function RadioImpl(
  {
    name,
    value,
    defaultValue,
    onValueChange,
    options,
    disabled,
    required,
    orientation = "vertical",
    error,
    className,
    "aria-label": ariaLabel,
  }: RadioProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const reactId = useId();
  const errorId = error ? `${reactId}-error` : undefined;
  const hasError = error !== undefined && error.length > 0;
  const groupClasses = ["fw-radio-group", className].filter(Boolean).join(" ");
  return (
    <>
      <RadioGroupPrimitive.Root
        ref={ref}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        orientation={orientation}
        className={groupClasses}
        aria-label={ariaLabel}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={errorId}
        data-state={hasError ? "error" : undefined}
      >
        {options.map((opt) => {
          const id = `${reactId}-${opt.value}`;
          return (
            <label key={opt.value} htmlFor={id} className="fw-radio">
              <RadioGroupPrimitive.Item
                id={id}
                value={opt.value}
                disabled={opt.disabled}
                className="fw-radio-item"
              >
                <RadioGroupPrimitive.Indicator className="fw-radio-indicator" />
              </RadioGroupPrimitive.Item>
              <span>{opt.label}</span>
            </label>
          );
        })}
      </RadioGroupPrimitive.Root>
      {hasError ? (
        <span className="fw-radio-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </>
  );
}

export const Radio = forwardRef(RadioImpl);
Radio.displayName = "Radio";
