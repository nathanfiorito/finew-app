import type { ForwardedRef, HTMLAttributes, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./EmptyState.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  iconName?: IconName;
  action?: ReactNode;
}

function EmptyStateImpl(
  {
    title,
    description,
    iconName,
    action,
    className,
    ...rest
  }: EmptyStateProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const classes = ["fw-empty", className].filter(Boolean).join(" ");
  return (
    <div ref={ref} className={classes} {...rest}>
      {iconName ? (
        <span className="fw-empty-icon">
          <Icon name={iconName} size={32} />
        </span>
      ) : null}
      <h3 className="fw-empty-title">{title}</h3>
      {description ? <p className="fw-empty-desc">{description}</p> : null}
      {action ? <div className="fw-empty-action">{action}</div> : null}
    </div>
  );
}

export const EmptyState = forwardRef(EmptyStateImpl);
EmptyState.displayName = "EmptyState";
