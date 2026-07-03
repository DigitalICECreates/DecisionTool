import { B, decisionType } from "@/lib/constants";
import { Dot } from "./Dot";

export function TypeBadge({ typeId, small = false }: { typeId: string; small?: boolean }) {
  const t = decisionType(typeId);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: small ? "3px 9px" : "4px 12px",
        borderRadius: "999px",
        background: t.light,
        color: t.color,
        fontSize: small ? "11px" : "12px",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Dot color={t.color} size={6} />
      {t.label}
    </span>
  );
}
