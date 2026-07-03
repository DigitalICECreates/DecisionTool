import type { CSSProperties } from "react";
import { B } from "./constants";

// Shared input + label styling, ported from the prototype so every field looks
// identical across the auth screens and the decision form.
export const inp: CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${B.light}`,
  background: B.white,
  fontSize: "14px",
  color: B.dark,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export const lbl: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: B.muted,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "7px",
  display: "block",
};

export const errorBox: CSSProperties = {
  background: "#FDEAEA",
  border: `1px solid ${B.coral}50`,
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  color: B.coral,
};

export const darkBtn: CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: B.dark,
  color: B.yellow,
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};
