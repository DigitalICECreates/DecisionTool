"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { B, DECISION_TYPES, OUTCOMES, SETTINGS, PRESSURES } from "@/lib/constants";
import { decisionSchema, type DecisionFormValues } from "@/lib/schema";
import { inp, lbl, errorBox } from "@/lib/styles";
import { Dot } from "@/components/ui/Dot";
import { VoiceInput, VoiceArea } from "@/components/ui/VoiceInput";
import { createDecision, updateDecision } from "@/lib/actions";

const defaults: DecisionFormValues = {
  type: "decision",
  title: "",
  timestamp: new Date().toISOString().slice(0, 16),
  setting: "",
  pressure: 3,
  context: "",
  stakeholders: "",
  outcome: "pending",
  notes: "",
};

function SectionHead({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        color: B.dark,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        borderBottom: `2px solid ${B.yellow}`,
        paddingBottom: "6px",
        marginBottom: "16px",
      }}
    >
      {children}
    </div>
  );
}

export function DecisionForm({
  initial,
  editingId,
  cancelHref,
}: {
  initial?: Partial<DecisionFormValues>;
  editingId?: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: { ...defaults, ...initial },
  });

  const form = watch();
  // setValue's path-value typing chokes on the Zod default/coerce union, so we
  // cast the value — the key is still type-checked against the form shape.
  const set = <K extends keyof DecisionFormValues>(k: K, v: DecisionFormValues[K]) =>
    setValue(k, v as never, { shouldValidate: true });

  const onSubmit = async (values: DecisionFormValues) => {
    setServerError("");
    const result = editingId
      ? await updateDecision(editingId, values)
      : await createDecision(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(editingId ? `/entry/${editingId}` : "/dashboard");
    router.refresh();
  };

  const valid = (form.title ?? "").trim().length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* The detail */}
      <div>
        <SectionHead>The detail</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={lbl}>Describe the decision *</label>
            <VoiceInput
              value={form.title ?? ""}
              onChange={(v) => set("title", v)}
              placeholder="e.g. Agreed to escalate Patient A to ICU following MDT review"
              style={{ fontSize: "15px", fontWeight: 500 }}
            />
            {errors.title && (
              <div style={{ fontSize: "12px", color: B.coral, fontWeight: 600, marginTop: "6px" }}>
                {errors.title.message}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={lbl}>Date &amp; Time</label>
              <input type="datetime-local" style={inp} {...register("timestamp")} />
            </div>
            <div>
              <label style={lbl}>Setting</label>
              <select style={{ ...inp, cursor: "pointer" }} {...register("setting")}>
                <option value="">Select…</option>
                {SETTINGS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Context &amp; Reasoning</label>
            <VoiceArea
              value={form.context ?? ""}
              onChange={(v) => set("context", v)}
              placeholder="What was happening? What informed this?"
              height="90px"
            />
          </div>
          <div>
            <label style={lbl}>Stakeholders Involved</label>
            <VoiceInput
              value={form.stakeholders ?? ""}
              onChange={(v) => set("stakeholders", v)}
              placeholder="e.g. MDT, Executive Board, Patient, Family…"
            />
          </div>
        </div>
      </div>

      {/* Decision Pressure */}
      <div>
        <SectionHead>Decision Pressure</SectionHead>
        <div style={{ background: B.offWhite, borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: B.muted }}>Current level:</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: B.dark }}>
              {PRESSURES[(form.pressure ?? 3) - 1]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={form.pressure ?? 3}
            onChange={(e) => set("pressure", Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "10px", color: B.mid }}>Routine</span>
            <span style={{ fontSize: "10px", color: B.mid }}>Crisis</span>
          </div>
        </div>
      </div>

      {/* Decision Type */}
      <div>
        <SectionHead>Decision Type</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {DECISION_TYPES.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => set("type", t.id)}
              style={{
                padding: "16px 10px",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "center",
                border: form.type === t.id ? `2px solid ${t.color}` : `1.5px solid ${B.light}`,
                background: form.type === t.id ? t.light : B.white,
                transition: "all 0.2s",
                boxShadow: form.type === t.id ? `0 4px 16px ${t.color}30` : "none",
              }}
            >
              <Dot color={t.color} size={10} />
              <div style={{ fontWeight: 700, fontSize: "12px", color: t.color, marginTop: "8px" }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: B.muted, marginTop: "3px" }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Outcome */}
      <div>
        <SectionHead>Outcome</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {OUTCOMES.map((o) => (
            <button
              type="button"
              key={o.id}
              onClick={() => set("outcome", o.id)}
              style={{
                padding: "12px 6px",
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "center",
                border: form.outcome === o.id ? `2px solid ${o.color}` : `1.5px solid ${B.light}`,
                background: form.outcome === o.id ? `${o.color}15` : B.white,
                color: form.outcome === o.id ? o.color : B.muted,
                fontSize: "12px",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reflection */}
      <div>
        <SectionHead>Reflection</SectionHead>
        <VoiceArea
          value={form.notes ?? ""}
          onChange={(v) => set("notes", v)}
          placeholder="What would you do differently? What did you learn?"
          height="90px"
        />
      </div>

      {serverError && <div style={errorBox}>{serverError}</div>}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: `1.5px solid ${B.light}`,
            background: "transparent",
            color: B.muted,
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid || isSubmitting}
          style={{
            flex: 2,
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: valid ? B.dark : B.mid,
            color: valid ? B.yellow : B.white,
            fontSize: "14px",
            fontWeight: 700,
            cursor: valid && !isSubmitting ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {isSubmitting ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
