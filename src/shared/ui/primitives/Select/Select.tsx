import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef, useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Icon } from "../Icon/Icon.js";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: SelectSize;
  error?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function SelectImpl(
  {
    name,
    value,
    defaultValue,
    onValueChange,
    options,
    placeholder,
    disabled,
    required,
    size = "md",
    error,
    className,
    id,
    "aria-label": ariaLabel,
  }: SelectProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const reactId = useId();
  const errorId = error ? `${reactId}-error` : undefined;
  const hasError = error !== undefined && error.length > 0;
  const triggerClasses = [
    "fw-select-trigger",
    `fw-select-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className="fw-field" data-state={hasError ? "error" : undefined}>
      <SelectPrimitive.Root
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          className={triggerClasses}
          aria-label={ariaLabel}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorId}
          data-state={hasError ? "error" : undefined}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="fw-select-icon">
            <Icon name="chevronDown" size={16} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="fw-select-content"
            position="popper"
            sideOffset={6}
          >
            <SelectPrimitive.Viewport className="fw-select-viewport">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="fw-select-item"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {hasError ? (
        <span className="fw-field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export const Select = forwardRef(SelectImpl);
Select.displayName = "Select";
