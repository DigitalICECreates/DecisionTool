import Link from "next/link";
import { B } from "@/lib/constants";
import { DecisionForm } from "@/components/decisions/DecisionForm";

export default function NewEntryPage() {
  return (
    <div style={{ paddingTop: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/dashboard"
          style={{ color: B.muted, fontSize: "13px", fontWeight: 600, textDecoration: "none", marginBottom: "12px", display: "block" }}
        >
          ← Back
        </Link>
        <div style={{ fontSize: "22px", fontWeight: 800, color: B.dark }}>Log a new entry</div>
        <div style={{ fontSize: "13px", color: B.muted, marginTop: "4px" }}>Be direct, honest, and specific.</div>
      </div>
      <DecisionForm cancelHref="/dashboard" />
    </div>
  );
}
