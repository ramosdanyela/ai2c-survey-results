import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getIcon } from "@/lib/icons";

/**
 * Reusable component for section and subsection titles
 * Used across all sections (executive, support, attributes, responses)
 *
 * @param {string} title - The title text to display
 * @param {React.Component|string} icon - Icon component or icon name string
 * @param {string} summary - Optional summary text to display below the title
 * @param {string} className - Additional CSS classes for the Card
 */
export function SubsectionTitle({ title, icon, summary, className = "" }) {
  // Get icon component if icon is a string
  const IconComponent = typeof icon === "string" ? getIcon(icon) : icon;

  return (
    <Card className={`card-elevated ${className}`}>
      <CardHeader className="py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {IconComponent && <IconComponent className="w-6 h-6" />}
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {title}
          </CardTitle>
        </div>
        {summary && (
          <CardDescription className="text-base leading-relaxed space-y-3 mt-4 text-center">
            {summary.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
