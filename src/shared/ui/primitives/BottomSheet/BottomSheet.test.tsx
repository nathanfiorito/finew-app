import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BottomSheet } from "./BottomSheet.js";

describe("<BottomSheet>", () => {
  it("does not render content when closed", () => {
    render(
      <BottomSheet open={false} onOpenChange={() => undefined} title="Filtros">
        body
      </BottomSheet>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title and body when open", () => {
    render(
      <BottomSheet open onOpenChange={() => undefined} title="Filtros">
        Contents
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("calls onOpenChange when Esc is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet open onOpenChange={onOpenChange} title="x">
        body
      </BottomSheet>,
    );
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    expect(onOpenChange).toHaveBeenCalled();
  });

  it("renders a drag handle", () => {
    const { container } = render(
      <BottomSheet open onOpenChange={() => undefined} title="x">
        body
      </BottomSheet>,
    );
    expect(container.ownerDocument.querySelector(".fw-sheet-handle")).not.toBeNull();
  });
});
