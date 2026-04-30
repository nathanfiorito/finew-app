import type { ForwardedRef, HTMLAttributes, JSX } from "react";
import { forwardRef } from "react";
import { Icon } from "../Icon/Icon.js";
import "./Pagination.css";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type PageItem = number | "ellipsis";

function buildItems(
  page: number,
  pageCount: number,
  siblingCount: number,
  showFirstLast: boolean,
): PageItem[] {
  if (pageCount <= 1) return [1];
  const first = 1;
  const last = pageCount;
  const left = Math.max(page - siblingCount, first);
  const right = Math.min(page + siblingCount, last);
  const items: PageItem[] = [];
  if (showFirstLast && left > first) {
    items.push(first);
    if (left > first + 1) items.push("ellipsis");
  }
  items.push(...range(left, right));
  if (showFirstLast && right < last) {
    if (right < last - 1) items.push("ellipsis");
    items.push(last);
  }
  return items;
}

function PaginationImpl(
  {
    page,
    pageCount,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    className,
    ...rest
  }: PaginationProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-pagination", className].filter(Boolean).join(" ");
  const items = buildItems(page, pageCount, siblingCount, showFirstLast);
  const goto = (n: number): void => {
    if (n >= 1 && n <= pageCount && n !== page) onPageChange(n);
  };
  return (
    <nav ref={ref} aria-label="Pagination" className={classes} {...rest}>
      <button
        type="button"
        className="fw-pagination-btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => {
          goto(page - 1);
        }}
      >
        <Icon name="chevronLeft" size={16} />
      </button>
      {items.map((it, i) =>
        it === "ellipsis" ? (
          <span
            key={`e${String(i)}`}
            className="fw-pagination-ellipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            className="fw-pagination-btn"
            aria-label={`Page ${String(it)}`}
            aria-current={it === page ? "page" : undefined}
            onClick={() => {
              goto(it);
            }}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        className="fw-pagination-btn"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => {
          goto(page + 1);
        }}
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}

export const Pagination = forwardRef(PaginationImpl);
Pagination.displayName = "Pagination";
