"use client";

import { useMemo, useState } from "react";
import { B, DECISION_TYPES } from "@/lib/constants";
import { DecisionCard } from "./DecisionCard";
import type { Decision } from "@/types/database";

export function DecisionList({ decisions }: { decisions: Decision[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return decisions.filter((d) => {
      if (filter !== "all" && d.type !== filter) return false;
      if (
        q &&
        !d.title.toLowerCase().includes(q) &&
        !(d.context_notes ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [decisions, filter, search]);

  const filters = [{ id: "all", label: "All" }, ...DECISION_TYPES.map((t) => ({ id: t.id, label: t.label }))];

  return (
    <>
      {/* Filter + Search */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "7px 16px",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "12px",
              border: filter === f.id ? "none" : `1.5px solid ${B.light}`,
              background: filter === f.id ? B.dark : B.white,
              color: filter === f.id ? B.yellow : B.muted,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            {f.label}
          </button>
        ))}
        <input
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            borderRadius: "10px",
            border: `1.5px solid ${B.light}`,
            background: B.white,
            fontSize: "13px",
            color: B.dark,
            outline: "none",
          }}
        />
      </div>

      {/* Entry list */}
      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: B.dark, marginBottom: "8px" }}>
            No entries yet
          </div>
          <div style={{ fontSize: "13px", color: B.muted }}>
            Start logging your decisions, non-decisions and anti-decisions.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {visible.map((d) => (
            <DecisionCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </>
  );
}
