import { getNewMoonBounds, SYNODIC_MONTH_MS } from "../lunar/lunarEngine";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EVENT_COUNT = 18;
const REMINDER_HOUR = 12;
const EVENT_DURATION_MINUTES = 15;

export interface CalendarReminder {
  id: string;
  reminderAt: Date;
  windowStart: Date;
  windowEnd: Date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function atLocalNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), REMINDER_HOUR, 0, 0, 0);
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

export function getUpcomingYoungCrescentReminders(
  from = new Date(),
  count = DEFAULT_EVENT_COUNT
): CalendarReminder[] {
  const { previousNewMoon, nextNewMoon } = getNewMoonBounds(from);
  const reminders: CalendarReminder[] = [];
  let cycleCenter = previousNewMoon;

  if (atLocalNoon(new Date(cycleCenter.getTime() + DAY_MS)).getTime() <= from.getTime()) {
    cycleCenter = nextNewMoon;
  }

  while (reminders.length < count) {
    const windowStart = new Date(cycleCenter.getTime() + DAY_MS);
    const windowEnd = new Date(cycleCenter.getTime() + 3 * DAY_MS);
    const reminderAt = atLocalNoon(windowStart);

    if (reminderAt.getTime() > from.getTime()) {
      reminders.push({
        id: `luna-young-crescent-${formatLocalDateTime(reminderAt).slice(0, 8)}`,
        reminderAt,
        windowEnd,
        windowStart
      });
    }

    cycleCenter = new Date(cycleCenter.getTime() + SYNODIC_MONTH_MS);
  }

  return reminders;
}

export function createYoungCrescentCalendar(from = new Date(), count = DEFAULT_EVENT_COUNT): string {
  const now = new Date();
  const events = getUpcomingYoungCrescentReminders(from, count);
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
    const summary = "Молодой серп";
    const description = "Сегодня вечером можно посмотреть на молодой месяц.";

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@kolosovao.github.io`,
      `DTSTAMP:${formatUtcDateTime(now)}`,
      `DTSTART:${formatLocalDateTime(event.reminderAt)}`,
      `DTEND:${formatLocalDateTime(endAt)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(summary)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return makeCalendarLines(lines);
}

export function downloadYoungCrescentCalendar(): void {
  const calendar = createYoungCrescentCalendar();
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "luna-reminders.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
