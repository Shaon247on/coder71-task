// components/layout/PercentageBadge.tsx
// Purpose: Floating badge that displays the current panel size as a percentage.
// Shown during active resize on both sides of the drag handle.

interface PercentageBadgeProps {
  ratio: number;   // 0–1
  side: "first" | "second";
}

export function PercentageBadge({ ratio, side }: PercentageBadgeProps) {
  const pct = side === "first"
    ? Math.round(ratio * 100)
    : Math.round((1 - ratio) * 100);

  return (
    <div
      className="
        absolute z-20 pointer-events-none
        bg-black/70 text-white text-xs font-mono font-bold
        px-2 py-1 rounded-md backdrop-blur-sm
        select-none
      "
      style={{
        // Position badge in the center of each child panel
        ...(side === "first"
          ? { left: "50%", transform: "translateX(-50%)" }
          : { right: "50%", transform: "translateX(50%)" }),
        top: "50%",
        marginTop: "-12px",
      }}
    >
      {pct}%
    </div>
  );
}