"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { B } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { inp } from "@/lib/styles";
import { Avatar } from "@/components/ui/Avatar";
import { updateProfileName, signOut } from "@/lib/actions";
import type { DashboardStats } from "@/lib/supabase/queries";

export interface ProfileData {
  full_name: string;
  email: string;
  created_at: string;
}

export function ProfileSheet({
  profile,
  stats,
  onClose,
}: {
  profile: ProfileData;
  stats: DashboardStats;
  onClose: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(profile.full_name);
  const [busy, setBusy] = useState(false);

  const saveName = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    const result = await updateProfileName(newName.trim());
    setBusy(false);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    }
  };

  const cards: [string, string | number, string][] = [
    ["Total Entries", stats.total, B.green],
    ["This Month", stats.thisMonth, B.blue],
    ["Success Rate", `${stats.successRate}%`, B.yellow],
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,17,48,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: B.white,
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: "700px",
          padding: "12px 28px 48px",
          boxShadow: "0 -16px 60px rgba(26,17,48,0.25)",
        }}
      >
        <div style={{ width: "44px", height: "4px", borderRadius: "2px", background: B.light, margin: "0 auto 24px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <Avatar name={profile.full_name} size={56} />
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ ...inp, padding: "7px 12px", fontSize: "15px", flex: 1, width: "auto" }}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                />
                <button
                  onClick={saveName}
                  disabled={busy}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: B.dark, color: B.yellow, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                >
                  {busy ? "…" : "Save"}
                </button>
                <button
                  onClick={() => { setNewName(profile.full_name); setEditing(false); }}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: `1px solid ${B.light}`, background: "transparent", color: B.muted, cursor: "pointer", fontSize: "12px" }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: B.dark }}>{profile.full_name}</div>
                <button
                  onClick={() => setEditing(true)}
                  style={{ background: "none", border: "none", color: B.teal, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                >
                  Edit
                </button>
              </div>
            )}
            <div style={{ fontSize: "12px", color: B.muted, marginTop: "2px" }}>{profile.email}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {cards.map(([l, v, c]) => (
            <div key={l} style={{ background: B.offWhite, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: c }} />
              <div style={{ fontSize: "26px", fontWeight: 800, color: B.dark }}>{v}</div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: B.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: B.mid, marginBottom: "20px" }}>
          Member since {fmt(profile.created_at, "date")}
        </div>

        <button
          onClick={() => signOut()}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `2px solid ${B.coral}40`, background: "transparent", color: B.coral, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
