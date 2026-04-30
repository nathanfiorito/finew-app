import type { ComponentPropsWithoutRef, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import "./Popover.css";

type RootProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>;
type TriggerProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>;
type ContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;
type CloseProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>;

function joinClasses(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

function Root(props: RootProps): JSX.Element {
  return <PopoverPrimitive.Root {...props} />;
}
Root.displayName = "Popover.Root";

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(function TriggerImpl(
  props,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  return <PopoverPrimitive.Trigger ref={ref} {...props} />;
});
Trigger.displayName = "Popover.Trigger";

const Content = forwardRef<HTMLDivElement, ContentProps>(function ContentImpl(
  { className, sideOffset = 6, ...rest }: ContentProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        className={joinClasses("fw-popover", className)}
        sideOffset={sideOffset}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
});
Content.displayName = "Popover.Content";

const Close = forwardRef<HTMLButtonElement, CloseProps>(function CloseImpl(
  props,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  return <PopoverPrimitive.Close ref={ref} {...props} />;
});
Close.displayName = "Popover.Close";

export const Popover = { Root, Trigger, Content, Close };
export type { RootProps as PopoverRootProps };
export type { TriggerProps as PopoverTriggerProps };
export type { ContentProps as PopoverContentProps };
export type { CloseProps as PopoverCloseProps };
