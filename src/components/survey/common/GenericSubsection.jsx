import React from "react";
import { SubsectionTitle } from "../widgets/SubsectionTitle";
import { getIcon } from "@/lib/icons";

/**
 * Generic Subsection Component
 * Reusable subsection wrapper that can be used across all sections
 * 
 * @param {Object} props
 * @param {string} props.title - Subsection title
 * @param {string|React.Component} props.icon - Icon name or component
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.componentsContainerClassName - CSS classes for components container
 * @param {React.ReactNode} props.children - Subsection content
 */
export function GenericSubsection({
  title,
  icon,
  className = "",
  componentsContainerClassName = "grid gap-6",
  children,
}) {
  const IconComponent = typeof icon === "string" ? getIcon(icon) : icon;

  return (
    <section className={className}>
      <div className="space-y-6">
        {/* Subsection Title */}
        {title && (
          <SubsectionTitle title={title} icon={IconComponent} />
        )}

        {/* Content */}
        {children && (
          <div className={componentsContainerClassName}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

