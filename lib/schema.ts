import { z } from "zod";

// Single source of truth for the decision form — used by React Hook Form on the
// client (via @hookform/resolvers/zod) and re-validated in the server action.
export const decisionSchema = z.object({
  type: z.enum(["decision", "non_decision", "anti_decision"]),
  title: z.string().trim().min(1, "Describe the decision."),
  // datetime-local value, e.g. "2024-05-01T13:30"
  timestamp: z.string().min(1, "Add a date and time."),
  setting: z.string().optional().default(""),
  pressure: z.coerce.number().int().min(1).max(5).default(3),
  context: z.string().optional().default(""),
  stakeholders: z.string().optional().default(""),
  outcome: z.enum(["pending", "successful", "unsuccessful"]).default("pending"),
  notes: z.string().optional().default(""),
});

export type DecisionFormValues = z.infer<typeof decisionSchema>;

export const profileNameSchema = z.object({
  full_name: z.string().trim().min(1, "Tell us your name.").max(120),
});
