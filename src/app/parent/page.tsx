"use client";

import { useState } from "react";

interface DateSummary {
  date: string;
  messageCount: number;
  welfareAlerts: number;
  filterBlocks: number;
}

interface LogEntry {
  type: string;
  role?: string;
  content?: string;
  level?: number;
  reason?: string;
  userMessage?: string;
  responseGiven?: string;
  direction?: string;
  _logged?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export default function ParentDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [dates, setDates] = useState<DateSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [controlLoading, setControlLoading] = useState(false);

  const headers = { "x-parent-password": password };

  const fetchDates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/logs", { headers });
      if (res.status === 401) { setError("Wrong password"); setAuthenticated(false); return; }
      const data = await res.json();
      setDates(data.dates || []);
      setAuthenticated(true);
      setError("");
      
      // Fetch lock status
      const controlRes = await fetch("/api/parent/control", { headers });
      if (controlRes.ok) {
        const controlData = await controlRes.json();
        setLocked(controlData.locked);
      }
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  };

  const fetchLogs = async (date: string) => {
    setLoading(true);
    setSelectedDate(date);
    try {
      const res = await fetch(`/api/parent/logs?date=${date}`, { headers });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch { setError("Failed to load logs"); }
    finally { setLoading(false); }
  };

  const toggleLock = async () => {
    setControlLoading(true);
    try {
      const res = await fetch("/api/parent/control", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action: locked ? "unlock" : "lock" }),
      });
      if (res.ok) {
        setLocked(!locked);
      }
    } catch { setError("Failed to toggle lock"); }
    finally { setControlLoading(false); }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "linear-gradient(135deg, #0a0514, #1a1060)",
      }}>
        <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 24, color: "#0066ff", marginBottom: 8 }}>🔒 Parent Dashboard</h1>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            Enter the parent password to view chat logs
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchDates()}
            placeholder="Parent password"
            style={{
              width: "100%", background: "rgba(255,255,255,0.1)", color: "#e8e8e8",
              border: "none", borderRadius: 12, padding: "14px 16px",
              fontFamily: "'Outfit',sans-serif", fontSize: 14, outline: "none", marginBottom: 12,
            }}
          />
          <button
            onClick={fetchDates}
            disabled={!password || loading}
            style={{
              width: "100%", background: "linear-gradient(135deg, #0066ff, #7c4dff)",
              color: "#fff", border: "none", borderRadius: 12, padding: "14px 24px",
              fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
              opacity: !password || loading ? 0.3 : 1,
            }}
          >
            {loading ? "Loading..." : "View Logs"}
          </button>
          {error && <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#f87171", marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  // Date list view
  if (!selectedDate) {
    return (
      <div style={{
        minHeight: "100vh", padding: 24, maxWidth: 640, margin: "0 auto",
        background: "linear-gradient(135deg, #0a0514, #1a1060)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 22, color: "#0066ff" }}>🔒 Parent Dashboard</h1>
          <button
            onClick={() => { setAuthenticated(false); setPassword(""); }}
            style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}
          >
            Log out
          </button>
        </div>

        {/* Chat Control Panel */}
        <div style={{
          background: locked ? "rgba(239,68,68,0.08)" : "rgba(0,255,136,0.05)",
          border: `1px solid ${locked ? "rgba(239,68,68,0.3)" : "rgba(0,255,136,0.2)"}`,
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{locked ? "🔒" : "✅"}</span>
                <h3 style={{
                  fontFamily: "'Zen Dots',cursive", fontSize: 14, margin: 0,
                  color: locked ? "#f87171" : "#4ade80", textTransform: "uppercase", letterSpacing: 2,
                }}>
                  Chat is {locked ? "LOCKED" : "ACTIVE"}
                </h3>
              </div>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {locked
                  ? "Max cannot use the Gojo chatbot. Click unlock when ready."
                  : "Max can chat with Gojo. Lock to temporarily disable."}
              </p>
            </div>
            <button
              onClick={toggleLock}
              disabled={controlLoading}
              style={{
                background: locked
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "12px 24px", fontFamily: "'Outfit',sans-serif", fontWeight: 600,
                fontSize: 13, cursor: controlLoading ? "wait" : "pointer",
                opacity: controlLoading ? 0.5 : 1, transition: "all 0.3s",
                whiteSpace: "nowrap",
              }}
            >
              {controlLoading ? "..." : locked ? "🔓 Unlock Chat" : "🔒 Lock Chat"}
            </button>
          </div>
        </div>

        {dates.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "80px 0" }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>📭</p>
            <p style={{ fontFamily: "'Outfit',sans-serif" }}>No chat logs yet. Max hasn&apos;t started chatting!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => fetchLogs(d.date)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: 16, textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: "#fff", marginBottom: 4 }}>{d.date}</p>
                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{d.messageCount} messages</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                    {d.welfareAlerts > 0 && (
                      <span style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Mono',monospace" }}>
                        ⚠️ {d.welfareAlerts} alert{d.welfareAlerts !== 1 ? "s" : ""}
                      </span>
                    )}
                    {d.filterBlocks > 0 && (
                      <span style={{ background: "rgba(234,179,8,0.2)", color: "#fbbf24", padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Mono',monospace" }}>
                        🛡️ {d.filterBlocks} blocked
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Individual day log view
  return (
    <div style={{
      minHeight: "100vh", padding: 24, maxWidth: 640, margin: "0 auto",
      background: "linear-gradient(135deg, #0a0514, #1a1060)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => { setSelectedDate(null); setLogs([]); }}
          style={{ fontFamily: "'Outfit',sans-serif", color: "#0066ff", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 18, color: "#0066ff" }}>{selectedDate}</h1>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "40px 0" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map((entry, i) => {
            if (entry.type === "WELFARE_ALERT") {
              return (
                <div key={i} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#f87171" }}>⚠️ Welfare Alert (Tier {entry.level})</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{entry._logged || entry.timestamp}</span>
                  </div>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}><strong>Max said:</strong> {entry.userMessage}</p>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}><strong>Reason:</strong> {entry.reason}</p>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}><strong>Gojo responded:</strong> {entry.responseGiven}</p>
                </div>
              );
            }

            if (entry.type === "FILTER_EVENT") {
              return (
                <div key={i} style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fbbf24" }}>🛡️ {entry.direction} filter</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{entry._logged}</span>
                  </div>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {entry.reason || (entry as Record<string, unknown>).flags?.toString()}
                  </p>
                </div>
              );
            }

            if (entry.type === "MESSAGE") {
              const isMax = entry.role === "user";
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMax ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%", borderRadius: 12, padding: "8px 12px", fontSize: 13,
                    fontFamily: "'Outfit',sans-serif",
                    background: isMax ? "rgba(124,77,255,0.3)" : "rgba(255,255,255,0.1)",
                    color: isMax ? "#fff" : "rgba(255,255,255,0.8)",
                  }}>
                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                      {isMax ? "Max" : "Gojo"} • {entry._logged ? new Date(entry._logged).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                    <p style={{ margin: 0 }}>{entry.content}</p>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
