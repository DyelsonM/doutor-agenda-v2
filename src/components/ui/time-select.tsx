"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useSlowScroll } from "@/hooks/use-slow-scroll";

interface TimeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function TimeSelect({
  value,
  onValueChange,
  placeholder = "Selecione um horário",
  disabled = false,
  children,
  className,
}: TimeSelectProps) {
  const scrollRef = useSlowScroll({ speed: 0.2, smoothness: 200 });

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <ClockIcon className="text-muted-foreground size-4" />
          <SelectPrimitive.Value placeholder={placeholder} />
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[280px] min-w-[12rem] overflow-hidden rounded-md border shadow-md",
            "scroll-smooth",
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton className="bg-background/95 border-border/50 sticky top-0 z-10 flex cursor-default items-center justify-center border-b py-1 backdrop-blur-sm">
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport
            ref={scrollRef}
            className="custom-scrollbar max-h-[240px] overflow-y-auto scroll-smooth p-1"
          >
            {children}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="bg-background/95 border-border/50 sticky bottom-0 z-10 flex cursor-default items-center justify-center border-t py-1 backdrop-blur-sm">
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

interface TimeSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function TimeSelectItem({
  value,
  children,
  disabled = false,
  className,
}: TimeSelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 relative flex w-full cursor-default items-center gap-2 rounded-sm py-2 pr-8 pl-3 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { TimeSelect, TimeSelectItem };
