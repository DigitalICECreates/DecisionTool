import type { ReactNode } from "react";
import { B } from "@/lib/constants";
import { IceLogo } from "@/components/ui/IceLogo";

function Blobs() {
  return (
    <>
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${B.purple}30, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: `radial-gradient(circle, ${B.teal}25, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${B.yellow}20, transparent 70%)`, pointerEvents: "none" }} />
    </>
  );
}

// Dark, brand-gradient backdrop shared by every auth screen.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.dark,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Blobs />
      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        <div style={{ marginBottom: "36px" }}>
          <IceLogo />
        </div>
        {children}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
          Each clinical leader has their own private space.
        </p>
      </div>
    </div>
  );
}

// White card used inside the auth shell.
export function AuthCard({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div style={{ background: B.white, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
      {title && <div style={{ fontSize: "20px", fontWeight: 800, color: B.dark, marginBottom: "6px" }}>{title}</div>}
      {subtitle && <div style={{ fontSize: "13px", color: B.muted, marginBottom: "24px", lineHeight: 1.5 }}>{subtitle}</div>}
      {children}
    </div>
  );
}
