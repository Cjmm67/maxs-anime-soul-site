// =============================================================
// WELFARE MODULE
// Handles distress detection logging and escalation
// =============================================================

import { logConversation } from "./logger";

export interface WelfareEvent {
  level: 1 | 2 | 3;
  timestamp: string;
  userMessage: string;
  reason: string;
  responseGiven: string;
}

// In-memory store for current session welfare events
const welfareEvents: WelfareEvent[] = [];

export async function recordWelfareEvent(event: WelfareEvent): Promise<void> {
  welfareEvents.push(event);

  // Log to Redis for parental review
  await logConversation({
    timestamp: event.timestamp,
    type: "WELFARE_ALERT",
    level: event.level,
    userMessage: event.userMessage,
    reason: event.reason,
    responseGiven: event.responseGiven,
  });

  // Tier 3: In production, send immediate parent notification
  if (event.level === 3) {
    console.error(
      `[WELFARE TIER 3] Immediate parent alert needed. Time: ${event.timestamp}. Reason: ${event.reason}`
    );
    // TODO: Integrate email/SMS alert to parent
    // sendParentAlert(event);
  }

  // Tier 2: Log for next parent review
  if (event.level === 2) {
    console.warn(
      `[WELFARE TIER 2] Flagged for parent review. Time: ${event.timestamp}. Reason: ${event.reason}`
    );
  }
}

export function getWelfareEvents(): WelfareEvent[] {
  return [...welfareEvents];
}

// Singapore-specific resources
export const SINGAPORE_RESOURCES = {
  tinkleFriend: {
    name: "Tinkle Friend Helpline",
    number: "1800-274-4788",
    description: "Free helpline for primary school children (under 12)",
    hours: "Mon-Fri 2:30pm-5pm, Tues-Thurs also 7pm-9pm",
  },
  sos: {
    name: "Samaritans of Singapore (SOS)",
    number: "1767",
    description: "24-hour crisis helpline",
    hours: "24/7",
  },
  childProtective: {
    name: "Child Protective Service",
    number: "1800-777-0000",
    description: "Report child abuse/neglect",
    hours: "24/7",
  },
};
