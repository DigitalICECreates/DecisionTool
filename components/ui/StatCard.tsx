import { B } from "@/lib/constants";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: B.white,
        border: `1.5px solid ${B.light}`,
        borderRadius: "16px",
        padding: "20px 22px",
        flex: 1,
        minWidth: "100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: accent || B.yellow,
          borderRadius: "16px 16px 0 0",
        }}
      />
      <div style={{ fontSize: "34px", fontWeight: 800, color: B.dark, lineHeight: 1 }}>{value}</div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: B.muted,
          letterSpacing: "0.05em",
          marginTop: "6px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
