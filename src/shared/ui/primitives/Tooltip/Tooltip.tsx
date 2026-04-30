import type { JSX, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./Tooltip.css";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: TooltipSide;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps): JSX.Element {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="fw-tooltip"
            side={side}
            sideOffset={6}
          >
            {content}
            <TooltipPrimitive.Arrow className="fw-tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
