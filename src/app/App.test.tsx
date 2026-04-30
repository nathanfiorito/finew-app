import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { HomePage } from "../pages/home/HomePage.js";
import { NotFoundPage } from "../pages/not-found/NotFoundPage.js";

function renderAt(path: string): void {
  const router = createMemoryRouter(
    [
      { path: "/", element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe("App routing", () => {
  it("renders HomePage at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /finew/i })).toBeInTheDocument();
  });

  it("renders NotFoundPage on unknown route", () => {
    renderAt("/does-not-exist");
    expect(screen.getByRole("heading", { name: /not found/i })).toBeInTheDocument();
  });
});
