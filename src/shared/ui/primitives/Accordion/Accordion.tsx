import type { ComponentPropsWithoutRef, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Icon } from "../Icon/Icon.js";
import "./Accordion.css";

type RootProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>;
type ItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;
type TriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;
type ContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

function joinClasses(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const Root = forwardRef<HTMLDivElement, RootProps>(function RootImpl(
  { className, ...rest },
  ref,
): JSX.Element {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={joinClasses("fw-accordion", className)}
      {...rest}
    />
  );
});
Root.displayName = "Accordion.Root";

const Item = forwardRef<HTMLDivElement, ItemProps>(function ItemImpl(
  { className, ...rest }: ItemProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={joinClasses("fw-accordion-item", className)}
      {...rest}
    />
  );
});
Item.displayName = "Accordion.Item";

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(function TriggerImpl(
  { className, children, ...rest }: TriggerProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  return (
    <AccordionPrimitive.Header className="fw-accordion-header">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={joinClasses("fw-accordion-trigger", className)}
        {...rest}
      >
        <span>{children}</span>
        <span className="fw-accordion-chevron" aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
Trigger.displayName = "Accordion.Trigger";

const Content = forwardRef<HTMLDivElement, ContentProps>(function ContentImpl(
  { className, children, ...rest }: ContentProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={joinClasses("fw-accordion-content", className)}
      {...rest}
    >
      <div className="fw-accordion-content-inner">{children}</div>
    </AccordionPrimitive.Content>
  );
});
Content.displayName = "Accordion.Content";

export const Accordion = { Root, Item, Trigger, Content };
export type { RootProps as AccordionRootProps };
export type { ItemProps as AccordionItemProps };
export type { TriggerProps as AccordionTriggerProps };
export type { ContentProps as AccordionContentProps };
