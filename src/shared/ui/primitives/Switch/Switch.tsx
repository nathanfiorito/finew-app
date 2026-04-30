import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef, useId } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import "./Switch.css";

export interface SwitchProps {
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  label?: ReactNode;
  error?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

function SwitchImpl(
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
  }: SwitchProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const reactId = useId();
  const inputId = id ?? `${reactId}-sw`;
  const errorId = error ? `${reactId}-error` : undefined;
  const hasError = error !== undefined && error.length > 0;
  const wrapperClasses = ["fw-switch-wrap", className].filter(Boolean).join(" ");
  return (
    <span
      className={wrapperClasses}
      data-state={hasError ? "error" : undefined}
      data-disabled={disabled === true ? "true" : undefined}
    >
      <label htmlFor={inputId} className="fw-switch">
        <SwitchPrimitive.Root
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          className="fw-switch-root"
          aria-label={label === undefined ? ariaLabel : undefined}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorId}
        >
          <SwitchPrimitive.Thumb className="fw-switch-thumb" />
        </SwitchPrimitive.Root>
        {label !== undefined ? <span>{label}</span> : null}
      </label>
      {hasError ? (
        <span className="fw-switch-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export const Switch = forwardRef(SwitchImpl);
Switch.displayName = "Switch";
