import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef, useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Icon } from "../Icon/Icon.js";
import "./Checkbox.css";

export type CheckedState = boolean | "indeterminate";

export interface CheckboxProps {
  name?: string;
  value?: string;
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (next: CheckedState) => void;
  disabled?: boolean;
  required?: boolean;
  label?: ReactNode;
  error?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

function CheckboxImpl(
  {
    name,
    value,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    required,
    label,
    error,
    id,
    className,
    "aria-label": ariaLabel,
  }: CheckboxProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const reactId = useId();
  const inputId = id ?? `${reactId}-cb`;
  const errorId = error ? `${reactId}-error` : undefined;
  const hasError = error !== undefined && error.length > 0;
  const wrapperClasses = ["fw-check-wrap", className].filter(Boolean).join(" ");

  return (
    <span
      className={wrapperClasses}
      data-state={hasError ? "error" : undefined}
      data-disabled={disabled === true ? "true" : undefined}
    >
      <label htmlFor={inputId} className="fw-check">
        <CheckboxPrimitive.Root
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          className="fw-check-root"
          aria-label={label === undefined ? ariaLabel : undefined}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorId}
        >
          <CheckboxPrimitive.Indicator className="fw-check-indicator">
            {checked === "indeterminate" || defaultChecked === "indeterminate" ? (
              <Icon name="minus" size={12} />
            ) : (
              <Icon name="check" size={12} />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label !== undefined ? <span>{label}</span> : null}
      </label>
      {hasError ? (
        <span className="fw-check-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export const Checkbox = forwardRef(CheckboxImpl);
Checkbox.displayName = "Checkbox";
