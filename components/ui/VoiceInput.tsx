"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { B } from "@/lib/constants";
import { inp } from "@/lib/styles";

// ─────────────────────────────────────────────────────────────────────────────
// Voice-to-text using the browser-native Web Speech API.
// Browser-only: every access to SpeechRecognition is guarded so server
// rendering never touches `window`. Works in Chrome / Edge / Safari
// (Firefox has no implementation, so the mic button won't render there).
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

type OS = "mac" | "windows" | "other";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const platform = `${navigator.platform || ""} ${navigator.userAgent || ""}`;
  if (/Mac/i.test(platform)) return "mac";
  if (/Win/i.test(platform)) return "windows";
  return "other";
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Microphone access was blocked. Check the site's microphone permission in your browser, and (on a Mac) System Settings → Privacy & Security → Microphone.",
  "service-not-allowed":
    "Microphone access was blocked. Check the site's microphone permission in your browser, and (on a Mac) System Settings → Privacy & Security → Microphone.",
  "no-speech": "No speech detected.",
  "audio-capture": "No microphone found. Check that one is connected and not in use by another app.",
  network: "Speech recognition needs an internet connection.",
};

// Safari/WebKit ignores `continuous: true` and ends recognition after every
// pause in speech. We transparently restart it so listening still feels
// continuous there, matching Chrome's behavior.
const RESTARTABLE_ERRORS = new Set(["no-speech", "aborted"]);

function useVoice(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [checked, setChecked] = useState(false);
  const [os, setOS] = useState<OS>("other");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);
  const manualStopRef = useRef(false);
  const restartableRef = useRef(true);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
    setOS(detectOS());
    setChecked(true);
  }, []);

  const toggle = (currentValue: string) => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    if (listening) {
      manualStopRef.current = true;
      recRef.current?.stop();
      setListening(false);
      return;
    }

    setError(null);
    manualStopRef.current = false;
    restartableRef.current = true;

    let finalSoFar = currentValue ? currentValue.trimEnd() : "";

    const start = () => {
      const rec = new SR();
      rec.lang = "en-GB";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e: any) => {
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

      rec.onerror = (e: any) => {
        restartableRef.current = RESTARTABLE_ERRORS.has(e?.error);
        if (!restartableRef.current) {
          setError(ERROR_MESSAGES[e?.error] || `Voice input error: ${e?.error || "unknown"}`);
        }
      };
      rec.onend = () => {
        if (!manualStopRef.current && restartableRef.current) {
          start();
          return;
        }
        setListening(false);
        onTranscript(finalSoFar);
      };

      recRef.current = rec;
      rec.start();
    };

    start();
    setListening(true);
  };

  return { listening, supported, checked, os, error, toggle };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function Key({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 7px",
        margin: "0 2px",
        borderRadius: "5px",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.35)",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: "12px",
        fontWeight: 700,
        color: B.yellow,
      }}
    >
      {children}
    </span>
  );
}

const OS_DICTATION_CONTENT: Record<OS, ReactNode> = {
  windows: (
    <>
      This browser doesn&apos;t have a built-in mic button. Click into the field, then press{" "}
      <Key>Win</Key>+<Key>H</Key> to use Windows&apos; own voice typing.
    </>
  ),
  mac: (
    <>
      This browser doesn&apos;t have a built-in mic button. Click into the field, then press{" "}
      <Key>Fn</Key> twice to use your Mac&apos;s built-in dictation.
    </>
  ),
  other: <>Speak-to-type isn&apos;t available in this browser — try Chrome, Edge, or Safari instead.</>,
};

function DictationTooltip({ content, top }: { content: ReactNode; top: string }) {
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        left: 0,
        top,
        zIndex: 20,
        maxWidth: "300px",
        background: B.dark,
        color: B.white,
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: 1.6,
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 16px 36px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-6px",
          left: "20px",
          width: "12px",
          height: "12px",
          background: B.dark,
          transform: "rotate(45deg)",
        }}
      />
      {content}
    </div>
  );
}

function MicBtn({
  listening,
  onToggle,
  value,
  top = "50%",
  transform = "translateY(-50%)",
}: {
  listening: boolean;
  onToggle: (v: string) => void;
  value: string;
  top?: string;
  transform?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      title={listening ? "Stop recording" : "Speak to type"}
      style={{
        position: "absolute",
        right: "10px",
        top,
        transform,
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "none",
        background: listening ? B.coral : B.offWhite,
        color: listening ? B.white : B.muted,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        transition: "all 0.2s",
        flexShrink: 0,
        boxShadow: listening ? `0 0 0 4px ${B.coral}30` : "none",
        animation: listening ? "pulse 1.2s ease-in-out infinite" : "none",
      }}
    >
      {listening ? "⏹" : "🎙️"}
    </button>
  );
}

export function VoiceInput({
  value,
  onChange,
  placeholder,
  style: extraStyle = {},
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  type?: string;
}) {
  const { listening, supported, checked, os, error, toggle } = useVoice(onChange);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{ ...inp, paddingRight: supported ? "48px" : "14px", ...extraStyle }}
      />
      {supported && <MicBtn listening={listening} onToggle={toggle} value={value} />}
      {error && (
        <div style={{ fontSize: "11px", fontWeight: 600, color: B.coral, marginTop: "4px" }}>
          {error}
        </div>
      )}
      {checked && !supported && focused && (
        <DictationTooltip content={OS_DICTATION_CONTENT[os]} top="calc(100% + 10px)" />
      )}
    </div>
  );
}

export function VoiceArea({
  value,
  onChange,
  placeholder,
  height = "90px",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: string;
}) {
  const { listening, supported, checked, os, error, toggle } = useVoice(onChange);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          ...inp,
          height,
          resize: "vertical",
          paddingRight: supported ? "48px" : "14px",
          paddingBottom: "12px",
        }}
      />
      {supported && (
        <MicBtn listening={listening} onToggle={toggle} value={value} top="10px" transform="none" />
      )}
      {listening && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "14px",
            fontSize: "11px",
            fontWeight: 600,
            color: B.coral,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: B.coral,
              display: "inline-block",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
          Listening…
        </div>
      )}
      {error && (
        <div style={{ fontSize: "11px", fontWeight: 600, color: B.coral, marginTop: "4px" }}>
          {error}
        </div>
      )}
      {checked && !supported && focused && (
        <DictationTooltip content={OS_DICTATION_CONTENT[os]} top="calc(100% + 10px)" />
      )}
    </div>
  );
}
