// Small shared helpers ported from the prototype.

export function fmt(iso: string, mode: "full" | "date" | "time" = "full"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  if (mode === "date")
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (mode === "time")
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return (name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

// "2024-05-01T13:30:00.000Z" -> "2024-05-01T13:30" for <input type="datetime-local">
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
