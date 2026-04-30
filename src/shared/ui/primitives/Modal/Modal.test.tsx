import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal.js";

describe("<Modal>", () => {
  it("does not render content when closed", () => {
    render(
      <Modal open={false} onOpenChange={() => undefined} title="Hello">
        body
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders title and description when open", () => {
    render(
      <Modal
        open
        onOpenChange={() => undefined}
        title="Confirm"
        description="Are you sure?"
      >
        body
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(
      <Modal open onOpenChange={() => undefined} size={size} title="x">
        body
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveClass(`fw-modal-${size}`);
  });

  it("calls onOpenChange when close button clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="x">
        body
      </Modal>,
    );
    screen.getByRole("button", { name: "Close" }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders the footer slot", () => {
    render(
      <Modal
        open
        onOpenChange={() => undefined}
        title="x"
        footer={<button type="button">OK</button>}
      >
        body
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("forwards refs to the content element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal ref={ref} open onOpenChange={() => undefined} title="x">
        body
      </Modal>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
