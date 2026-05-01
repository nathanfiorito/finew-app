import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import { Drawer } from "vaul";
import "./BottomSheet.css";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints?: (number | string)[];
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function BottomSheetImpl(
  {
    open,
    onOpenChange,
    snapPoints,
    title,
    children,
    className,
  }: BottomSheetProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const classes = ["fw-sheet-content", className].filter(Boolean).join(" ");
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fw-sheet-overlay" />
        <Drawer.Content ref={ref} className={classes}>
          <span className="fw-sheet-handle" aria-hidden="true" />
          {title !== undefined ? (
            <header className="fw-sheet-head">
              <Drawer.Title className="fw-sheet-title">{title}</Drawer.Title>
            </header>
          ) : (
            <Drawer.Title className="sr-only">Sheet</Drawer.Title>
          )}
          <Drawer.Description className="sr-only">
            Bottom sheet
          </Drawer.Description>
          <div className="fw-sheet-body">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const BottomSheet = forwardRef(BottomSheetImpl);
BottomSheet.displayName = "BottomSheet";
