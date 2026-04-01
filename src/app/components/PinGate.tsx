"use client";

import { useState } from "react";

interface PinGateProps {
  onUnlock: () => void;
}

export default function PinGate({ onUnlock }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // PIN is verified server-side, but we do a quick check here too
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-xs">
        {/* Gojo Avatar */}
        <div className="mx-auto w-24 h-24 rounded-full overflow-hidden gojo-glow">
          <img
            src="/gojo-avatar.svg"
            alt="Gojo-sensei"
            width={96}
            height={96}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gojo-blue">Gojo-sensei</h1>
          <p className="text-white/50 text-sm mt-1">Enter your secret code to chat</p>
        </div>

        {/* PIN Input */}
        <div className={`transition-transform ${shake ? "animate-[shake_0.5s]" : ""}`}>
          <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > i
                    ? "border-gojo-blue bg-gojo-blue/20 text-white"
                    : "border-white/20 bg-white/5 text-white/30"
                }`}
              >
                {pin.length > i ? "•" : ""}
              </div>
            ))}
          </div>

          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").substring(0, 4);
              setPin(val);
              setError(false);
            }}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0"
            autoFocus
          />
        </div>

        {/* Visible number pad for mobile */}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((num, i) => (
            <button
              key={i}
              onClick={() => {
                if (num === null) return;
                if (num === "⌫") {
                  setPin((p) => p.slice(0, -1));
                } else if (pin.length < 4) {
                  setPin((p) => p + num);
                }
                setError(false);
              }}
              className={`h-12 rounded-xl text-lg font-semibold transition-all ${
                num === null
                  ? "invisible"
                  : "bg-white/10 hover:bg-white/20 active:bg-gojo-blue/30 text-white"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Enter button */}
        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="w-full bg-gradient-to-r from-gojo-blue to-gojo-purple text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-30"
        >
          Enter Domain 😎
        </button>

        {error && (
          <p className="text-red-400 text-sm">Wrong code! Try again.</p>
        )}

        <p className="text-white/20 text-xs">
          Ask your parents for the code
        </p>
      </div>
    </div>
  );
}
