import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

/**
 * Evolutionary Scorecard Component
 * 
 * Enhanced scorecard showing value, target, delta, and trend.
 * 
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {number} [props.target] - Target value
 * @param {number} [props.delta] - Delta (change) value
 * @param {string} [props.trend] - "up" | "down" | "neutral"
 * @param {string} [props.label] - Label for the scorecard
 * @param {Function} [props.format] - Custom formatter function
 * @param {string} [props.className] - Additional CSS classes
 */
export function EvolutionaryScorecard({
  value,
  target,
  delta,
  trend,
  label = "KPI",
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
  const isAboveTarget = target !== undefined && target !== null && value >= target;

  return (
    <div
      className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      role="region"
      aria-label={`Scorecard: ${label}, valor: ${format(value)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-foreground">
              {format(value)}
            </p>
            {target !== undefined && target !== null && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Meta: {format(target)}
                </span>
                {isAboveTarget && (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    ✓
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {getTrendDisplay()}
      </div>

      {target !== undefined && target !== null && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso em relação à meta</span>
            {targetProgress !== null && (
              <span>{targetProgress.toFixed(1)}%</span>
            )}
          </div>
          {targetProgress !== null && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAboveTarget
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

      {/* Delta information */}
      {delta !== undefined && delta !== null && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Variação:</span>
            <span
              className={`font-semibold ${
                delta > 0
                  ? "text-green-600 dark:text-green-400"
                  : delta < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {format(delta)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

