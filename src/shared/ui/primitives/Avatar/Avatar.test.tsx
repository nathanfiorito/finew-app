import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar.js";

describe("<Avatar>", () => {
  it("renders uppercased initials when no src", () => {
    render(<Avatar initials="nf" />);
    expect(screen.getByText("NF")).toBeInTheDocument();
  });

  it("renders the image when src is set", () => {
    render(<Avatar src="/x.png" alt="Nathan" />);
    expect(screen.getByRole("img", { name: "Nathan" })).toHaveAttribute(
      "src",
      "/x.png",
    );
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    const { container } = render(<Avatar initials="x" size={size} />);
    expect(container.firstElementChild).toHaveClass(`fw-avatar-${size}`);
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} initials="x" />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
