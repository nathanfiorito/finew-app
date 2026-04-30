import { createRef } from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Money } from "./Money.js";
import { useLocaleStore } from "../../../config/locale/index.js";

beforeEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<Money>", () => {
  it("renders BRL with comma decimal under pt-BR", () => {
    const { container } = render(<Money amount={12483.9} />);
    expect(container.textContent).toContain("12.483,90");
  });

  it("renders USD with period decimal under en-US locale prop", () => {
    const { container } = render(
      <Money amount={12483.9} currency="USD" locale="en-US" />,
    );
    expect(container.textContent).toContain("12,483.90");
  });

  it("uses U+2212 minus for negative amounts", () => {
    const { container } = render(<Money amount={-100} />);
    expect(container.textContent).toContain("−");
  });

  it("renders + with sign='always' on positives", () => {
    const { container } = render(<Money amount={100} sign="always" />);
    expect(container.textContent).toContain("+");
  });

  it("never renders sign with sign='never'", () => {
    const { container } = render(<Money amount={-100} sign="never" />);
    expect(container.textContent).not.toContain("−");
    expect(container.textContent).not.toContain("-");
  });

  it("renders em-dash for null", () => {
    const { container } = render(<Money amount={null} />);
    expect(container.textContent).toBe("—");
  });

  it("renders em-dash for undefined", () => {
    const { container } = render(<Money amount={undefined} />);
    expect(container.textContent).toBe("—");
  });

  it("renders em-dash for NaN", () => {
    const { container } = render(<Money amount={NaN} />);
    expect(container.textContent).toBe("—");
  });

  it("respects useLocale context default", () => {
    useLocaleStore.setState({ locale: "en-US" });
    const { container } = render(<Money amount={1000} currency="USD" />);
    expect(container.textContent).toContain("1,000.00");
  });

  it("applies fw-money-display class with display prop", () => {
    const { container } = render(<Money amount={1} display />);
    expect(container.firstElementChild).toHaveClass("fw-money-display");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Money ref={ref} amount={1} />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
