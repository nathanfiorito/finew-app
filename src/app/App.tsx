import type { JSX } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router.js";
import { QueryProvider } from "./providers/QueryProvider.js";
import { ThemeProvider } from "./providers/ThemeProvider.js";
import { DensityProvider } from "./providers/DensityProvider.js";
import { LocaleProvider } from "./providers/LocaleProvider.js";

export function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DensityProvider>
          <LocaleProvider>
            <RouterProvider router={router} />
          </LocaleProvider>
        </DensityProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
