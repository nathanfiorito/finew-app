import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Popover } from "./Popover.js";

describe("<Popover>", () => {
  it("renders the trigger", () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>contents</Popover.Content>
      </Popover.Root>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("does not render content while closed", () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>contents</Popover.Content>
      </Popover.Root>,
    );
    expect(screen.queryByText("contents")).toBeNull();
  });

  it("renders content when controlled open", () => {
    render(
      <Popover.Root open>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>contents</Popover.Content>
      </Popover.Root>,
    );
    expect(screen.getByText("contents")).toBeInTheDocument();
  });

  it("opens on trigger click", () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>contents</Popover.Content>
      </Popover.Root>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("contents")).toBeInTheDocument();
  });
});
