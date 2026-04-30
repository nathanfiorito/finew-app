import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  JSX,
  ReactNode,
  Ref,
} from "react";
import { forwardRef, useMemo } from "react";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Icon } from "../Icon/Icon.js";
import { Pagination } from "../Pagination/Pagination.js";
import { Skeleton } from "../Skeleton/Skeleton.js";
import { EmptyState } from "../EmptyState/EmptyState.js";
import "./Table.css";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  accessor: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string | number;
}

export interface TablePagination {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
}

export interface TableSort {
  id: string;
  desc: boolean;
}

export interface TableProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  sort?: TableSort;
  onSortChange?: (next: TableSort) => void;
  pagination?: TablePagination;
  loading?: boolean;
  empty?: ReactNode;
  skeletonRows?: number;
  "aria-label": string;
}

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  return "";
}

function compareValues(a: unknown, b: unknown): number {
  const aNil = a === null || a === undefined;
  const bNil = b === null || b === undefined;
  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b);
  }
  return safeString(a).localeCompare(safeString(b));
}

function alignClass(align: TableColumn<unknown>["align"]): string | null {
  if (align === "right") return "fw-table-align-right";
  if (align === "center") return "fw-table-align-center";
  return null;
}

function widthStyle(width: string | number | undefined): CSSProperties | undefined {
  if (width === undefined) return undefined;
  return { width: typeof width === "number" ? `${String(width)}px` : width };
}

function SortIndicator({
  active,
  desc,
}: {
  active: boolean;
  desc: boolean;
}): JSX.Element {
  if (!active) {
    return (
      <span className="fw-table-sort-idle" aria-hidden="true">
        <Icon name="chevronUp" size={10} />
        <Icon name="chevronDown" size={10} />
      </span>
    );
  }
  return (
    <span className="fw-table-sort-icon" aria-hidden="true">
      <Icon name={desc ? "chevronDown" : "chevronUp"} size={14} />
    </span>
  );
}

function TableInner<T>(
  props: TableProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const {
    data,
    columns,
    rowKey,
    sort,
    onSortChange,
    pagination,
    loading = false,
    empty,
    skeletonRows = 5,
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const tanstackColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map<ColumnDef<T>>((c) => ({
        id: c.id,
        accessorFn: (row) => c.accessor(row),
        enableSorting: c.sortable ?? false,
        sortingFn: (rowA, rowB, columnId) =>
          compareValues(rowA.getValue(columnId), rowB.getValue(columnId)),
      })),
    [columns],
  );

  const sortingState: SortingState = useMemo(
    () => (sort ? [{ id: sort.id, desc: sort.desc }] : []),
    [sort],
  );

  const table = useReactTable<T>({
    data,
    columns: tanstackColumns,
    state: { sorting: sortingState },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
    enableSortingRemoval: false,
  });

  const handleSortClick = (columnId: string): void => {
    if (!onSortChange) return;
    const desc = sort?.id === columnId ? !sort.desc : true;
    onSortChange({ id: columnId, desc });
  };

  const ariaSortFor = (columnId: string): "ascending" | "descending" | "none" => {
    if (sort?.id !== columnId) return "none";
    return sort.desc ? "descending" : "ascending";
  };

  const wrapperClasses = ["fw-table-wrap", className]
    .filter(Boolean)
    .join(" ");

  const showEmpty = !loading && data.length === 0;

  const colCount = columns.length;

  return (
    <div ref={ref} className={wrapperClasses} aria-label={ariaLabel} {...rest}>
      <div className="fw-table-scroll">
        <table className="fw-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const ariaSort = col.sortable ? ariaSortFor(col.id) : undefined;
                const align = alignClass(col.align);
                const headerClasses = align ?? undefined;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={headerClasses}
                    style={widthStyle(col.width)}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className="fw-table-sort-btn"
                        onClick={() => {
                          handleSortClick(col.id);
                        }}
                      >
                        <span>{col.header}</span>
                        <SortIndicator
                          active={sort?.id === col.id}
                          desc={sort?.id === col.id ? sort.desc : true}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${String(i)}`}>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={alignClass(col.align) ?? undefined}
                    >
                      <Skeleton variant="rect" height="14px" width="60%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : showEmpty ? (
              <tr>
                <td className="fw-table-empty-cell" colSpan={colCount}>
                  {empty ?? (
                    <EmptyState
                      title="Sem dados"
                      description="Nada para mostrar aqui."
                    />
                  )}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const original = row.original;
                return (
                  <tr key={rowKey(original)}>
                    {columns.map((col) => {
                      const align = alignClass(col.align);
                      const content = col.cell
                        ? col.cell(original)
                        : renderDefault(col.accessor(original));
                      return (
                        <td
                          key={col.id}
                          className={align ?? undefined}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <footer className="fw-table-foot">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.onPageChange}
          />
        </footer>
      ) : null}
    </div>
  );
}

function renderDefault(value: unknown): ReactNode {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return null;
}

const TableForwarded = forwardRef(TableInner) as <T>(
  props: TableProps<T> & { ref?: Ref<HTMLDivElement> },
) => JSX.Element;

export const Table = TableForwarded;
