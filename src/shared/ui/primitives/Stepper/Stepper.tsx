import type { ForwardedRef, JSX, ReactNode } from "react";
import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./Stepper.css";

export type StepperMode = "linear" | "free";

export interface StepperStep {
  value: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  current: string;
  onChange: (next: string) => void;
  mode?: StepperMode;
  children?: ReactNode;
  className?: string;
}

function StepperImpl(
  {
    steps,
    current,
    onChange,
    mode = "linear",
    children,
    className,
  }: StepperProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const currentIndex = steps.findIndex((s) => s.value === current);
  const classes = ["fw-stepper", className].filter(Boolean).join(" ");
  const handleValueChange = (next: string): void => {
    const nextIndex = steps.findIndex((s) => s.value === next);
    if (nextIndex === -1) return;
    if (mode === "linear" && nextIndex > currentIndex) return;
    onChange(next);
  };
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={classes}
      value={current}
      onValueChange={handleValueChange}
    >
      <TabsPrimitive.List asChild>
        <ol className="fw-stepper-list">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isFutureLinear = mode === "linear" && index > currentIndex;
            return (
              <li key={step.value} className="fw-stepper-step">
                <TabsPrimitive.Trigger
                  value={step.value}
                  className="fw-stepper-trigger"
                  disabled={isFutureLinear}
                  data-completed={isCompleted ? "true" : undefined}
                  aria-current={index === currentIndex ? "step" : undefined}
                >
                  <span className="fw-stepper-step-num">
                    {`Passo ${String(index + 1)}`}
                  </span>
                  <span className="fw-stepper-step-label">{step.label}</span>
                  {step.description !== undefined ? (
                    <span className="fw-stepper-step-desc">
                      {step.description}
                    </span>
                  ) : null}
                </TabsPrimitive.Trigger>
              </li>
            );
          })}
        </ol>
      </TabsPrimitive.List>
      <TabsPrimitive.Content
        value={current}
        forceMount
        className="fw-stepper-panel"
      >
        {children}
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}

export const Stepper = forwardRef(StepperImpl);
Stepper.displayName = "Stepper";
