import type { ButtonHTMLAttributes, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  loading?: boolean;
}

function ButtonImpl(
  {
    variant = "primary",
    size = "md",
    iconLeading,
    iconTrailing,
    loading = false,
    disabled,
    type = "button",
    className,
    children,
    onClick,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const iconSize = size === "sm" ? 14 : 16;
  const isDisabled = disabled === true || loading;
  const classes = ["fw-btn", `fw-btn-${variant}`, `fw-btn-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <span className="fw-btn-spinner" aria-hidden="true" />
      ) : iconLeading ? (
        <Icon name={iconLeading} size={iconSize} />
      ) : null}
      {children}
      {iconTrailing ? <Icon name={iconTrailing} size={iconSize} /> : null}
    </button>
  );
}

export const Button = forwardRef(ButtonImpl);
Button.displayName = "Button";
