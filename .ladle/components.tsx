import type { GlobalProvider } from "@ladle/react";
import { useEffect } from "react";

import "../src/app/styles/index.css";
import {
  ThemeProvider,
  useThemeStore,
} from "../src/app/providers/ThemeProvider.js";
import {
  DensityProvider,
  useDensityStore,
} from "../src/app/providers/DensityProvider.js";
import {
  LocaleProvider,
  useLocaleStore,
} from "../src/shared/config/locale/index.js";

export const argTypes = {
  theme: {
    control: { type: "radio" },
    options: ["light", "dark"],
    defaultValue: "light",
  },
  density: {
    control: { type: "radio" },
    options: ["comfortable", "compact"],
    defaultValue: "comfortable",
  },
  locale: {
    control: { type: "radio" },
    options: ["pt-BR", "en-US"],
    defaultValue: "pt-BR",
  },
};

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const theme = (globalState.theme ?? "light") as "light" | "dark";
  const density = (globalState.density ?? "comfortable") as
    | "comfortable"
    | "compact";
  const locale = (globalState.locale ?? "pt-BR") as "pt-BR" | "en-US";

  useEffect(() => {
    useThemeStore.setState({ theme, override: theme });
  }, [theme]);
  useEffect(() => {
    useDensityStore.setState({ density });
  }, [density]);
  useEffect(() => {
    useLocaleStore.setState({ locale });
  }, [locale]);

  return (
    <ThemeProvider>
      <DensityProvider>
        <LocaleProvider>{children}</LocaleProvider>
      </DensityProvider>
    </ThemeProvider>
  );
};
