import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Toaster, toast } from "./Toast.js";

describe("<Toaster> + toast()", () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it("queues a toast.success and renders the message", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Saved");
    });
    await waitFor(() => {
      expect(document.body.textContent).toContain("Saved");
    });
  });

  it("queues a plain toast", async () => {
    render(<Toaster />);
    act(() => {
      toast("Hello there");
    });
    await waitFor(() => {
      expect(document.body.textContent).toContain("Hello there");
    });
  });

  it("renders the Toaster section after first toast", async () => {
    render(<Toaster />);
    act(() => {
      toast("Trigger render");
    });
    await waitFor(() => {
      expect(document.querySelector(".fw-toaster")).not.toBeNull();
    });
  });
});
