"use client";

import { useEffect } from "react";
import { B } from "@/lib/constants";

// Error boundary for the protected app — the app never shows a blank crash.
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px", maxWidth: "440px", margin: "0 auto" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: B.dark, marginBottom: "8px" }}>
        Something went wrong
      </div>
      <div style={{ fontSize: "13px", color: B.muted, marginBottom: "24px", lineHeight: 1.6 }}>
        We hit a snag loading this. Your data is safe — try again.
      </div>
      <button
        onClick={reset}
        style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: B.dark, color: B.yellow, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
