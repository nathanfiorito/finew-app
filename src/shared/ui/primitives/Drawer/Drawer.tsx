import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import { Drawer as VaulDrawer } from "vaul";
import "./Drawer.css";

export type DrawerSide = "left" | "right";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function DrawerImpl(
  {
    open,
    onOpenChange,
    side = "right",
    title,
    children,
    className,
  }: DrawerProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const classes = ["fw-drawer-content", className].filter(Boolean).join(" ");
  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={side}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fw-drawer-overlay" />
        <VaulDrawer.Content ref={ref} className={classes}>
          {title !== undefined ? (
            <header className="fw-drawer-head">
              <VaulDrawer.Title className="fw-drawer-title">
                {title}
              </VaulDrawer.Title>
            </header>
          ) : (
            <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>
          )}
          <VaulDrawer.Description className="sr-only">
            Drawer panel
          </VaulDrawer.Description>
          <div className="fw-drawer-body">{children}</div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

export const Drawer = forwardRef(DrawerImpl);
Drawer.displayName = "Drawer";
