import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Table, type TableColumn } from "./Table.js";

interface Row {
  id: string;
  name: string;
  amount: number;
}

const ROWS: Row[] = [
  { id: "a", name: "Alpha", amount: 10 },
  { id: "b", name: "Bravo", amount: 30 },
  { id: "c", name: "Charlie", amount: 20 },
];

const COLUMNS: TableColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (r) => r.name,
    sortable: true,
  },
  {
    id: "amount",
    header: "Amount",
    accessor: (r) => r.amount,
    align: "right",
    sortable: true,
  },
];

describe("<Table>", () => {
  it("renders a table with rows and the consumer aria-label", () => {
    render(
      <Table
        aria-label="Saldos"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByLabelText("Saldos")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("renders a sortable header as a button and calls onSortChange when clicked", () => {
    const onSortChange = vi.fn();
    render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        onSortChange={onSortChange}
      />,
    );
    const headerBtn = screen.getByRole("button", { name: /name/i });
    headerBtn.click();
    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith({ id: "name", desc: true });
  });

  it("toggles direction on subsequent clicks of the same column", () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        sort={{ id: "name", desc: true }}
        onSortChange={onSortChange}
      />,
    );
    rerender(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        sort={{ id: "name", desc: true }}
        onSortChange={onSortChange}
      />,
    );
    screen.getByRole("button", { name: /name/i }).click();
    expect(onSortChange).toHaveBeenCalledWith({ id: "name", desc: false });
  });

  it("sets aria-sort on the active sorted header", () => {
    render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        sort={{ id: "amount", desc: true }}
      />,
    );
    const headers = screen.getAllByRole("columnheader");
    const amount = headers.find((h) => h.textContent.includes("Amount"));
    const name = headers.find((h) => h.textContent.includes("Name"));
    expect(amount).toHaveAttribute("aria-sort", "descending");
    expect(name).toHaveAttribute("aria-sort", "none");
  });

  it("renders skeleton rows when loading and no data rows", () => {
    const { container } = render(
      <Table
        aria-label="t"
        data={[]}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        loading
        skeletonRows={4}
      />,
    );
    expect(container.querySelectorAll(".fw-skeleton").length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("renders the default EmptyState when data is empty and not loading", () => {
    render(
      <Table
        aria-label="t"
        data={[]}
        columns={COLUMNS}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByRole("heading", { name: /sem dados/i })).toBeInTheDocument();
  });

  it("renders the consumer-supplied empty slot when provided", () => {
    render(
      <Table
        aria-label="t"
        data={[]}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        empty={<div>nope</div>}
      />,
    );
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders Pagination and forwards onPageChange", () => {
    const onPageChange = vi.fn();
    render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        pagination={{ page: 1, pageCount: 3, onPageChange }}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    within(nav).getByRole("button", { name: /next page/i }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("forwards refs to the wrapper div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Table
        ref={ref}
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
      />,
    );
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current).toHaveClass("fw-table-wrap");
  });

  it("applies the alignment class to right-aligned cells", () => {
    const { container } = render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
      />,
    );
    const right = container.querySelectorAll("td.fw-table-align-right");
    expect(right.length).toBe(ROWS.length);
  });

  it("renders custom cell renderers when provided", () => {
    const cols: TableColumn<Row>[] = [
      {
        id: "name",
        header: "Name",
        accessor: (r) => r.name,
        cell: (r) => <strong data-testid={`s-${r.id}`}>{r.name}</strong>,
      },
    ];
    render(
      <Table
        aria-label="t"
        data={ROWS}
        columns={cols}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByTestId("s-a")).toHaveTextContent("Alpha");
  });
});
