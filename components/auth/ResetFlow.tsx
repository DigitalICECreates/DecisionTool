"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { B } from "@/lib/constants";
import { inp, lbl, errorBox, darkBtn } from "@/lib/styles";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "./AuthShell";

type Step = "email" | "code" | "password" | "done";

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}
    >
      ← {label}
    </button>
  );
}

export function ResetFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  const supabase = createClient();

  // ── Step 1: email ──────────────────────────────────────────────────────────
  const sendCode = async () => {
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setBusy(true);
    setError("");
    // Don't reveal whether the account exists — always advance.
    await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
    setBusy(false);
    setStep("code");
  };

  const resend = async () => {
    await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
    setResent(true);
    setCode("");
    setTimeout(() => setResent(false), 4000);
  };

  // ── Step 2: code ───────────────────────────────────────────────────────────
  const verify = async () => {
    setError("");
    if (code.trim().length !== 6) return setError("Enter the 6-digit code.");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: code.trim(),
      type: "recovery",
    });
    setBusy(false);
    if (error) return setError("That code isn't right or has expired. Try again.");
    setStep("password");
  };

  // ── Step 3: new password ───────────────────────────────────────────────────
  const strength = (() => {
    const p = pw.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: B.coral, width: "25%" };
    if (score <= 2) return { label: "Fair", color: B.yellow, width: "50%" };
    if (score <= 3) return { label: "Good", color: B.teal, width: "75%" };
    return { label: "Strong", color: B.green, width: "100%" };
  })();

  const savePassword = async () => {
    setError("");
    if (pw.password.length < 6) return setError("Password needs at least 6 characters.");
    if (pw.password !== pw.confirm) return setError("Passwords don't match — try again.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.password });
    setBusy(false);
    if (error) return setError(error.message);
    setStep("done");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <AuthCard title="Reset your password" subtitle="Enter your account email and we'll send you a reset code.">
        <BackLink label="Back to sign in" onClick={() => router.push("/login")} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" placeholder="you@nhs.net" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && sendCode()} autoFocus />
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <button onClick={sendCode} disabled={busy} style={{ ...darkBtn, background: busy ? B.mid : B.dark, cursor: busy ? "wait" : "pointer" }}>
            {busy ? "Sending…" : "Send reset code"}
          </button>
        </div>
      </AuthCard>
    );
  }

  if (step === "code") {
    return (
      <AuthCard title="Enter your code" subtitle={`We've sent a 6-digit code to ${email}. It expires in 1 hour.`}>
        <BackLink label="Use a different email" onClick={() => setStep("email")} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={lbl}>6-Digit Code</label>
            <input
              style={{ ...inp, fontSize: "24px", fontWeight: 700, letterSpacing: "0.3em", textAlign: "center", fontFamily: "monospace" }}
              placeholder="000000"
              value={code}
              maxLength={6}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              autoFocus
            />
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <button onClick={verify} disabled={busy} style={{ ...darkBtn, background: busy ? B.mid : B.dark }}>
            {busy ? "Verifying…" : "Verify code"}
          </button>
          <p style={{ textAlign: "center", margin: 0, fontSize: "13px", color: B.muted }}>
            Didn't get it?{" "}
            <button onClick={resend} style={{ background: "none", border: "none", color: resent ? B.green : B.dark, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
              {resent ? "Code resent ✓" : "Resend code"}
            </button>
          </p>
        </div>
      </AuthCard>
    );
  }

  if (step === "password") {
    return (
      <AuthCard title="Create new password" subtitle="Choose a strong password for your account.">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={lbl}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inp, paddingRight: "48px" }}
                type={show ? "text" : "password"}
                placeholder="6+ characters"
                value={pw.password}
                onChange={(e) => { setPw((p) => ({ ...p, password: e.target.value })); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && savePassword()}
                autoFocus
              />
              <button onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: B.muted, fontSize: "14px" }}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {strength && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ height: "4px", borderRadius: "2px", background: B.light, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "2px", transition: "width 0.3s, background 0.3s" }} />
                </div>
                <div style={{ fontSize: "11px", color: strength.color, fontWeight: 600, marginTop: "4px" }}>{strength.label}</div>
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>Confirm New Password</label>
            <input
              style={{ ...inp, borderColor: pw.confirm && pw.confirm !== pw.password ? B.coral : B.light }}
              type={show ? "text" : "password"}
              placeholder="Same again"
              value={pw.confirm}
              onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && savePassword()}
            />
            {pw.confirm && pw.confirm === pw.password && (
              <div style={{ fontSize: "11px", color: B.green, fontWeight: 600, marginTop: "4px" }}>✓ Passwords match</div>
            )}
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <button onClick={savePassword} disabled={busy} style={{ ...darkBtn, background: busy ? B.mid : B.dark }}>
            {busy ? "Saving…" : "Set new password"}
          </button>
        </div>
      </AuthCard>
    );
  }

  // step === "done"
  return (
    <AuthCard>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `${B.green}20`, border: `2px solid ${B.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: B.dark, marginBottom: "8px" }}>Password updated</div>
        <div style={{ fontSize: "13px", color: B.muted, marginBottom: "28px", lineHeight: 1.6 }}>
          Your password has been reset successfully. You're all set.
        </div>
        <button onClick={() => { router.push("/dashboard"); router.refresh(); }} style={darkBtn}>
          Continue to dashboard
        </button>
      </div>
    </AuthCard>
  );
}
