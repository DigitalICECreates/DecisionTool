import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getDecisions, computeStats } from "@/lib/supabase/queries";

// Server layout for every protected screen. Middleware already guards these
// routes; we re-check here and load the data the header / profile sheet needs.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const decisions = await getDecisions();
  const stats = computeStats(decisions);

  return (
    <AppShell
      profile={{ full_name: profile.full_name, email: profile.email, created_at: profile.created_at }}
      stats={stats}
    >
      {children}
    </AppShell>
  );
}
