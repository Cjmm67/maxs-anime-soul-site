"use client";

import { useState } from "react";

interface PinGateProps {
  onUnlock: () => void;
}

export default function PinGate({ onUnlock }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onUnlock();
      } else {
        setError(true);
        setShake(true);
        setPin("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError(true);
      setPin("");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase", letterSpacing: 2,
        }}>
          Enter your secret code to chat
        </p>
      </div>

      {/* PIN dots */}
      <div style={{
        display: "flex", gap: 10, justifyContent: "center", marginBottom: 16,
        animation: shake ? "loginShake 0.4s ease" : "none",
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 40, height: 48, borderRadius: 10,
            border: `2px solid ${pin.length > i ? "#0066ff" : "rgba(255,255,255,0.2)"}`,
            background: pin.length > i ? "rgba(0,102,255,0.2)" : "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: "bold", color: "#fff", transition: "all 0.2s",
          }}>
            {pin.length > i ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Number pad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, maxWidth: 180, margin: "0 auto 12px" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((num, i) => (
          <button
            key={i}
            onClick={() => {
              if (num === null) return;
              if (num === "⌫") { setPin((p) => p.slice(0, -1)); }
              else if (pin.length < 4) { setPin((p) => p + num); }
              setError(false);
            }}
            style={{
              height: 40, borderRadius: 10, fontSize: 16, fontWeight: 600,
              background: num === null ? "transparent" : "rgba(255,255,255,0.1)",
              border: "none", color: "#fff", cursor: num === null ? "default" : "pointer",
              visibility: num === null ? "hidden" : "visible",
              transition: "all 0.2s",
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Enter button */}
      <button
        onClick={handleSubmit}
        disabled={pin.length !== 4}
        style={{
          width: "100%", maxWidth: 180,
          background: pin.length === 4 ? "linear-gradient(135deg, #0066ff, #7c4dff)" : "rgba(255,255,255,0.05)",
          color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
          fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: pin.length === 4 ? "pointer" : "default",
          opacity: pin.length === 4 ? 1 : 0.3, transition: "all 0.3s",
        }}
      >
        Enter Domain 😎
      </button>

      {error && (
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#f87171", marginTop: 10 }}>
          Wrong code! Try again.
        </p>
      )}

      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>
        Ask your parents for the code
      </p>

      <style>{`
        @keyframes loginShake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-6px)}30%,60%,90%{transform:translateX(6px)}}
      `}</style>
    </div>
  );
}
