import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton.js";

describe("<Skeleton>", () => {
  it("renders a single rect by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll(".fw-skeleton")).toHaveLength(1);
    expect(container.firstElementChild).toHaveClass("fw-skeleton-rect");
  });

  it.each(["rect", "text", "circle"] as const)(
    "applies the %s variant class",
    (variant) => {
      const { container } = render(<Skeleton variant={variant} />);
      expect(container.firstElementChild).toHaveClass(`fw-skeleton-${variant}`);
    },
  );

  it("renders multiple lines for the text variant", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll(".fw-skeleton")).toHaveLength(3);
  });

  it("applies inline width and height", () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("2rem");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
