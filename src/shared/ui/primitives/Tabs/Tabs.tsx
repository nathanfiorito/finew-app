import type { ComponentPropsWithoutRef, ForwardedRef, JSX } from "react";
import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./Tabs.css";

type RootProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
type ListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
type TriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
type ContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

function joinClasses(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

function RootImpl(
  { className, ...rest }: RootProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={joinClasses("fw-tabs", className)}
      {...rest}
    />
  );
}
const Root = forwardRef(RootImpl);
Root.displayName = "Tabs.Root";

function ListImpl(
  { className, ...rest }: ListProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={joinClasses("fw-tabs-list", className)}
      {...rest}
    />
  );
}
const List = forwardRef(ListImpl);
List.displayName = "Tabs.List";

function TriggerImpl(
  { className, ...rest }: TriggerProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={joinClasses("fw-tabs-trigger", className)}
      {...rest}
    />
  );
}
const Trigger = forwardRef(TriggerImpl);
Trigger.displayName = "Tabs.Trigger";

function ContentImpl(
  { className, ...rest }: ContentProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={joinClasses("fw-tabs-content", className)}
      {...rest}
    />
  );
}
const Content = forwardRef(ContentImpl);
Content.displayName = "Tabs.Content";

export const Tabs = { Root, List, Trigger, Content };
export type { RootProps as TabsRootProps };
export type { ListProps as TabsListProps };
export type { TriggerProps as TabsTriggerProps };
export type { ContentProps as TabsContentProps };
