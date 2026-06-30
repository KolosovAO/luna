import { describe, expect, it } from "vitest";
import { createLunarCalendar, getUpcomingLunarReminders } from "./lunarCalendar";

describe("lunar calendar export", () => {
  it("creates future noon reminders", () => {
    const reminders = getUpcomingLunarReminders(new Date("2026-06-30T10:00:00.000Z"), 3, "young-crescent-noon");

    expect(reminders).toHaveLength(3);
    expect(reminders[0].reminderAt.getHours()).toBe(12);
    expect(reminders[0].reminderAt.getTime()).toBeGreaterThan(Date.parse("2026-06-30T10:00:00.000Z"));
    expect(reminders[0].summary).toBe("Молодой серп");
  });

  it("creates future new moon moment reminders", () => {
    const reminders = getUpcomingLunarReminders(new Date("2026-06-30T10:00:00.000Z"), 3, "new-moon-moment");

    expect(reminders).toHaveLength(3);
    expect(reminders[0].summary).toBe("Новолуние");
    expect(reminders[0].reminderAt.getMinutes()).not.toBe(0);
    expect(reminders[0].reminderAt.getTime()).toBeGreaterThan(Date.parse("2026-06-30T10:00:00.000Z"));
  });

  it("exports calendar events with alarms", () => {
    const calendar = createLunarCalendar(new Date("2026-06-30T10:00:00.000Z"), 2, "young-crescent-noon");

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("X-WR-CALNAME:Luna Helper");
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(calendar.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(calendar).toContain("TRIGGER:-PT0M");
  });

  it("exports new moon moment text", () => {
    const calendar = createLunarCalendar(new Date("2026-06-30T10:00:00.000Z"), 1, "new-moon-moment");

    expect(calendar).toContain("SUMMARY:Новолуние");
    expect(calendar).toContain("Точный момент новолуния");
  });
});
