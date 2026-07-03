import { useState, useEffect } from "react";

// ── Brand tokens (ICE Creates) ────────────────────────────────────────────────
const B = {
  dark:    "#1A1130",
  yellow:  "#F5C832",
  green:   "#9DD13A",
  teal:    "#2EC4B4",
  blue:    "#59C4F0",
  purple:  "#A88FD8",
  pink:    "#F040A0",
  coral:   "#EF5656",
  white:   "#FFFFFF",
  offWhite:"#F7F6FA",
  light:   "#EEECf5",
  mid:     "#C4BED8",
  muted:   "#7A7290",
  font:    "'Poppins', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const fmt = (iso, mode = "full") => {
  const d = new Date(iso);
  if (mode === "date") return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (mode === "time") return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const initials = n => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

// ── Decision types — mapped to ICE brand spectrum ─────────────────────────────
const DECISION_TYPES = [
  { id: "decision", label: "Decision",      sub: "A clear choice made",        color: B.green,  light: "#EDF8DC" },
  { id: "non",      label: "Non-Decision",  sub: "Deferred or avoided",        color: B.blue,   light: "#DDF3FC" },
  { id: "anti",     label: "Anti-Decision", sub: "Counter to expectation",     color: B.coral,  light: "#FDEAEA" },
];

const SETTINGS  = ["Ward / Clinical Area","Boardroom / Office","MDT Meeting","Corridor / Informal","Telephone","Teams","Email","Home","External / Offsite","Other"];
const PRESSURES = ["1 – Routine","2 – Moderate","3 – Significant","4 – High Stakes","5 – Crisis"];
const OUTCOMES  = [
  { id: "pending",      label: "Pending",      color: B.purple },
  { id: "successful",   label: "Successful",   color: B.green  },
  { id: "partial",      label: "Partial",      color: B.yellow },
  { id: "unsuccessful", label: "Unsuccessful", color: B.coral  },
];

// ── Storage ───────────────────────────────────────────────────────────────────
const ACCS_KEY    = "ice_cd_accounts_v1";
const dKey        = uid => `ice_cd_decisions_v1_${uid}`;

async function loadAccounts() {
  try { const r = await window.storage.get(ACCS_KEY, true); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveAccounts(d) {
  try { await window.storage.set(ACCS_KEY, JSON.stringify(d), true); } catch {}
}
async function loadDecisions(userId) {
  try { const r = await window.storage.get(dKey(userId)); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveDecisions(userId, d) {
  try { await window.storage.set(dKey(userId), JSON.stringify(d)); } catch {}
}

// ── Shared input style ────────────────────────────────────────────────────────
const inp = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: `1.5px solid ${B.light}`, background: B.white,
  fontSize: "14px", color: B.dark, fontFamily: B.font,
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};
const lbl = {
  fontFamily: B.font, fontSize: "11px", fontWeight: 600,
  color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase",
  marginBottom: "7px", display: "block",
};

// ── ICE Logo SVG ──────────────────────────────────────────────────────────────
function IceLogo({ dark = false }) {
  const c = dark ? B.dark : B.white;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontFamily: B.font, fontSize: "26px", fontWeight: 800, color: c, letterSpacing: "-0.04em", lineHeight: 1 }}>ice</span>
      <div style={{ width: "2px", height: "28px", background: B.yellow, borderRadius: "1px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        <span style={{ fontFamily: B.font, fontSize: "9px", fontWeight: 400, color: dark ? B.muted : "rgba(255,255,255,0.7)", letterSpacing: "0.02em", lineHeight: 1.3 }}>Decision Log</span>
        <span style={{ fontFamily: B.font, fontSize: "9px", fontWeight: 600, color: dark ? B.dark : B.white, letterSpacing: "0.02em", lineHeight: 1.3 }}>Clinical Leadership</span>
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${B.yellow}, ${B.coral})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: B.font, fontWeight: 700, fontSize: size * 0.35,
      color: B.dark, flexShrink: 0, userSelect: "none",
    }}>{initials(name)}</div>
  );
}

// ── Colour dot ────────────────────────────────────────────────────────────────
function Dot({ color, size = 8 }) {
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// ── Reset code storage ────────────────────────────────────────────────────────
const RESET_KEY = "ice_cd_resets_v1";
async function loadResets() {
  try { const r = await window.storage.get(RESET_KEY, true); return r ? JSON.parse(r.value) : {}; } catch { return {}; }
}
async function saveResets(d) {
  try { await window.storage.set(RESET_KEY, JSON.stringify(d), true); } catch {}
}
const genCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Shared auth card wrapper ───────────────────────────────────────────────────
function AuthCard({ children, title, subtitle, onBack }) {
  return (
    <div style={{ background: B.white, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "13px", fontFamily: B.font, fontWeight: 600, padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
          ← Back to sign in
        </button>
      )}
      {title && <div style={{ fontFamily: B.font, fontSize: "20px", fontWeight: 800, color: B.dark, marginBottom: "6px" }}>{title}</div>}
      {subtitle && <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted, marginBottom: "24px", lineHeight: 1.5 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Step 1: Enter email ───────────────────────────────────────────────────────
function ForgotStep1({ onCodeSent, onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setBusy(true); setError("");
    const accounts = await loadAccounts();
    const user = accounts.find(a => a.email === email.toLowerCase().trim());

    // Always show the same message whether account exists or not (security best practice)
    // But in prototype mode we need to pass the code through — so we store it
    const code = genCode();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    const resets = await loadResets();
    // Only store if account exists, but always proceed to next step
    if (user) {
      resets[email.toLowerCase().trim()] = { code, expires, userId: user.id };
      await saveResets(resets);
    }
    setBusy(false);
    const expiry = Date.now() + 15 * 60 * 1000;
    onCodeSent({
      email: email.toLowerCase().trim(),
      code:   user ? code : null,
      userId: user ? user.id : null,
      expiry,
    });
  };

  return (
    <AuthCard title="Reset your password" subtitle="Enter your account email and we'll send you a reset code." onBack={onBack}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={lbl}>Email Address</label>
          <input style={inp} type="email" placeholder="you@nhs.net" value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
        </div>
        {error && <div style={{ background: "#FDEAEA", border: `1px solid ${B.coral}50`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: B.coral, fontFamily: B.font }}>{error}</div>}
        <button onClick={submit} disabled={busy} style={{
          width: "100%", padding: "14px", borderRadius: "10px", border: "none",
          background: busy ? B.mid : B.dark, color: B.yellow,
          fontSize: "14px", fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: B.font,
        }}>{busy ? "Sending…" : "Send reset code"}</button>
      </div>
    </AuthCard>
  );
}

// ── Step 2: Enter code ────────────────────────────────────────────────────────
function ForgotStep2({ email, prototypeCode, userId, expiry, onVerified, onBack }) {
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [resent, setResent]     = useState(false);
  // Keep active code in local state so resend can refresh it without a storage round-trip
  const [activeCode, setActiveCode]     = useState(prototypeCode);
  const [activeExpiry, setActiveExpiry] = useState(expiry);

  const submit = () => {
    setError("");
    if (code.trim().length !== 6)     return setError("Enter the 6-digit code.");
    if (!activeCode)                  return setError("No reset code found — please go back and try again.");
    if (Date.now() > activeExpiry)    return setError("This code has expired — request a new one.");
    if (code.trim() !== activeCode)   return setError("That code isn't right. Check and try again.");
    onVerified(email, userId);
  };

  const resend = async () => {
    const newCode   = genCode();
    const newExpiry = Date.now() + 15 * 60 * 1000;
    setActiveCode(newCode);
    setActiveExpiry(newExpiry);
    setCode("");
    setError("");
    // Also persist so ForgotStep3 cleanup works
    const resets = await loadResets();
    resets[email] = { code: newCode, expires: newExpiry, userId };
    await saveResets(resets);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <AuthCard
      title="Enter your code"
      subtitle={`We've sent a 6-digit code to ${email}. It expires in 15 minutes.`}
      onBack={onBack}
    >
      {/* Prototype notice — shows the code since there's no real email */}
      {activeCode && (
        <div style={{ background: `${B.yellow}25`, border: `1.5px solid ${B.yellow}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
          <div style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 700, color: B.dark, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
            🔧 Prototype mode
          </div>
          <div style={{ fontFamily: B.font, fontSize: "12px", color: B.dark, marginBottom: "8px" }}>
            In production this code would arrive by email. For now, here it is:
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 800, color: B.dark, letterSpacing: "0.3em", textAlign: "center", padding: "8px 0" }}>
            {activeCode}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={lbl}>6-Digit Code</label>
          <input
            style={{ ...inp, fontSize: "24px", fontWeight: 700, letterSpacing: "0.3em", textAlign: "center", fontFamily: "monospace" }}
            placeholder="000000"
            value={code}
            maxLength={6}
            onChange={e => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus
          />
        </div>
        {error && <div style={{ background: "#FDEAEA", border: `1px solid ${B.coral}50`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: B.coral, fontFamily: B.font }}>{error}</div>}
        <button onClick={submit} style={{
          width: "100%", padding: "14px", borderRadius: "10px", border: "none",
          background: B.dark, color: B.yellow,
          fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: B.font,
        }}>Verify code</button>
        <p style={{ textAlign: "center", margin: 0, fontSize: "13px", color: B.muted, fontFamily: B.font }}>
          Didn't get it?{" "}
          <button onClick={resend} style={{ background: "none", border: "none", color: resent ? B.green : B.dark, cursor: "pointer", fontSize: "13px", fontFamily: B.font, fontWeight: 700 }}>
            {resent ? "Code resent ✓" : "Resend code"}
          </button>
        </p>
      </div>
    </AuthCard>
  );
}

// ── Step 3: New password ──────────────────────────────────────────────────────
function ForgotStep3({ email, userId, onDone }) {
  const [form, setForm]   = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const [show, setShow]   = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const submit = async () => {
    if (form.password.length < 6)       return setError("Password needs at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match — try again.");
    setBusy(true);
    const accounts = await loadAccounts();
    const updated = accounts.map(a => a.id === userId ? { ...a, password: form.password } : a);
    await saveAccounts(updated);
    // Clear the reset code
    const resets = await loadResets();
    delete resets[email];
    await saveResets(resets);
    setBusy(false);
    onDone();
  };

  // Password strength
  const strength = (() => {
    const p = form.password;
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
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              autoFocus
            />
            <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: B.muted, fontSize: "14px", fontFamily: B.font }}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {/* Strength meter */}
          {strength && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ height: "4px", borderRadius: "2px", background: B.light, overflow: "hidden" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "2px", transition: "width 0.3s, background 0.3s" }} />
              </div>
              <div style={{ fontFamily: B.font, fontSize: "11px", color: strength.color, fontWeight: 600, marginTop: "4px" }}>{strength.label}</div>
            </div>
          )}
        </div>

        <div>
          <label style={lbl}>Confirm New Password</label>
          <input
            style={{ ...inp, borderColor: form.confirm && form.confirm !== form.password ? B.coral : B.light }}
            type={show ? "text" : "password"}
            placeholder="Same again"
            value={form.confirm}
            onChange={e => set("confirm", e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
          {form.confirm && form.confirm === form.password && (
            <div style={{ fontFamily: B.font, fontSize: "11px", color: B.green, fontWeight: 600, marginTop: "4px" }}>✓ Passwords match</div>
          )}
        </div>

        {error && <div style={{ background: "#FDEAEA", border: `1px solid ${B.coral}50`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: B.coral, fontFamily: B.font }}>{error}</div>}

        <button onClick={submit} disabled={busy} style={{
          width: "100%", padding: "14px", borderRadius: "10px", border: "none",
          background: busy ? B.mid : B.dark, color: B.yellow,
          fontSize: "14px", fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: B.font,
        }}>{busy ? "Saving…" : "Set new password"}</button>
      </div>
    </AuthCard>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function ResetSuccess({ onSignIn }) {
  return (
    <AuthCard>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `${B.green}20`, border: `2px solid ${B.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
        <div style={{ fontFamily: B.font, fontSize: "20px", fontWeight: 800, color: B.dark, marginBottom: "8px" }}>Password updated</div>
        <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted, marginBottom: "28px", lineHeight: 1.6 }}>
          Your password has been reset successfully. Sign in with your new password.
        </div>
        <button onClick={onSignIn} style={{
          width: "100%", padding: "14px", borderRadius: "10px", border: "none",
          background: B.dark, color: B.yellow, fontSize: "14px", fontWeight: 700,
          cursor: "pointer", fontFamily: B.font,
        }}>Sign In</button>
      </div>
    </AuthCard>
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  // authView: "login" | "signup" | "forgot1" | "forgot2" | "forgot3" | "resetDone"
  const [authView, setAuthView] = useState("login");
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);
  // Reset flow state
  const [resetEmail, setResetEmail]   = useState("");
  const [resetCode, setResetCode]     = useState(null);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetExpiry, setResetExpiry] = useState(null);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
  const onKey = e => { if (e.key === "Enter") submitAuth(); };

  const submitAuth = async () => {
    setBusy(true); setError("");
    const accounts = await loadAccounts();
    if (authView === "signup") {
      if (!form.name.trim())                return fail("Tell us your name.");
      if (!form.email.includes("@"))        return fail("Enter a valid email address.");
      if (form.password.length < 6)         return fail("Password needs at least 6 characters.");
      if (form.password !== form.confirm)   return fail("Passwords don't match — try again.");
      if (accounts.find(a => a.email.toLowerCase() === form.email.toLowerCase().trim())) return fail("That email is already registered.");
      const u = { id: uid(), name: form.name.trim(), email: form.email.toLowerCase().trim(), password: form.password, created: now() };
      await saveAccounts([...accounts, u]);
      setBusy(false); onLogin(u);
    } else {
      const u = accounts.find(a => a.email.toLowerCase() === form.email.toLowerCase().trim() && a.password === form.password);
      if (!u) return fail("Email or password isn't right.");
      setBusy(false); onLogin(u);
    }
  };
  const fail = msg => { setError(msg); setBusy(false); };

  const Blobs = () => <>
    <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${B.purple}30, transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: `radial-gradient(circle, ${B.teal}25, transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${B.yellow}20, transparent 70%)`, pointerEvents: "none" }} />
  </>;

  return (
    <div style={{ minHeight: "100vh", background: B.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <Blobs />
      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        <div style={{ marginBottom: "36px" }}><IceLogo /></div>

        {/* ── Forgot: Step 1 — Email ── */}
        {authView === "forgot1" && (
          <ForgotStep1
            onCodeSent={({ email, code, userId, expiry }) => {
              setResetEmail(email);
              setResetCode(code);
              setResetUserId(userId);
              setResetExpiry(expiry);
              setAuthView("forgot2");
            }}
            onBack={() => setAuthView("login")}
          />
        )}

        {/* ── Forgot: Step 2 — Code ── */}
        {authView === "forgot2" && (
          <ForgotStep2
            email={resetEmail}
            prototypeCode={resetCode}
            userId={resetUserId}
            expiry={resetExpiry}
            onVerified={(email, userId) => { setResetUserId(userId); setAuthView("forgot3"); }}
            onBack={() => setAuthView("forgot1")}
          />
        )}

        {/* ── Forgot: Step 3 — New password ── */}
        {authView === "forgot3" && (
          <ForgotStep3
            email={resetEmail}
            userId={resetUserId}
            onDone={() => setAuthView("resetDone")}
          />
        )}

        {/* ── Reset success ── */}
        {authView === "resetDone" && (
          <ResetSuccess onSignIn={() => { setAuthView("login"); setForm({ name: "", email: "", password: "", confirm: "" }); }} />
        )}

        {/* ── Login / Signup ── */}
        {(authView === "login" || authView === "signup") && (
          <div style={{ background: B.white, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", background: B.offWhite, borderRadius: "10px", padding: "4px", marginBottom: "28px", gap: "4px" }}>
              {[["login","Sign In"],["signup","Create Account"]].map(([m, label]) => (
                <button key={m} onClick={() => { setAuthView(m); setError(""); }} style={{
                  flex: 1, padding: "9px 6px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: authView === m ? B.dark : "transparent",
                  color: authView === m ? B.white : B.muted,
                  fontFamily: B.font, fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {authView === "signup" && (
                <div>
                  <label style={lbl}>Your Full Name</label>
                  <input style={inp} placeholder="Dr. Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} onKeyDown={onKey} />
                </div>
              )}
              <div>
                <label style={lbl}>Email Address</label>
                <input style={inp} type="email" placeholder="you@nhs.net" value={form.email} onChange={e => set("email", e.target.value)} onKeyDown={onKey} />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <input style={inp} type="password" placeholder={authView === "signup" ? "6+ characters" : "Your password"} value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={onKey} />
              </div>
              {authView === "signup" && (
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input style={inp} type="password" placeholder="Same again" value={form.confirm} onChange={e => set("confirm", e.target.value)} onKeyDown={onKey} />
                </div>
              )}

              {error && (
                <div style={{ background: "#FDEAEA", border: `1px solid ${B.coral}50`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: B.coral, fontFamily: B.font }}>
                  {error}
                </div>
              )}

              {/* Forgot password link — login mode only */}
              {authView === "login" && (
                <div style={{ textAlign: "right", marginTop: "-8px" }}>
                  <button onClick={() => { setAuthView("forgot1"); setError(""); }} style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "12px", fontFamily: B.font, fontWeight: 600 }}>
                    Forgot your password?
                  </button>
                </div>
              )}

              <button onClick={submitAuth} disabled={busy} style={{
                width: "100%", padding: "14px", borderRadius: "10px", border: "none",
                background: busy ? B.mid : B.dark, color: B.yellow,
                fontSize: "14px", fontWeight: 700, cursor: busy ? "wait" : "pointer",
                fontFamily: B.font, letterSpacing: "0.02em", transition: "all 0.2s",
              }}>{busy ? "Just a moment…" : authView === "login" ? "Sign In" : "Create my account"}</button>
            </div>

            {authView === "login" && (
              <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: B.muted, fontFamily: B.font }}>
                New to the platform?{" "}
                <button onClick={() => { setAuthView("signup"); setError(""); }} style={{ background: "none", border: "none", color: B.dark, cursor: "pointer", fontSize: "13px", fontFamily: B.font, fontWeight: 700 }}>
                  Create an account
                </button>
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: B.font }}>
          Each clinical leader has their own private space.
        </p>
      </div>
    </div>
  );
}

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({ typeId, small }) {
  const t = DECISION_TYPES.find(x => x.id === typeId) || DECISION_TYPES[0];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: small ? "3px 9px" : "4px 12px",
      borderRadius: "999px", background: t.light,
      color: t.color, fontSize: small ? "11px" : "12px",
      fontWeight: 700, fontFamily: B.font, whiteSpace: "nowrap",
    }}>
      <Dot color={t.color} size={6} />
      {t.label}
    </span>
  );
}

function OutcomeBadge({ outcomeId }) {
  const o = OUTCOMES.find(x => x.id === outcomeId) || OUTCOMES[0];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "6px",
      border: `1.5px solid ${o.color}50`, color: o.color,
      fontSize: "11px", fontWeight: 600, fontFamily: B.font,
    }}>{o.label}</span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "16px", padding: "20px 22px", flex: 1, minWidth: "100px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: accent || B.yellow, borderRadius: "16px 16px 0 0" }} />
      <div style={{ fontFamily: B.font, fontSize: "34px", fontWeight: 800, color: B.dark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 600, color: B.muted, letterSpacing: "0.05em", marginTop: "6px", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ── Decision Card ─────────────────────────────────────────────────────────────
function DecisionCard({ d, onClick }) {
  const t = DECISION_TYPES.find(x => x.id === d.type) || DECISION_TYPES[0];
  return (
    <div onClick={onClick} style={{
      background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "16px",
      padding: "18px 22px", cursor: "pointer",
      transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
      display: "flex", flexDirection: "column", gap: "12px",
      borderLeft: `4px solid ${t.color}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px rgba(26,17,48,0.10)`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = t.color; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = B.light; e.currentTarget.style.borderLeftColor = t.color; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
            <TypeBadge typeId={d.type} small />
            <OutcomeBadge outcomeId={d.outcome} />
          </div>
          <div style={{ fontFamily: B.font, fontSize: "16px", fontWeight: 600, color: B.dark, lineHeight: 1.4 }}>{d.title}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 600, color: B.muted }}>{fmt(d.timestamp, "date")}</div>
          <div style={{ fontFamily: B.font, fontSize: "11px", color: B.mid, marginTop: "2px" }}>{fmt(d.timestamp, "time")}</div>
        </div>
      </div>
      {(d.setting || d.pressure) && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {d.setting  && <span style={{ fontFamily: B.font, fontSize: "12px", color: B.muted }}>📍 {d.setting}</span>}
          {d.pressure && <span style={{ fontFamily: B.font, fontSize: "12px", color: B.muted }}>⚡ {PRESSURES[parseInt(d.pressure) - 1]}</span>}
        </div>
      )}
      {d.context && <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted, lineHeight: 1.6, borderTop: `1px solid ${B.light}`, paddingTop: "10px" }}>{d.context.slice(0, 130)}{d.context.length > 130 ? "…" : ""}</div>}
    </div>
  );
}

// ── Voice-to-text hook ────────────────────────────────────────────────────────
function useVoice(onTranscript) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useState(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setSupported(true);
  }, []);

  const toggle = (currentValue) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (listening) {
      // Stop
      if (recRef[0]) recRef[0].stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;

    let finalSoFar = currentValue ? currentValue.trimEnd() : "";
    let interimEl = null;

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalSoFar = (finalSoFar ? finalSoFar + " " : "") + t.trim();
          interim = "";
        } else {
          interim = t;
        }
      }
      onTranscript(finalSoFar + (interim ? " " + interim : ""));
    };

    rec.onerror = () => { setListening(false); };
    rec.onend   = () => { setListening(false); onTranscript(finalSoFar); };

    recRef[0] = rec;
    rec.start();
    setListening(true);
  };

  return { listening, supported, toggle };
}

// ── Mic button ────────────────────────────────────────────────────────────────
function MicBtn({ listening, supported, onToggle, value }) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      title={listening ? "Stop recording" : "Speak to type"}
      style={{
        position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
        width: "32px", height: "32px", borderRadius: "50%", border: "none",
        background: listening ? B.coral : B.offWhite,
        color: listening ? B.white : B.muted,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px", transition: "all 0.2s", flexShrink: 0,
        boxShadow: listening ? `0 0 0 4px ${B.coral}30` : "none",
        animation: listening ? "pulse 1.2s ease-in-out infinite" : "none",
      }}
    >
      {listening ? "⏹" : "🎙️"}
    </button>
  );
}

// ── Voice-enabled single-line input ───────────────────────────────────────────
function VoiceInput({ value, onChange, placeholder, style: extraStyle = {}, ...rest }) {
  const { listening, supported, toggle } = useVoice(onChange);
  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inp, paddingRight: supported ? "48px" : "14px", ...extraStyle }}
        {...rest}
      />
      <MicBtn listening={listening} supported={supported} onToggle={toggle} value={value} />
    </div>
  );
}

// ── Voice-enabled textarea ────────────────────────────────────────────────────
function VoiceArea({ value, onChange, placeholder, height = "90px" }) {
  const { listening, supported, toggle } = useVoice(onChange);
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inp, height, resize: "vertical", paddingRight: supported ? "48px" : "14px", paddingBottom: "12px" }}
      />
      {supported && (
        <button
          type="button"
          onClick={() => toggle(value)}
          title={listening ? "Stop recording" : "Speak to type"}
          style={{
            position: "absolute", right: "10px", top: "10px",
            width: "32px", height: "32px", borderRadius: "50%", border: "none",
            background: listening ? B.coral : B.offWhite,
            color: listening ? B.white : B.muted,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", transition: "all 0.2s",
            boxShadow: listening ? `0 0 0 4px ${B.coral}30` : "none",
            animation: listening ? "pulse 1.2s ease-in-out infinite" : "none",
          }}
        >
          {listening ? "⏹" : "🎙️"}
        </button>
      )}
      {listening && (
        <div style={{
          position: "absolute", bottom: "10px", left: "14px",
          fontFamily: B.font, fontSize: "11px", fontWeight: 600,
          color: B.coral, display: "flex", alignItems: "center", gap: "6px",
          pointerEvents: "none",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: B.coral, display: "inline-block", animation: "pulse 1s ease-in-out infinite" }} />
          Listening…
        </div>
      )}
    </div>
  );
}

// ── Log / Edit Form ───────────────────────────────────────────────────────────
function LogForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    type: "decision", title: "", timestamp: new Date().toISOString().slice(0, 16),
    setting: "", pressure: "3", context: "", stakeholders: "", outcome: "pending", notes: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 0;

  const sectionHead = label => (
    <div style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 700, color: B.dark, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `2px solid ${B.yellow}`, paddingBottom: "6px", marginBottom: "16px" }}>{label}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Core detail */}
      <div>
        {sectionHead("The detail")}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={lbl}>Describe the decision *</label>
            <VoiceInput
              value={form.title}
              onChange={v => set("title", v)}
              placeholder="e.g. Agreed to escalate Patient A to ICU following MDT review"
              style={{ fontSize: "15px", fontWeight: 500 }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={lbl}>Date & Time</label>
              <input type="datetime-local" style={inp} value={form.timestamp} onChange={e => set("timestamp", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Setting</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.setting} onChange={e => set("setting", e.target.value)}>
                <option value="">Select…</option>
                {SETTINGS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Context & Reasoning</label>
            <VoiceArea
              value={form.context}
              onChange={v => set("context", v)}
              placeholder="What was happening? What informed this?"
              height="90px"
            />
          </div>
          <div>
            <label style={lbl}>Stakeholders Involved</label>
            <VoiceInput
              value={form.stakeholders}
              onChange={v => set("stakeholders", v)}
              placeholder="e.g. MDT, Executive Board, Patient, Family…"
            />
          </div>
        </div>
      </div>

      {/* Pressure */}
      <div>
        {sectionHead("Decision Pressure")}
        <div style={{ background: B.offWhite, borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontFamily: B.font, fontSize: "13px", color: B.muted }}>Current level:</span>
            <span style={{ fontFamily: B.font, fontSize: "13px", fontWeight: 700, color: B.dark }}>{PRESSURES[parseInt(form.pressure) - 1]}</span>
          </div>
          <input type="range" min={1} max={5} value={form.pressure} onChange={e => set("pressure", e.target.value)} style={{ width: "100%", accentColor: B.dark }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontFamily: B.font, fontSize: "10px", color: B.mid }}>Routine</span>
            <span style={{ fontFamily: B.font, fontSize: "10px", color: B.mid }}>Crisis</span>
          </div>
        </div>
      </div>

      {/* Decision type — just above Outcome */}
      <div>
        {sectionHead("Decision Type")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {DECISION_TYPES.map(t => (
            <button key={t.id} onClick={() => set("type", t.id)} style={{
              padding: "16px 10px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
              border: form.type === t.id ? `2px solid ${t.color}` : `1.5px solid ${B.light}`,
              background: form.type === t.id ? t.light : B.white, transition: "all 0.2s",
              boxShadow: form.type === t.id ? `0 4px 16px ${t.color}30` : "none",
            }}>
              <Dot color={t.color} size={10} />
              <div style={{ fontWeight: 700, fontSize: "12px", color: t.color, fontFamily: B.font, marginTop: "8px" }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: B.muted, marginTop: "3px", fontFamily: B.font }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Outcome */}
      <div>
        {sectionHead("Outcome")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {OUTCOMES.map(o => (
            <button key={o.id} onClick={() => set("outcome", o.id)} style={{
              padding: "12px 6px", borderRadius: "10px", cursor: "pointer", textAlign: "center",
              border: form.outcome === o.id ? `2px solid ${o.color}` : `1.5px solid ${B.light}`,
              background: form.outcome === o.id ? `${o.color}15` : B.white,
              color: form.outcome === o.id ? o.color : B.muted,
              fontSize: "12px", fontWeight: 700, fontFamily: B.font, transition: "all 0.2s",
            }}>{o.label}</button>
          ))}
        </div>
      </div>

      {/* Reflection */}
      <div>
        {sectionHead("Reflection")}
        <VoiceArea
          value={form.notes}
          onChange={v => set("notes", v)}
          placeholder="What would you do differently? What did you learn?"
          height="90px"
        />
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: `1.5px solid ${B.light}`, background: "transparent", color: B.muted, fontSize: "14px", cursor: "pointer", fontFamily: B.font, fontWeight: 600 }}>Cancel</button>
        <button onClick={() => valid && onSave({ ...form, timestamp: new Date(form.timestamp).toISOString() })} style={{
          flex: 2, padding: "14px", borderRadius: "12px", border: "none",
          background: valid ? B.dark : B.mid, color: valid ? B.yellow : B.white,
          fontSize: "14px", fontWeight: 700, cursor: valid ? "pointer" : "not-allowed",
          fontFamily: B.font, transition: "all 0.2s",
        }}>Save Entry</button>
      </div>
    </div>
  );
}

// ── Detail View ───────────────────────────────────────────────────────────────
function DetailView({ d, onBack, onEdit, onDelete }) {
  const t = DECISION_TYPES.find(x => x.id === d.type);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "13px", fontFamily: B.font, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: "6px" }}>← Back to log</button>

      <div style={{ background: t.light, borderRadius: "16px", padding: "22px 24px", borderLeft: `5px solid ${t.color}` }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          <TypeBadge typeId={d.type} />
          <OutcomeBadge outcomeId={d.outcome} />
        </div>
        <h2 style={{ fontFamily: B.font, fontSize: "22px", fontWeight: 700, color: B.dark, margin: 0, lineHeight: 1.3 }}>{d.title}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[["Date & Time", fmt(d.timestamp)], ["Setting", d.setting || "—"], ["Pressure", d.pressure ? PRESSURES[parseInt(d.pressure) - 1] : "—"], ["Stakeholders", d.stakeholders || "—"]].map(([label, value]) => (
          <div key={label} style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ fontFamily: B.font, fontSize: "10px", fontWeight: 700, color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>{label}</div>
            <div style={{ fontFamily: B.font, fontSize: "14px", fontWeight: 500, color: B.dark }}>{value}</div>
          </div>
        ))}
      </div>

      {d.context && (
        <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "18px" }}>
          <div style={{ fontFamily: B.font, fontSize: "10px", fontWeight: 700, color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Context & Reasoning</div>
          <p style={{ margin: 0, fontFamily: B.font, fontSize: "14px", color: B.dark, lineHeight: 1.7 }}>{d.context}</p>
        </div>
      )}

      {d.notes && (
        <div style={{ background: `${B.yellow}18`, border: `1.5px solid ${B.yellow}60`, borderRadius: "12px", padding: "18px" }}>
          <div style={{ fontFamily: B.font, fontSize: "10px", fontWeight: 700, color: B.dark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Reflection Notes</div>
          <p style={{ margin: 0, fontFamily: B.font, fontSize: "14px", color: B.dark, lineHeight: 1.7 }}>{d.notes}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: `1px solid ${B.light}` }}>
        <button onClick={onEdit} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${B.dark}`, background: "transparent", color: B.dark, fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: B.font }}>Edit Entry</button>
        <button onClick={onDelete} style={{ padding: "12px 20px", borderRadius: "12px", border: `1.5px solid ${B.coral}50`, background: "transparent", color: B.coral, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: B.font }}>Delete</button>
      </div>
    </div>
  );
}

// ── Profile Sheet ─────────────────────────────────────────────────────────────
function ProfileSheet({ user, decisions, onClose, onSignOut, onUpdateName }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const thisMonth = decisions.filter(d => {
    const m = new Date(); const dm = new Date(d.timestamp);
    return dm.getMonth() === m.getMonth() && dm.getFullYear() === m.getFullYear();
  });
  const rate = decisions.length ? Math.round((decisions.filter(d => d.outcome === "successful").length / decisions.length) * 100) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,17,48,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: B.white, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: "700px", padding: "12px 28px 48px", boxShadow: "0 -16px 60px rgba(26,17,48,0.25)" }}>
        <div style={{ width: "44px", height: "4px", borderRadius: "2px", background: B.light, margin: "0 auto 24px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <Avatar name={user.name} size={56} />
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} style={{ ...inp, padding: "7px 12px", fontSize: "15px", flex: 1, width: "auto" }} autoFocus
                  onKeyDown={e => { if (e.key === "Enter" && newName.trim()) { onUpdateName(newName.trim()); setEditing(false); } }} />
                <button onClick={() => { if (newName.trim()) { onUpdateName(newName.trim()); setEditing(false); } }} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: B.dark, color: B.yellow, cursor: "pointer", fontSize: "12px", fontFamily: B.font, fontWeight: 600 }}>Save</button>
                <button onClick={() => { setNewName(user.name); setEditing(false); }} style={{ padding: "7px 10px", borderRadius: "8px", border: `1px solid ${B.light}`, background: "transparent", color: B.muted, cursor: "pointer", fontSize: "12px" }}>✕</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontFamily: B.font, fontSize: "20px", fontWeight: 700, color: B.dark }}>{user.name}</div>
                <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: B.teal, cursor: "pointer", fontSize: "12px", fontFamily: B.font, fontWeight: 600 }}>Edit</button>
              </div>
            )}
            <div style={{ fontFamily: B.font, fontSize: "12px", color: B.muted, marginTop: "2px" }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {[["Total Entries", decisions.length, B.green], ["This Month", thisMonth.length, B.blue], ["Success Rate", `${rate}%`, B.yellow]].map(([l, v, c]) => (
            <div key={l} style={{ background: B.offWhite, border: `1.5px solid ${B.light}`, borderRadius: "12px", padding: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: c }} />
              <div style={{ fontFamily: B.font, fontSize: "26px", fontWeight: 800, color: B.dark }}>{v}</div>
              <div style={{ fontFamily: B.font, fontSize: "10px", fontWeight: 600, color: B.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: B.font, fontSize: "12px", color: B.mid, marginBottom: "20px" }}>
          Member since {fmt(user.created, "date")}
        </div>

        <button onClick={onSignOut} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `2px solid ${B.coral}40`, background: "transparent", color: B.coral, fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: B.font }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Spectrum bar decoration ───────────────────────────────────────────────────
function SpectrumBar() {
  const colours = [B.yellow, B.green, B.teal, B.blue, B.purple, B.pink, B.coral];
  return (
    <div style={{ display: "flex", height: "3px", borderRadius: "0 0 0 0", overflow: "hidden" }}>
      {colours.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]             = useState(null);
  const [decisions, setDecisions]   = useState([]);
  const [view, setView]             = useState("dashboard");
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ice_cd_session");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setUser(u);
        loadDecisions(u.id).then(d => { setDecisions(d); setLoading(false); });
        return;
      } catch {}
    }
    setLoading(false);
  }, []);

  const handleLogin = async u => {
    sessionStorage.setItem("ice_cd_session", JSON.stringify(u));
    setUser(u);
    const d = await loadDecisions(u.id);
    setDecisions(d);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("ice_cd_session");
    setUser(null); setDecisions([]); setView("dashboard");
    setSelected(null); setShowProfile(false);
  };

  const handleUpdateName = async newName => {
    const accounts = await loadAccounts();
    await saveAccounts(accounts.map(a => a.id === user.id ? { ...a, name: newName } : a));
    const updated = { ...user, name: newName };
    sessionStorage.setItem("ice_cd_session", JSON.stringify(updated));
    setUser(updated);
  };

  const persist = next => { setDecisions(next); saveDecisions(user.id, next); };

  const handleSave = form => {
    if (selected && view === "edit") {
      persist(decisions.map(d => d.id === selected.id ? { ...selected, ...form } : d));
    } else {
      persist([{ id: uid(), created: now(), ...form }, ...decisions]);
    }
    setView("dashboard"); setSelected(null);
  };

  const handleDelete = () => {
    persist(decisions.filter(d => d.id !== selected.id));
    setView("dashboard"); setSelected(null);
  };

  const thisMonth = decisions.filter(d => {
    const m = new Date(); const dm = new Date(d.timestamp);
    return dm.getMonth() === m.getMonth() && dm.getFullYear() === m.getFullYear();
  });
  const rate = decisions.length ? Math.round((decisions.filter(d => d.outcome === "successful").length / decisions.length) * 100) : 0;
  const visible = decisions.filter(d => {
    if (filter !== "all" && d.type !== filter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !(d.context || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
  const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`;

  if (loading) return (
    <>
      <style>{`${FONTS} * { box-sizing: border-box; } body { margin: 0; background: ${B.dark}; }`}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: B.font, color: B.muted, fontSize: "13px" }}>Loading…</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{`${FONTS} * { box-sizing: border-box; } body { margin: 0; }`}</style>
      <AuthScreen onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        body { background: ${B.offWhite}; margin: 0; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: ${B.light}; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${B.dark}; cursor: pointer; }
        select { appearance: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${B.light}; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { border-color: ${B.dark} !important; }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${B.coral}50; }
          50% { opacity: 0.85; box-shadow: 0 0 0 6px ${B.coral}00; }
        }
      `}</style>

      {showProfile && (
        <ProfileSheet user={user} decisions={decisions} onClose={() => setShowProfile(false)} onSignOut={handleSignOut} onUpdateName={handleUpdateName} />
      )}

      <div style={{ background: B.offWhite, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ background: B.dark }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <IceLogo />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {view === "dashboard" && (
                <button onClick={() => { setSelected(null); setView("log"); }} style={{
                  padding: "9px 20px", borderRadius: "10px", border: "none",
                  background: B.yellow, color: B.dark, fontSize: "13px",
                  fontWeight: 700, cursor: "pointer", fontFamily: B.font,
                }}>+ New Entry</button>
              )}
              <button onClick={() => setShowProfile(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Avatar name={user.name} size={38} />
              </button>
            </div>
          </div>
          <SpectrumBar />
        </div>

        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 20px 60px" }}>

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingTop: "32px" }}>

              <div>
                <div style={{ fontFamily: B.font, fontSize: "24px", fontWeight: 800, color: B.dark }}>
                  Good {greeting}, <span style={{ color: B.teal }}>{user.name.split(" ")[0]}.</span>
                </div>
                <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted, marginTop: "4px" }}>{fmt(now(), "date")} · Your personal decision log</div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <StatCard label="This Month" value={thisMonth.length} accent={B.teal} />
                <StatCard label="Total Entries" value={decisions.length} accent={B.purple} />
                <StatCard label="Success Rate" value={`${rate}%`} accent={decisions.length === 0 ? B.yellow : rate > 60 ? B.green : rate > 40 ? B.yellow : B.coral} />
              </div>

              {/* Type breakdown */}
              {decisions.length > 0 && (
                <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: "16px", padding: "20px 22px" }}>
                  <div style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 700, color: B.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>Breakdown by type</div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {DECISION_TYPES.map(t => {
                      const count = decisions.filter(d => d.type === t.id).length;
                      const pct = decisions.length ? Math.round((count / decisions.length) * 100) : 0;
                      return (
                        <div key={t.id} style={{ flex: 1 }}>
                          <div style={{ height: "8px", borderRadius: "4px", background: B.light, overflow: "hidden", marginBottom: "8px" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: t.color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <Dot color={t.color} />
                            <span style={{ fontFamily: B.font, fontSize: "11px", fontWeight: 600, color: B.dark }}>{count}</span>
                            <span style={{ fontFamily: B.font, fontSize: "11px", color: B.muted }}>{t.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter + Search */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {[{ id: "all", label: "All" }, ...DECISION_TYPES.map(t => ({ id: t.id, label: t.label, color: t.color }))].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{
                    padding: "7px 16px", borderRadius: "999px", cursor: "pointer", fontSize: "12px",
                    border: filter === f.id ? "none" : `1.5px solid ${B.light}`,
                    background: filter === f.id ? B.dark : B.white,
                    color: filter === f.id ? B.yellow : B.muted,
                    fontFamily: B.font, fontWeight: 600, transition: "all 0.2s",
                  }}>{f.label}</button>
                ))}
                <input placeholder="Search entries…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: "10px", border: `1.5px solid ${B.light}`, background: B.white, fontSize: "13px", color: B.dark, fontFamily: B.font, outline: "none" }} />
              </div>

              {/* Entry list */}
              {visible.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                  <div style={{ fontFamily: B.font, fontSize: "18px", fontWeight: 700, color: B.dark, marginBottom: "8px" }}>No entries yet</div>
                  <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted }}>Start logging your decisions, non-decisions and anti-decisions.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {visible.map(d => <DecisionCard key={d.id} d={d} onClick={() => { setSelected(d); setView("detail"); }} />)}
                </div>
              )}
            </div>
          )}

          {/* LOG / EDIT */}
          {(view === "log" || view === "edit") && (
            <div style={{ paddingTop: "32px" }}>
              <div style={{ marginBottom: "24px" }}>
                <button onClick={() => { setView(selected ? "detail" : "dashboard"); }} style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: "13px", fontFamily: B.font, fontWeight: 600, padding: 0, marginBottom: "12px", display: "block" }}>← Back</button>
                <div style={{ fontFamily: B.font, fontSize: "22px", fontWeight: 800, color: B.dark }}>{view === "edit" ? "Edit this entry" : "Log a new entry"}</div>
                <div style={{ fontFamily: B.font, fontSize: "13px", color: B.muted, marginTop: "4px" }}>Be direct, honest, and specific.</div>
              </div>
              <LogForm
                initial={view === "edit" ? { ...selected, timestamp: new Date(selected.timestamp).toISOString().slice(0, 16) } : null}
                onSave={handleSave}
                onCancel={() => { setView(selected ? "detail" : "dashboard"); }}
              />
            </div>
          )}

          {/* DETAIL */}
          {view === "detail" && selected && (
            <div style={{ paddingTop: "32px" }}>
              <DetailView d={selected} onBack={() => { setSelected(null); setView("dashboard"); }} onEdit={() => setView("edit")} onDelete={handleDelete} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: B.dark, padding: "16px 20px", textAlign: "center" }}>
          <SpectrumBar />
          <div style={{ paddingTop: "14px", fontFamily: B.font, fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            ice creates · leading behaviour change · icecreates.com
          </div>
        </div>
      </div>
    </>
  );
}
