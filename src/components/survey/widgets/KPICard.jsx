import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

/**
 * KPI Card Component
 * 
 * Displays a Key Performance Indicator with value, label, optional delta, trend, and target.
 * 
 * @param {Object} props
 * @param {number} props.value - Main KPI value
 * @param {string} props.label - Descriptive label
 * @param {number} [props.delta] - Change value (positive or negative)
 * @param {string} [props.trend] - "up" | "down" | "neutral"
 * @param {number} [props.target] - Target value
 * @param {Function} [props.format] - Custom formatter function (value) => string
 * @param {string} [props.className] - Additional CSS classes
 */
export function KPICard({
  value,
  label,
  delta,
  trend,
  target,
  format = (val) => val?.toLocaleString("pt-BR") || "0",
  className = "",
}) {
  // Determine trend icon and color
  const getTrendDisplay = () => {
    if (!trend && delta === undefined) return null;

    const actualTrend = trend || (delta > 0 ? "up" : delta < 0 ? "down" : "neutral");
    const deltaValue = delta !== undefined ? Math.abs(delta) : null;

    let Icon, color, bgColor;
    switch (actualTrend) {
      case "up":
        Icon = TrendingUp;
        color = "text-green-600 dark:text-green-400";
        bgColor = "bg-green-100 dark:bg-green-900/30";
        break;
      case "down":
        Icon = TrendingDown;
        color = "text-red-600 dark:text-red-400";
        bgColor = "bg-red-100 dark:bg-red-900/30";
        break;
      default:
        Icon = Minus;
        color = "text-gray-600 dark:text-gray-400";
        bgColor = "bg-gray-100 dark:bg-gray-800";
    }

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${bgColor}`}>
        <Icon className={`w-4 h-4 ${color}`} />
        {deltaValue !== null && (
          <span className={`text-sm font-semibold ${color}`}>
            {deltaValue > 0 ? "+" : ""}
            {format(deltaValue)}
          </span>
        )}
      </div>
    );
  };

  // Calculate progress towards target
  const getTargetProgress = () => {
    if (target === undefined || target === null || target === 0) return null;
    const progress = Math.min((value / target) * 100, 100);
    return progress;
  };

  const targetProgress = getTargetProgress();

  return (
    <div
      className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      role="region"
      aria-label={`KPI: ${label}, valor: ${format(value)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {format(value)}
          </p>
        </div>
        {getTrendDisplay()}
      </div>

      {target !== undefined && target !== null && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Meta: {format(target)}</span>
            {targetProgress !== null && (
              <span>{targetProgress.toFixed(1)}%</span>
            )}
          </div>
          {targetProgress !== null && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  targetProgress >= 100
                    ? "bg-green-600"
                    : targetProgress >= 75
                    ? "bg-blue-600"
                    : targetProgress >= 50
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
                style={{ width: `${targetProgress}%` }}
                role="progressbar"
                aria-valuenow={targetProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}


