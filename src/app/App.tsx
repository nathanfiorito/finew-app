import type { JSX } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router.js";

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
