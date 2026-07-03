import { B } from "@/lib/constants";

// ICE Decision Log lockup, ported from the prototype.
export function IceLogo({ dark = false }: { dark?: boolean }) {
  const c = dark ? B.dark : B.white;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "26px",
          fontWeight: 800,
          color: c,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        ice
      </span>
      <div style={{ width: "2px", height: "28px", background: B.yellow, borderRadius: "1px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 400,
            color: dark ? B.muted : "rgba(255,255,255,0.7)",
            letterSpacing: "0.02em",
            lineHeight: 1.3,
          }}
        >
          Decision Log
        </span>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: dark ? B.dark : B.white,
            letterSpacing: "0.02em",
            lineHeight: 1.3,
          }}
        >
          Clinical Leadership
        </span>
      </div>
    </div>
  );
}
