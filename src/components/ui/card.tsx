import * as React from "react";

import { cn } from "@/lib/utils";
import {
  RGBA_BLACK_SHADOW_40,
  RGBA_ORANGE_SHADOW_10,
  RGBA_BLACK_SHADOW_60,
  RGBA_ORANGE_SHADOW_20,
} from "@/lib/colors";

// Helper to merge style objects
const mergeStyles = (
  base: React.CSSProperties | undefined,
  override: React.CSSProperties | undefined
): React.CSSProperties => {
  return { ...base, ...override };
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, no hover shadow is applied (e.g. export/print preview) */
  disableHover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, disableHover, ...props }, ref) => {
    const defaultShadow = `0 6px 24px ${RGBA_BLACK_SHADOW_40}, 0 2px 6px ${RGBA_ORANGE_SHADOW_10}`;
    const hoverShadow = `0 8px 32px ${RGBA_BLACK_SHADOW_60}, 0 3px 12px ${RGBA_ORANGE_SHADOW_20}`;

    const style = mergeStyles(
      { boxShadow: disableHover ? "none" : defaultShadow },
      props.style
    );

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border-0 bg-card text-card-foreground transition-all duration-300",
          disableHover && "transition-none",
          className
        )}
        style={style}
        onMouseEnter={disableHover ? props.onMouseEnter : (e) => {
          e.currentTarget.style.boxShadow = hoverShadow;
          props.onMouseEnter?.(e as any);
        }}
        onMouseLeave={disableHover ? props.onMouseLeave : (e) => {
          e.currentTarget.style.boxShadow = defaultShadow;
          props.onMouseLeave?.(e as any);
        }}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
