import type { ForwardedRef, InputHTMLAttributes, JSX } from "react";
import { forwardRef, useId } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./Input.css";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  error?: string;
}

function InputImpl(
  {
    size = "md",
    iconLeading,
    iconTrailing,
    error,
    className,
    disabled,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const reactId = useId();
  const errorId = error ? `${reactId}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, errorId].filter((v): v is string => Boolean(v)).join(" ") ||
    undefined;
  const fieldClasses = ["fw-field", className].filter(Boolean).join(" ");
  const inputClasses = ["fw-input", `fw-input-${size}`].join(" ");
  const hasError = error !== undefined && error.length > 0;
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <span
      className={fieldClasses}
      data-state={hasError ? "error" : undefined}
      data-disabled={disabled === true ? "true" : undefined}
    >
      <span className="fw-field-row">
        {iconLeading ? (
          <span className="fw-field-icon">
            <Icon name={iconLeading} size={iconSize} />
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {iconTrailing ? (
          <span className="fw-field-icon">
            <Icon name={iconTrailing} size={iconSize} />
          </span>
        ) : null}
      </span>
      {hasError ? (
        <span className="fw-field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export const Input = forwardRef(InputImpl);
Input.displayName = "Input";
