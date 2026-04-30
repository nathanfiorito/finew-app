import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon } from "../Icon/Icon.js";
import "./Modal.css";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: ModalSize;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function ModalImpl(
  {
    open,
    onOpenChange,
    size = "md",
    title,
    description,
    children,
    footer,
    className,
  }: ModalProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const classes = ["fw-modal-content", `fw-modal-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fw-modal-overlay" />
        <Dialog.Content
          ref={ref}
          className={classes}
        >
          {title !== undefined || description !== undefined ? (
            <header className="fw-modal-head">
              <div className="fw-modal-titles">
                {title ? (
                  <Dialog.Title className="fw-modal-title">{title}</Dialog.Title>
                ) : (
                  <Dialog.Title className="fw-modal-title sr-only" />
                )}
                {description ? (
                  <Dialog.Description className="fw-modal-desc">
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="fw-modal-close"
                  aria-label="Close"
                >
                  <Icon name="close" size={18} />
                </button>
              </Dialog.Close>
            </header>
          ) : null}
          <div className="fw-modal-body">{children}</div>
          {footer ? <div className="fw-modal-foot">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Modal = forwardRef(ModalImpl);
Modal.displayName = "Modal";
