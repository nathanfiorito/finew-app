import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Drawer } from "./Drawer.js";

describe("<Drawer>", () => {
  it("does not render content while closed", () => {
    render(
      <Drawer open={false} onOpenChange={() => undefined} title="Filtros">
        body
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders title and body when open", () => {
    render(
      <Drawer open onOpenChange={() => undefined} title="Filtros">
        Contents
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("renders the right side variant by default", () => {
    render(
      <Drawer open onOpenChange={() => undefined} title="x">
        body
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "right",
    );
  });

  it("renders the left side variant when side='left'", () => {
    render(
      <Drawer open onOpenChange={() => undefined} side="left" title="x">
        body
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-vaul-drawer-direction",
      "left",
    );
  });

  it("calls onOpenChange when Esc is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="x">
        body
      </Drawer>,
    );
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    expect(onOpenChange).toHaveBeenCalled();
  });
});
