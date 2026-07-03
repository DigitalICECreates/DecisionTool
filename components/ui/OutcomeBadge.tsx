import { outcome } from "@/lib/constants";

export function OutcomeBadge({ outcomeId }: { outcomeId: string }) {
  const o = outcome(outcomeId);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "6px",
        border: `1.5px solid ${o.color}50`,
        color: o.color,
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {o.label}
    </span>
  );
}
