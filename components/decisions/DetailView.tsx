"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { B, decisionType, PRESSURES } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { OutcomeBadge } from "@/components/ui/OutcomeBadge";
import { deleteDecision } from "@/lib/actions";
import type { Decision } from "@/types/database";

export function DetailView({ d }: { d: Decision }) {
  const router = useRouter();
  const t = decisionType(d.type);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onDelete = async () => {
    setBusy(true);
    setError("");
    const result = await deleteDecision(d.id);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const facts: [string, string][] = [
    ["Date & Time", fmt(d.decision_timestamp)],
    ["Setting", d.setting || "—"],
    ["Pressure", d.pressure_level ? PRESSURES[d.pressure_level - 1] : "—"],
    ["Stakeholders", d.stakeholders || "—"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: B.muted,
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← Back to log
      </button>

      <div style={{ background: t.light, borderRadius: "16px", padding: "22px 24px", borderLeft: `5px solid ${t.color}` }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          <TypeBadge typeId={d.type} />
          <OutcomeBadge outcomeId={d.outcome} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: B.dark, margin: 0, lineHeight: 1.3 }}>{d.title}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {facts.map(([label, value]) => (
          <div key={label} style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "14px 16px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: B.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: B.dark }}>{value}</div>
          </div>
        ))}
      </div>

      {d.context_notes && (
        <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "18px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Context &amp; Reasoning
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: B.dark, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{d.context_notes}</p>
        </div>
      )}

      {d.reflection_notes && (
        <div style={{ background: `${B.yellow}18`, border: `1.5px solid ${B.yellow}60`, borderRadius: "12px", padding: "18px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: B.dark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Reflection Notes
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: B.dark, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{d.reflection_notes}</p>
        </div>
      )}

      {error && (
        <div style={{ background: "#FDEAEA", border: `1px solid ${B.coral}50`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: B.coral }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: `1px solid ${B.light}` }}>
        <button
          onClick={() => router.push(`/entry/${d.id}/edit`)}
          style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${B.dark}`, background: "transparent", color: B.dark, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
        >
          Edit Entry
        </button>
        {confirming ? (
          <>
            <button
              onClick={onDelete}
              disabled={busy}
              style={{ padding: "12px 18px", borderRadius: "12px", border: "none", background: B.coral, color: B.white, fontSize: "13px", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}
            >
              {busy ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={busy}
              style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${B.light}`, background: "transparent", color: B.muted, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{ padding: "12px 20px", borderRadius: "12px", border: `1.5px solid ${B.coral}50`, background: "transparent", color: B.coral, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
