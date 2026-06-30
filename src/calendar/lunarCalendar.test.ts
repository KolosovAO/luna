import { describe, expect, it } from "vitest";
import { createYoungCrescentCalendar, getUpcomingYoungCrescentReminders } from "./lunarCalendar";

describe("lunar calendar export", () => {
  it("creates future noon reminders", () => {
    const reminders = getUpcomingYoungCrescentReminders(new Date("2026-06-30T10:00:00.000Z"), 3);

    expect(reminders).toHaveLength(3);
    expect(reminders[0].reminderAt.getHours()).toBe(12);
    expect(reminders[0].reminderAt.getTime()).toBeGreaterThan(Date.parse("2026-06-30T10:00:00.000Z"));
  });

  it("exports calendar events with alarms", () => {
    const calendar = createYoungCrescentCalendar(new Date("2026-06-30T10:00:00.000Z"), 2);

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("X-WR-CALNAME:Luna Helper");
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(calendar.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(calendar).toContain("TRIGGER:-PT0M");
  });
});
