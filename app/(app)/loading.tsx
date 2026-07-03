import { B } from "@/lib/constants";

// Skeleton shown while a protected page streams in — never a blank screen.
export default function Loading() {
  const block = (h: number) => (
    <div style={{ height: h, borderRadius: "16px", background: B.light, opacity: 0.6 }} />
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "32px" }}>
      <div style={{ width: "60%" }}>{block(48)}</div>
      <div style={{ display: "flex", gap: "12px" }}>
        {block(96)}
        {block(96)}
        {block(96)}
      </div>
      {block(120)}
      {block(80)}
      {block(80)}
    </div>
  );
}
