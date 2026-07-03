"use client";

import { useRouter } from "next/navigation";
import { B, decisionType, PRESSURES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { OutcomeBadge } from "@/components/ui/OutcomeBadge";
import type { Decision } from "@/types/database";

export function DecisionCard({ d }: { d: Decision }) {
  const router = useRouter();
  const t = decisionType(d.type);
  const context = d.context_notes ?? "";

  return (
    <div
      onClick={() => router.push(`/entry/${d.id}`)}
      style={{
        background: B.white,
        border: `1.5px solid ${B.light}`,
        borderRadius: "16px",
        padding: "18px 22px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderLeft: `4px solid ${t.color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(26,17,48,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = t.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = B.light;
        e.currentTarget.style.borderLeftColor = t.color;
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
            <TypeBadge typeId={d.type} small />
            <OutcomeBadge outcomeId={d.outcome} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: B.dark, lineHeight: 1.4 }}>{d.title}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: B.muted }}>{fmt(d.decision_timestamp, "date")}</div>
          <div style={{ fontSize: "11px", color: B.mid, marginTop: "2px" }}>{fmt(d.decision_timestamp, "time")}</div>
        </div>
      </div>

      {(d.setting || d.pressure_level) && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {d.setting && <span style={{ fontSize: "12px", color: B.muted }}>📍 {d.setting}</span>}
          {d.pressure_level && (
            <span style={{ fontSize: "12px", color: B.muted }}>⚡ {PRESSURES[d.pressure_level - 1]}</span>
          )}
        </div>
      )}

      {context && (
        <div
          style={{
            fontSize: "13px",
            color: B.muted,
            lineHeight: 1.6,
            borderTop: `1px solid ${B.light}`,
            paddingTop: "10px",
          }}
        >
          {context.slice(0, 130)}
          {context.length > 130 ? "…" : ""}
        </div>
      )}
    </div>
  );
}
