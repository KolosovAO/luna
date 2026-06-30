import { getNewMoonBounds, SYNODIC_MONTH_MS } from "../lunar/lunarEngine";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EVENT_COUNT = 18;
const NOON_REMINDER_HOUR = 12;
const EVENING_REMINDER_HOUR = 20;
const EVENT_DURATION_MINUTES = 15;

export type CalendarReminderMode = "young-crescent-noon" | "young-crescent-evening";

export interface CalendarReminder {
  id: string;
  mode: CalendarReminderMode;
  reminderAt: Date;
  summary: string;
  description: string;
  windowStart: Date;
  windowEnd: Date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function atLocalHour(date: Date, hour: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatLocalDateTime(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function formatUtcDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  const limit = 74;

  if (line.length <= limit) {
    return line;
  }

  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > limit) {
    chunks.push(remaining.slice(0, limit));
    remaining = ` ${remaining.slice(limit)}`;
  }

  chunks.push(remaining);
  return chunks.join("\r\n");
}

function makeCalendarLines(lines: string[]): string {
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

function getFirstCycleCenter(from: Date, mode: CalendarReminderMode): Date {
  const { previousNewMoon, nextNewMoon } = getNewMoonBounds(from);
  const reminderHour = mode === "young-crescent-evening" ? EVENING_REMINDER_HOUR : NOON_REMINDER_HOUR;

  return atLocalHour(new Date(previousNewMoon.getTime() + DAY_MS), reminderHour).getTime() <= from.getTime()
    ? nextNewMoon
    : previousNewMoon;
}

function makeReminder(cycleCenter: Date, mode: CalendarReminderMode): CalendarReminder {
  const windowStart = new Date(cycleCenter.getTime() + DAY_MS);
  const windowEnd = new Date(cycleCenter.getTime() + 3 * DAY_MS);
  const reminderHour = mode === "young-crescent-evening" ? EVENING_REMINDER_HOUR : NOON_REMINDER_HOUR;
  const reminderAt = atLocalHour(windowStart, reminderHour);
  const description =
    mode === "young-crescent-evening"
      ? "Пора искать молодой месяц и показать ему деньги."
      : "Сегодня вечером можно посмотреть на молодой месяц и показать ему деньги.";

  return {
    id: `luna-young-crescent-${formatLocalDateTime(reminderAt).slice(0, 8)}`,
    description,
    mode,
    reminderAt,
    summary: "Молодой серп",
    windowEnd,
    windowStart
  };
}

export function getUpcomingLunarReminders(
  from = new Date(),
  count = DEFAULT_EVENT_COUNT,
  mode: CalendarReminderMode = "young-crescent-noon"
): CalendarReminder[] {
  const reminders: CalendarReminder[] = [];
  let cycleCenter = getFirstCycleCenter(from, mode);

  while (reminders.length < count) {
    const reminder = makeReminder(cycleCenter, mode);

    if (reminder.reminderAt.getTime() > from.getTime()) {
      reminders.push(reminder);
    }

    cycleCenter = new Date(cycleCenter.getTime() + SYNODIC_MONTH_MS);
  }

  return reminders;
}

export function createLunarCalendar(
  from = new Date(),
  count = DEFAULT_EVENT_COUNT,
  mode: CalendarReminderMode = "young-crescent-noon"
): string {
  const now = new Date();
  const events = getUpcomingLunarReminders(from, count, mode);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Luna Helper//Young Crescent Calendar//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Luna Helper"
  ];

  for (const event of events) {
    const endAt = addMinutes(event.reminderAt, EVENT_DURATION_MINUTES);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@kolosovao.github.io`,
      `DTSTAMP:${formatUtcDateTime(now)}`,
      `DTSTART:${formatLocalDateTime(event.reminderAt)}`,
      `DTEND:${formatLocalDateTime(endAt)}`,
      `SUMMARY:${escapeText(event.summary)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(event.summary)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return makeCalendarLines(lines);
}

export function downloadLunarCalendar(mode: CalendarReminderMode): void {
  const calendar = createLunarCalendar(new Date(), DEFAULT_EVENT_COUNT, mode);
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = mode === "young-crescent-evening" ? "luna-young-crescent-evening.ics" : "luna-young-crescent.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
