import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";

/**
 * Generic Card Component
 * Reusable card component that can be used across all sections
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.text - Card text (supports \n for line breaks)
 * @param {string} props.style - Card style: "elevated" | "default"
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.textClassName - CSS classes for text wrapper
 * @param {string|Object} props.borderLeftColor - Border left color ("orange" or color value)
 * @param {boolean} props.useDescription - Use CardDescription instead of div
 * @param {React.ReactNode} props.children - Custom content (overrides text prop)
 */
export function GenericCard({
  title,
  text,
  style = "default",
  className = "",
  textClassName = "",
  borderLeftColor,
  useDescription = false,
  children,
  styleObj,
}) {
  // Build className from style config
  let styleClass = style === "elevated" ? "card-elevated" : "";
  if (className) {
    styleClass = `${styleClass} ${className}`.trim();
  }

  // Build style object
  const finalStyleObj = { ...styleObj };
  if (borderLeftColor) {
    finalStyleObj.borderLeftColor =
      borderLeftColor === "orange" ? COLOR_ORANGE_PRIMARY : borderLeftColor;
  }

  const ContentWrapper = useDescription ? CardDescription : "div";
  const textClassNameFinal = useDescription
    ? "text-base leading-relaxed space-y-3"
    : "text-muted-foreground font-normal leading-relaxed space-y-3";

  // If children are provided, render them instead of text
  const hasChildren = children && React.Children.count(children) > 0;
  const hasText = text && text.trim() !== "";

  return (
    <Card
      className={styleClass}
      style={Object.keys(finalStyleObj).length > 0 ? finalStyleObj : undefined}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={textClassName}>
        {hasText && (
          <ContentWrapper className={textClassNameFinal}>
            {text.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ContentWrapper>
        )}
        {hasChildren && children}
      </CardContent>
    </Card>
  );
}
