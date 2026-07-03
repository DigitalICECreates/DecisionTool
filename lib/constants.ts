// ─────────────────────────────────────────────────────────────────────────────
// ICE Creates brand tokens + domain constants.
// Ported verbatim from the prototype (decision-tracker-reference.jsx) so the
// look and language carry through exactly. Decision-type and outcome ids match
// the database schema (see supabase/migrations) — the prototype's short ids
// ("non" / "anti") are mapped to the canonical DB values here.
// ─────────────────────────────────────────────────────────────────────────────

export const B = {
  dark: "#1A1130",
  yellow: "#F5C832",
  green: "#9DD13A",
  teal: "#2EC4B4",
  blue: "#59C4F0",
  purple: "#A88FD8",
  pink: "#F040A0",
  coral: "#EF5656",
  white: "#FFFFFF",
  offWhite: "#F7F6FA",
  light: "#EEECF5",
  mid: "#C4BED8",
  muted: "#7A7290",
} as const;

export type DecisionTypeId = "decision" | "non_decision" | "anti_decision";
export type OutcomeId = "pending" | "successful" | "partial" | "unsuccessful";

export interface DecisionTypeDef {
  id: DecisionTypeId;
  label: string;
  sub: string;
  color: string;
  light: string;
}

export const DECISION_TYPES: DecisionTypeDef[] = [
  { id: "decision", label: "Decision", sub: "A clear choice made", color: B.green, light: "#EDF8DC" },
  { id: "non_decision", label: "Non-Decision", sub: "Deferred or avoided", color: B.blue, light: "#DDF3FC" },
  { id: "anti_decision", label: "Anti-Decision", sub: "Counter to expectation", color: B.coral, light: "#FDEAEA" },
];

export const SETTINGS = [
  "Ward / Clinical Area",
  "Boardroom / Office",
  "MDT Meeting",
  "Corridor / Informal",
  "Telephone",
  "Teams",
  "Email",
  "Home",
  "External / Offsite",
  "Other",
];

// Index 0 == pressure level 1. Used as PRESSURES[level - 1].
export const PRESSURES = [
  "1 – Routine",
  "2 – Moderate",
  "3 – Significant",
  "4 – High Stakes",
  "5 – Crisis",
];

export interface OutcomeDef {
  id: OutcomeId;
  label: string;
  color: string;
}

export const OUTCOMES: OutcomeDef[] = [
  { id: "pending", label: "Pending", color: B.purple },
  { id: "successful", label: "Successful", color: B.green },
  { id: "partial", label: "Partial", color: B.yellow },
  { id: "unsuccessful", label: "Unsuccessful", color: B.coral },
];

export const SPECTRUM = [B.yellow, B.green, B.teal, B.blue, B.purple, B.pink, B.coral];

export function decisionType(id: string): DecisionTypeDef {
  return DECISION_TYPES.find((t) => t.id === id) ?? DECISION_TYPES[0];
}

export function outcome(id: string): OutcomeDef {
  return OUTCOMES.find((o) => o.id === id) ?? OUTCOMES[0];
}
