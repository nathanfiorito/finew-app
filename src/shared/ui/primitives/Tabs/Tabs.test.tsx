import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "./Tabs.js";

function Sample(): JSX.Element {
  return (
    <Tabs.Root defaultValue="a">
      <Tabs.List>
        <Tabs.Trigger value="a">Aba A</Tabs.Trigger>
        <Tabs.Trigger value="b">Aba B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">Painel A</Tabs.Content>
      <Tabs.Content value="b">Painel B</Tabs.Content>
    </Tabs.Root>
  );
}

describe("<Tabs>", () => {
  it("renders triggers as tabs and the active panel", () => {
    render(<Sample />);
    expect(screen.getByRole("tab", { name: "Aba A" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Aba B" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByText("Painel A")).toBeInTheDocument();
  });

  it("switches active panel on trigger click", () => {
    render(<Sample />);
    const tabB = screen.getByRole("tab", { name: "Aba B" });
    fireEvent.pointerDown(tabB, { button: 0, pointerType: "mouse" });
    fireEvent.mouseDown(tabB);
    fireEvent.click(tabB);
    expect(screen.getByRole("tab", { name: "Aba B" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Painel B")).toBeInTheDocument();
  });

  it("applies fw-tabs-* class names to each part", () => {
    const { container } = render(<Sample />);
    expect(container.querySelector(".fw-tabs")).not.toBeNull();
    expect(container.querySelector(".fw-tabs-list")).not.toBeNull();
    expect(container.querySelector(".fw-tabs-trigger")).not.toBeNull();
    expect(container.querySelector(".fw-tabs-content")).not.toBeNull();
  });

  it("forwards refs to the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs.Root ref={ref} defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">x</Tabs.Content>
      </Tabs.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
