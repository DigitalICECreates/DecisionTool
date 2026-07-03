"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { B } from "@/lib/constants";
import { inp } from "@/lib/styles";

// ─────────────────────────────────────────────────────────────────────────────
// Voice-to-text using the browser-native Web Speech API.
// Browser-only: every access to SpeechRecognition is guarded so server
// rendering never touches `window`. Works in Chrome / Edge.
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function useVoice(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const toggle = (currentValue: string) => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;

    let finalSoFar = currentValue ? currentValue.trimEnd() : "";

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

    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      onTranscript(finalSoFar);
    };

    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return { listening, supported, toggle };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  const { listening, supported, toggle } = useVoice(onChange);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inp, paddingRight: supported ? "48px" : "14px", ...extraStyle }}
      />
      {supported && <MicBtn listening={listening} onToggle={toggle} value={value} />}
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
  const { listening, supported, toggle } = useVoice(onChange);
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    </div>
  );
}
