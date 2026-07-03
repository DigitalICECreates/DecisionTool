import Link from "next/link";
import { B } from "@/lib/constants";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.offWhite,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
      <div style={{ fontSize: "20px", fontWeight: 800, color: B.dark, marginBottom: "8px" }}>
        Page not found
      </div>
      <div style={{ fontSize: "13px", color: B.muted, marginBottom: "24px" }}>
        That entry or page doesn&apos;t exist.
      </div>
      <Link
        href="/dashboard"
        style={{ padding: "12px 28px", borderRadius: "10px", background: B.dark, color: B.yellow, fontSize: "14px", fontWeight: 700, textDecoration: "none" }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
