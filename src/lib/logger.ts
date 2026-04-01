// =============================================================
// CONVERSATION LOGGER
// Logs all chats to Upstash Redis for parental review
// =============================================================

import { redis } from "./redis";

interface LogEntry {
  type: string;
  [key: string]: unknown;
}

function getTodayKey(): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  return date;
}

/**
 * Append a log entry to today's conversation log in Redis.
 * Stored as a JSON array under key `logs:YYYY-MM-DD`.
 * Each key expires after 30 days.
 */
export async function logConversation(entry: LogEntry): Promise<void> {
  try {
    const date = getTodayKey();
    const key = `logs:${date}`;

    const logEntry = {
      ...entry,
      _logged: new Date().toISOString(),
    };

    // Append to the Redis list for this date
    await redis.rpush(key, JSON.stringify(logEntry));

    // Set expiry to 30 days (only sets if not already set)
    await redis.expire(key, 30 * 24 * 60 * 60);

    // Track this date in the date index set
    await redis.sadd("logs:dates", date);
  } catch (err) {
    console.error("Failed to log conversation:", err);
  }
}

export async function logMessage(
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logConversation({
    type: "MESSAGE",
    role,
    content,
    ...metadata,
  });
}

export async function logFilterEvent(
  direction: "input" | "output",
  originalContent: string,
  filterResult: Record<string, unknown>
): Promise<void> {
  await logConversation({
    type: "FILTER_EVENT",
    direction,
    originalContent,
    ...filterResult,
  });
}

/**
 * Get all log entries for a specific date.
 */
export async function getLogsForDate(date: string): Promise<LogEntry[]> {
  try {
    const key = `logs:${date}`;
    const raw = await redis.lrange(key, 0, -1);
    return raw.map((entry) => {
      if (typeof entry === "string") {
        return JSON.parse(entry);
      }
      return entry as LogEntry;
    });
  } catch (err) {
    console.error("Failed to get logs:", err);
    return [];
  }
}

/**
 * Get all dates that have logs.
 */
export async function getLogDates(): Promise<string[]> {
  try {
    const dates = await redis.smembers("logs:dates");
    return (dates as string[]).sort().reverse(); // Most recent first
  } catch (err) {
    console.error("Failed to get log dates:", err);
    return [];
  }
}
