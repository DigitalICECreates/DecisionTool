import { B, DECISION_TYPES } from "@/lib/constants";
import { fmt, greeting } from "@/lib/utils";
import { getCurrentProfile, getDecisions, computeStats } from "@/lib/supabase/queries";
import { StatCard } from "@/components/ui/StatCard";
import { Dot } from "@/components/ui/Dot";
import { DecisionList } from "@/components/decisions/DecisionList";

export default async function DashboardPage() {
  const [profile, decisions] = await Promise.all([getCurrentProfile(), getDecisions()]);
  const stats = computeStats(decisions);
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  const successAccent =
    stats.total === 0 ? B.yellow : stats.successRate > 60 ? B.green : stats.successRate > 40 ? B.yellow : B.coral;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingTop: "32px" }}>
      <div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: B.dark }}>
          Good {greeting()}, <span style={{ color: B.teal }}>{firstName}.</span>
        </div>
        <div style={{ fontSize: "13px", color: B.muted, marginTop: "4px" }}>
          {fmt(new Date().toISOString(), "date")} · Your personal decision log
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <StatCard label="This Month" value={stats.thisMonth} accent={B.teal} />
        <StatCard label="Total Entries" value={stats.total} accent={B.purple} />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} accent={successAccent} />
      </div>

      {/* Type breakdown */}
      {stats.total > 0 && (
        <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "16px", padding: "20px 22px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
            Breakdown by type
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {DECISION_TYPES.map((t) => {
              const count = stats.byType[t.id];
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={t.id} style={{ flex: 1 }}>
                  <div style={{ height: "8px", borderRadius: "4px", background: B.light, overflow: "hidden", marginBottom: "8px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: t.color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Dot color={t.color} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: B.dark }}>{count}</span>
                    <span style={{ fontSize: "11px", color: B.muted }}>{t.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DecisionList decisions={decisions} />
    </div>
  );
}
