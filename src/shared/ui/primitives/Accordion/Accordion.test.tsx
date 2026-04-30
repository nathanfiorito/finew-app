import type { JSX } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion } from "./Accordion.js";

function Sample(): JSX.Element {
  return (
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="q1">
        <Accordion.Trigger>Pergunta 1</Accordion.Trigger>
        <Accordion.Content>Resposta 1</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="q2">
        <Accordion.Trigger>Pergunta 2</Accordion.Trigger>
        <Accordion.Content>Resposta 2</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe("<Accordion>", () => {
  it("renders all triggers and hides content by default", () => {
    render(<Sample />);
    expect(screen.getByRole("button", { name: /Pergunta 1/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Resposta 1")).toBeNull();
  });

  it("opens an item on trigger click", () => {
    render(<Sample />);
    fireEvent.click(screen.getByRole("button", { name: /Pergunta 1/ }));
    expect(screen.getByRole("button", { name: /Pergunta 1/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Resposta 1")).toBeInTheDocument();
  });

  it("applies fw-accordion-* class names", () => {
    const { container } = render(<Sample />);
    expect(container.querySelector(".fw-accordion")).not.toBeNull();
    expect(container.querySelector(".fw-accordion-item")).not.toBeNull();
    expect(container.querySelector(".fw-accordion-trigger")).not.toBeNull();
  });
});
