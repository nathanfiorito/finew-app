import type { ForwardedRef, HTMLAttributes, JSX, ReactNode } from "react";
import { forwardRef, Fragment } from "react";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

function BreadcrumbImpl(
  { items, separator = "/", className, ...rest }: BreadcrumbProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-breadcrumb", className].filter(Boolean).join(" ");
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={classes} {...rest}>
      <ol>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {isLast || it.href === undefined ? (
                  <span aria-current={isLast ? "page" : undefined}>
                    {it.label}
                  </span>
                ) : (
                  <a href={it.href}>{it.label}</a>
                )}
              </li>
              {!isLast ? (
                <li className="fw-breadcrumb-sep" aria-hidden="true">
                  {separator}
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export const Breadcrumb = forwardRef(BreadcrumbImpl);
Breadcrumb.displayName = "Breadcrumb";
