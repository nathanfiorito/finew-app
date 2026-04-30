import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination.js";

describe("<Pagination>", () => {
  it("renders nav with aria-label", () => {
    render(
      <Pagination page={1} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });

  it("marks the current page with aria-current", () => {
    render(
      <Pagination page={3} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables prev on the first page", () => {
    render(
      <Pagination page={1} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("disables next on the last page", () => {
    render(
      <Pagination page={5} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onPageChange when a page button is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
    screen.getByRole("button", { name: "Page 2" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders ellipsis for skipped ranges", () => {
    const { container } = render(
      <Pagination
        page={5}
        pageCount={20}
        onPageChange={() => undefined}
        siblingCount={1}
      />,
    );
    expect(container.textContent).toContain("…");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Pagination
        ref={ref}
        page={1}
        pageCount={5}
        onPageChange={() => undefined}
      />,
    );
    expect(ref.current?.tagName).toBe("NAV");
  });
});
