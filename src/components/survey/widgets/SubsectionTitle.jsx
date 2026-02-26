import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getIcon } from "@/lib/icons";
import { breakLinesAfterPeriod, capitalizeTitle } from "@/lib/utils";

/**
 * Reusable component for section and subsection titles
 * Used across all sections (executive, support, attributes, responses)
 *
 * @param {string} title - The title text to display
 * @param {React.Component|string} icon - Icon component or icon name string
 * @param {string} summary - Optional summary text to display below the title
 * @param {string} className - Additional CSS classes for the Card
 * @param {boolean} isExport - When true, card has no hover (static styles for export/print)
 */
export function SubsectionTitle({
  title,
  icon,
  summary,
  className = "",
  isExport = false,
}) {
  // Get icon component if icon is a string
  const IconComponent = typeof icon === "string" ? getIcon(icon) : icon;

  return (
    <Card
      className={`card-elevated ${isExport ? "export-subsection-title" : ""} ${className}`.trim()}
      disableHover={isExport}
      {...(isExport && {
        "data-word-export": "h2",
        "data-word-text": capitalizeTitle(title),
      })}
    >
      <CardHeader className="py-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {IconComponent && <IconComponent className="w-6 h-6" />}
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {capitalizeTitle(title)}
          </CardTitle>
        </div>
        {summary && (
          <CardDescription
            className="text-base leading-relaxed space-y-3 mt-4 pt-5 text-center"
            {...(isExport && {
              "data-word-export": "text",
              "data-word-text": breakLinesAfterPeriod(summary).trim(),
            })}
          >
            {breakLinesAfterPeriod(summary)
              .split("\n")
              .map((line, index) => (
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
