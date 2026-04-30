import type { JSX } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import type { ToasterProps } from "sonner";
import "./Toast.css";

export type { ToasterProps };

export function Toaster(props: ToasterProps): JSX.Element {
  const { className, position, ...rest } = props;
  const classes = ["fw-toaster", className].filter(Boolean).join(" ");
  return (
    <SonnerToaster
      className={classes}
      position={position ?? "top-right"}
      {...rest}
    />
  );
}

export const toast = sonnerToast;
