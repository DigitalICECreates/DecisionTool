import Link from "next/link";
import { notFound } from "next/navigation";
import { B } from "@/lib/constants";
import { toLocalInput } from "@/lib/utils";
import { getDecision } from "@/lib/supabase/queries";
import { DecisionForm } from "@/components/decisions/DecisionForm";
import type { DecisionFormValues } from "@/lib/schema";

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const d = await getDecision(params.id);
  if (!d) notFound();

  const initial: DecisionFormValues = {
    type: d.type,
    title: d.title,
    timestamp: toLocalInput(d.decision_timestamp),
    setting: d.setting ?? "",
    pressure: d.pressure_level ?? 3,
    context: d.context_notes ?? "",
    stakeholders: d.stakeholders ?? "",
    outcome: d.outcome,
    notes: d.reflection_notes ?? "",
  };

  return (
    <div style={{ paddingTop: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link
          href={`/entry/${d.id}`}
          style={{ color: B.muted, fontSize: "13px", fontWeight: 600, textDecoration: "none", marginBottom: "12px", display: "block" }}
        >
          ← Back
        </Link>
        <div style={{ fontSize: "22px", fontWeight: 800, color: B.dark }}>Edit this entry</div>
        <div style={{ fontSize: "13px", color: B.muted, marginTop: "4px" }}>Be direct, honest, and specific.</div>
      </div>
      <DecisionForm initial={initial} editingId={d.id} cancelHref={`/entry/${d.id}`} />
    </div>
  );
}
