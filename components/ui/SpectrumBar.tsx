import { SPECTRUM } from "@/lib/constants";

// The 7-colour ICE brand bar used in the header and footer.
export function SpectrumBar() {
  return (
    <div style={{ display: "flex", height: "3px", overflow: "hidden" }}>
      {SPECTRUM.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}
