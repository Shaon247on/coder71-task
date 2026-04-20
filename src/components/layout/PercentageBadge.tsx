// src/components/layout/PercentageBadge.tsx

interface PercentageBadgeProps {
  ratio: number;
  side: "first" | "second";
}

export function PercentageBadge({ ratio, side }: PercentageBadgeProps) {
  const percentage =
    side === "first"
      ? Math.round(ratio * 100)
      : Math.round((1 - ratio) * 100);

  return (
    <div className="pointer-events-none rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white shadow">
      {percentage}%
    </div>
  );
}