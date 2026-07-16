// Local-only auth bypass so the UI can be worked on without a live Supabase
// session. Gated on NODE_ENV as well as the flag so it can never activate in
// a production build, even if DEV_BYPASS_AUTH leaks into deployment env vars.
import type { Decision } from "@/types/database";

export const DEV_BYPASS_AUTH =
  process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH === "true";

export const mockProfile = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "digital@icecreates.com",
  full_name: "ICE Creates",
  created_at: "2026-01-01T09:00:00.000Z",
};

export const mockDecisions: Decision[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    user_id: mockProfile.id,
    type: "decision",
    title: "Approved winter surge staffing plan",
    decision_timestamp: "2026-07-10T09:30:00.000Z",
    setting: "Boardroom / Office",
    pressure_level: 4,
    context_notes: "Needed sign-off before the trust board meeting.",
    stakeholders: "Director of Nursing, Ops Lead",
    outcome: "successful",
    reflection_notes: "Held up well through the first surge weekend.",
    created_at: "2026-07-10T09:30:00.000Z",
    updated_at: "2026-07-10T09:30:00.000Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    user_id: mockProfile.id,
    type: "non_decision",
    title: "Deferred rollout of new triage software",
    decision_timestamp: "2026-07-05T14:00:00.000Z",
    setting: "MDT Meeting",
    pressure_level: 2,
    context_notes: "Wanted another quarter of pilot data first.",
    stakeholders: "IT Lead",
    outcome: "pending",
    reflection_notes: null,
    created_at: "2026-07-05T14:00:00.000Z",
    updated_at: "2026-07-05T14:00:00.000Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    user_id: mockProfile.id,
    type: "anti_decision",
    title: "Overruled recommendation to cut weekend cover",
    decision_timestamp: "2026-06-28T11:15:00.000Z",
    setting: "Corridor / Informal",
    pressure_level: 5,
    context_notes: "Went against the budget recommendation on safety grounds.",
    stakeholders: "Finance Director",
    outcome: "successful",
    reflection_notes: "Right call clinically; revisit the budget conversation next cycle.",
    created_at: "2026-06-28T11:15:00.000Z",
    updated_at: "2026-06-28T11:15:00.000Z",
  },
];
