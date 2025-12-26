import { Card, CardHeader, CardTitle } from "@/components/ui-components/card";
import { getIcon } from "@/lib/icons";

/**
 * Reusable component for section and subsection titles
 * Used across all sections (executive, support, attributes, responses)
 * 
 * @param {string} title - The title text to display
 * @param {React.Component|string} icon - Icon component or icon name string
 * @param {string} className - Additional CSS classes for the Card
 */
export function SubsectionTitle({ title, icon, className = "" }) {
  // Get icon component if icon is a string
  const IconComponent = typeof icon === "string" ? getIcon(icon) : icon;

  return (
    <Card className={`card-elevated ${className}`}>
      <CardHeader className="py-6 flex items-center justify-center">
        <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
          {IconComponent && <IconComponent className="w-6 h-6" />}
          {title}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

