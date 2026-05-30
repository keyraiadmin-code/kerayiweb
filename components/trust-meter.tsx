import { cn } from "@/lib/utils";

interface TrustMeterProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrustMeter({
  score,
  showLabel = true,
  size = "md",
  className,
}: TrustMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    if (score >= 45) return "D";
    return "F";
  };

  const getLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 45) return "Poor";
    return "Very Low";
  };

  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn("text-muted-foreground", textSizes[size])}>
            Trust Score
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold",
                textSizes[size],
                clampedScore >= 80
                  ? "text-green-600"
                  : clampedScore >= 60
                  ? "text-yellow-600"
                  : clampedScore >= 40
                  ? "text-orange-600"
                  : "text-red-600"
              )}
            >
              {clampedScore}
            </span>
            <span
              className={cn(
                "font-semibold w-6 text-center rounded px-1",
                textSizes[size],
                clampedScore >= 80
                  ? "bg-green-100 text-green-700"
                  : clampedScore >= 60
                  ? "bg-yellow-100 text-yellow-700"
                  : clampedScore >= 40
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {getGrade(clampedScore)}
            </span>
          </div>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full", heights[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-500",
            heights[size],
            getColor(clampedScore)
          )}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground">{getLabel(clampedScore)}</p>
      )}
    </div>
  );
}
