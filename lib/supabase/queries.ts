import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Decision } from "@/types/database";
import type { DecisionTypeId } from "@/lib/constants";

export interface DashboardStats {
  total: number;
  thisMonth: number;
  successRate: number; // 0-100, rounded
  byType: Record<DecisionTypeId, number>;
}

// All decisions for the signed-in user, newest first. RLS guarantees we only
// ever get the current user's rows. Wrapped in React cache() so the layout and
// page in the same request share a single round-trip.
export const getDecisions = cache(async (): Promise<Decision[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("decision_timestamp", { ascending: false });

  if (error) throw error;
  return data ?? [];
});

export async function getDecision(id: string): Promise<Decision | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("decisions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// Derive the three dashboard stat cards + the type breakdown from a decision
// list. Kept as a pure function so it can run on already-fetched data.
export function computeStats(decisions: Decision[]): DashboardStats {
  const now = new Date();
  const total = decisions.length;

  const thisMonth = decisions.filter((d) => {
    const dm = new Date(d.decision_timestamp);
    return dm.getMonth() === now.getMonth() && dm.getFullYear() === now.getFullYear();
  }).length;

  const successful = decisions.filter((d) => d.outcome === "successful").length;
  const successRate = total ? Math.round((successful / total) * 100) : 0;

  const byType: Record<DecisionTypeId, number> = {
    decision: 0,
    non_decision: 0,
    anti_decision: 0,
  };
  for (const d of decisions) {
    if (d.type in byType) byType[d.type] += 1;
  }

  return { total, thisMonth, successRate, byType };
}

export const getCurrentProfile = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "",
    created_at: profile?.created_at ?? user.created_at,
  };
});
