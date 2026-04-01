"use client";

import { useState, useEffect } from "react";

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

  const headers = { "x-parent-password": password };

  const fetchDates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/logs", { headers });
      if (res.status === 401) {
        setError("Wrong password");
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setDates(data.dates || []);
      setAuthenticated(true);
      setError("");
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (date: string) => {
    setLoading(true);
    setSelectedDate(date);
    try {
      const res = await fetch(`/api/parent/logs?date=${date}`, { headers });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gojo-blue">🔒 Parent Dashboard</h1>
          <p className="text-white/50 text-sm">Enter the parent password to view chat logs</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchDates()}
            placeholder="Parent password"
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gojo-blue/50"
          />
          <button
            onClick={fetchDates}
            disabled={!password || loading}
            className="w-full bg-gradient-to-r from-gojo-blue to-gojo-purple text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-30"
          >
            {loading ? "Loading..." : "View Logs"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // Date list view
  if (!selectedDate) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gojo-blue">🔒 Parent Dashboard</h1>
          <button
            onClick={() => { setAuthenticated(false); setPassword(""); }}
            className="text-white/40 hover:text-white/70 text-sm"
          >
            Log out
          </button>
        </div>

        {dates.length === 0 ? (
          <div className="text-center text-white/40 py-20">
            <p className="text-4xl mb-4">📭</p>
            <p>No chat logs yet. Max hasn&apos;t started chatting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => fetchLogs(d.date)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{d.date}</p>
                    <p className="text-white/50 text-sm">{d.messageCount} messages</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    {d.welfareAlerts > 0 && (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                        ⚠️ {d.welfareAlerts} alert{d.welfareAlerts !== 1 ? "s" : ""}
                      </span>
                    )}
                    {d.filterBlocks > 0 && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
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
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => { setSelectedDate(null); setLogs([]); }}
          className="text-gojo-blue hover:text-white transition-all"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gojo-blue">{selectedDate}</h1>
      </div>

      {loading ? (
        <p className="text-white/40 text-center py-10">Loading...</p>
      ) : (
        <div className="space-y-2">
          {logs.map((entry, i) => {
            // Welfare alerts
            if (entry.type === "WELFARE_ALERT") {
              return (
                <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400 font-bold">⚠️ Welfare Alert (Tier {entry.level})</span>
                    <span className="text-white/30 text-xs">{entry._logged || entry.timestamp}</span>
                  </div>
                  <p className="text-white/70 text-sm"><strong>Max said:</strong> {entry.userMessage}</p>
                  <p className="text-white/50 text-sm mt-1"><strong>Reason:</strong> {entry.reason}</p>
                  <p className="text-white/50 text-sm mt-1"><strong>Gojo responded:</strong> {entry.responseGiven}</p>
                </div>
              );
            }

            // Filter events
            if (entry.type === "FILTER_EVENT") {
              return (
                <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">🛡️ {entry.direction} filter</span>
                    <span className="text-white/30 text-xs">{entry._logged}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-1">{entry.reason || (entry as Record<string, unknown>).flags?.toString()}</p>
                </div>
              );
            }

            // Regular messages
            if (entry.type === "MESSAGE") {
              const isMax = entry.role === "user";
              return (
                <div key={i} className={`flex ${isMax ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      isMax
                        ? "bg-gojo-purple/30 text-white"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    <p className="text-[10px] text-white/30 mb-1">
                      {isMax ? "Max" : "Gojo"} • {entry._logged ? new Date(entry._logged).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                    <p>{entry.content}</p>
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
