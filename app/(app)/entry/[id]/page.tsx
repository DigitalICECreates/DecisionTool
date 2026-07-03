import { notFound } from "next/navigation";
import { getDecision } from "@/lib/supabase/queries";
import { DetailView } from "@/components/decisions/DetailView";

export default async function EntryPage({ params }: { params: { id: string } }) {
  const decision = await getDecision(params.id);
  if (!decision) notFound();

  return (
    <div style={{ paddingTop: "32px" }}>
      <DetailView d={decision} />
    </div>
  );
}
