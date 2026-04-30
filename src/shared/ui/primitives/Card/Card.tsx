import type { HTMLAttributes, ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import "./Card.css";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

function CardImpl(
  { title, action, padded = true, className, children, ...rest }: CardProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-card", className].filter(Boolean).join(" ");
  return (
    <section ref={ref} className={classes} {...rest}>
      {(title ?? action) ? (
        <header className="fw-card-head">
          {title && <h3 className="t-h4">{title}</h3>}
          {action}
        </header>
      ) : null}
      {padded ? <div className="fw-card-body">{children}</div> : children}
    </section>
  );
}

export const Card = forwardRef(CardImpl);
Card.displayName = "Card";
