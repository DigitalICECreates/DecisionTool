"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decisionSchema, profileNameSchema, type DecisionFormValues } from "@/lib/schema";
import type { DecisionInsert } from "@/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

// Map the form shape (prototype field names) -> database columns.
function toRow(values: DecisionFormValues): Omit<DecisionInsert, "user_id"> {
  return {
    type: values.type,
    title: values.title.trim(),
    decision_timestamp: new Date(values.timestamp).toISOString(),
    setting: values.setting?.trim() || null,
    pressure_level: values.pressure,
    context_notes: values.context?.trim() || null,
    stakeholders: values.stakeholders?.trim() || null,
    outcome: values.outcome,
    reflection_notes: values.notes?.trim() || null,
  };
}

export async function createDecision(values: DecisionFormValues): Promise<ActionResult> {
  const parsed = decisionSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid entry." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { error } = await supabase
    .from("decisions")
    .insert({ ...toRow(parsed.data), user_id: user.id });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateDecision(
  id: string,
  values: DecisionFormValues
): Promise<ActionResult> {
  const parsed = decisionSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid entry." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired. Please sign in again." };

  // RLS also enforces ownership; the user_id filter is belt-and-braces.
  const { error } = await supabase
    .from("decisions")
    .update(toRow(parsed.data))
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/entry/${id}`);
  return { ok: true };
}

export async function deleteDecision(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { error } = await supabase.from("decisions").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProfileName(fullName: string): Promise<ActionResult> {
  const parsed = profileNameSchema.safeParse({ full_name: fullName });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid name." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: profileError.message };

  // Keep auth metadata in sync so greetings work even before profile loads.
  await supabase.auth.updateUser({ data: { full_name: parsed.data.full_name } });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
