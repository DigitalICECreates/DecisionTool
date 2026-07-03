"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { B } from "@/lib/constants";
import { IceLogo } from "@/components/ui/IceLogo";
import { Avatar } from "@/components/ui/Avatar";
import { SpectrumBar } from "@/components/ui/SpectrumBar";
import { ProfileSheet, type ProfileData } from "./ProfileSheet";
import type { DashboardStats } from "@/lib/supabase/queries";

export function AppShell({
  profile,
  stats,
  children,
}: {
  profile: ProfileData;
  stats: DashboardStats;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div style={{ background: B.offWhite, minHeight: "100vh" }}>
      {showProfile && (
        <ProfileSheet profile={profile} stats={stats} onClose={() => setShowProfile(false)} />
      )}

      {/* Header */}
      <div style={{ background: B.dark }}>
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            aria-label="Go to dashboard"
          >
            <IceLogo />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pathname === "/dashboard" && (
              <button
                onClick={() => router.push("/new")}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: B.yellow,
                  color: B.dark,
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + New Entry
              </button>
            )}
            <button
              onClick={() => setShowProfile(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              aria-label="Open profile"
            >
              <Avatar name={profile.full_name} size={38} />
            </button>
          </div>
        </div>
        <SpectrumBar />
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 20px 60px" }}>{children}</div>

      {/* Footer */}
      <div style={{ background: B.dark, padding: "16px 20px", textAlign: "center" }}>
        <SpectrumBar />
        <div style={{ paddingTop: "14px", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
          ice creates · leading behaviour change · icecreates.com
        </div>
      </div>
    </div>
  );
}
