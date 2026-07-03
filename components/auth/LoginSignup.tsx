"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { B } from "@/lib/constants";
import { inp, lbl, errorBox } from "@/lib/styles";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginSignup({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setNotice("");
    // keep the URL honest so refreshes land on the right screen
    window.history.replaceState(null, "", m === "login" ? "/login" : "/signup");
  };

  const submit = async () => {
    setError("");
    setNotice("");
    const supabase = createClient();
    const email = form.email.toLowerCase().trim();

    if (mode === "signup") {
      if (!form.name.trim()) return setError("Tell us your name.");
      if (!email.includes("@")) return setError("Enter a valid email address.");
      if (form.password.length < 6) return setError("Password needs at least 6 characters.");
      if (form.password !== form.confirm) return setError("Passwords don't match — try again.");

      setBusy(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: { full_name: form.name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setBusy(false);

      if (error) return setError(error.message);
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation is enabled — user must verify first.
        setNotice("Account created. Check your email to confirm your address, then sign in.");
        setMode("login");
      }
      return;
    }

    // Login
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: form.password });
    setBusy(false);
    if (error) return setError("Email or password isn't right.");
    router.push("/dashboard");
    router.refresh();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div style={{ background: B.white, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
      {/* Tab toggle */}
      <div style={{ display: "flex", background: B.offWhite, borderRadius: "10px", padding: "4px", marginBottom: "28px", gap: "4px" }}>
        {([["login", "Sign In"], ["signup", "Create Account"]] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: mode === m ? B.dark : "transparent",
              color: mode === m ? B.white : B.muted,
              fontSize: "12px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {mode === "signup" && (
          <div>
            <label style={lbl}>Your Full Name</label>
            <input style={inp} placeholder="Dr. Jane Smith" value={form.name} onChange={(e) => set("name", e.target.value)} onKeyDown={onKey} />
          </div>
        )}
        <div>
          <label style={lbl}>Email Address</label>
          <input style={inp} type="email" placeholder="you@nhs.net" value={form.email} onChange={(e) => set("email", e.target.value)} onKeyDown={onKey} />
        </div>
        <div>
          <label style={lbl}>Password</label>
          <input
            style={inp}
            type="password"
            placeholder={mode === "signup" ? "6+ characters" : "Your password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            onKeyDown={onKey}
          />
        </div>
        {mode === "signup" && (
          <div>
            <label style={lbl}>Confirm Password</label>
            <input style={inp} type="password" placeholder="Same again" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} onKeyDown={onKey} />
          </div>
        )}

        {notice && (
          <div style={{ background: `${B.green}15`, border: `1px solid ${B.green}60`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#3f7d12" }}>
            {notice}
          </div>
        )}
        {error && <div style={errorBox}>{error}</div>}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: "-8px" }}>
            <button
              onClick={() => router.push("/reset-password")}
              style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
            >
              Forgot your password?
            </button>
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            background: busy ? B.mid : B.dark,
            color: B.yellow,
            fontSize: "14px",
            fontWeight: 700,
            cursor: busy ? "wait" : "pointer",
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}
        >
          {busy ? "Just a moment…" : mode === "login" ? "Sign In" : "Create my account"}
        </button>
      </div>

      {mode === "login" && (
        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: B.muted }}>
          New to the platform?{" "}
          <button onClick={() => switchMode("signup")} style={{ background: "none", border: "none", color: B.dark, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
            Create an account
          </button>
        </p>
      )}
    </div>
  );
}
