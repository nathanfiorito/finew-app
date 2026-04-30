import type { JSX } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router.js";
import { QueryProvider } from "./providers/QueryProvider.js";
import { ThemeProvider } from "./providers/ThemeProvider.js";
import { DensityProvider } from "./providers/DensityProvider.js";

export function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DensityProvider>
          <RouterProvider router={router} />
        </DensityProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
