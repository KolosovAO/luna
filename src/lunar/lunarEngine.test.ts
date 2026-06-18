import { describe, expect, it } from "vitest";
import {
  getCountdownParts,
  getLunarPhase,
  getLunarSnapshot,
  getNextMajorEvent,
  KNOWN_NEW_MOON_UTC_MS,
  SYNODIC_MONTH_MS
} from "./lunarEngine";

const hourMs = 60 * 60 * 1000;

function dateFromEpoch(offsetMs: number): Date {
  return new Date(KNOWN_NEW_MOON_UTC_MS + offsetMs);
}

describe("lunar engine", () => {
  it("detects the known new moon as invisible new moon", () => {
    const phase = getLunarPhase(dateFromEpoch(0));

    expect(phase.id).toBe("new-moon");
    expect(phase.isWaxing).toBe(true);
    expect(phase.normallyVisible).toBe(false);
    expect(phase.illuminationFraction).toBeLessThan(0.01);
  });

  it("detects waxing crescent after the new moon", () => {
    const phase = getLunarPhase(dateFromEpoch(48 * hourMs));

    expect(phase.id).toBe("waxing-crescent");
    expect(phase.isWaxing).toBe(true);
    expect(phase.normallyVisible).toBe(true);
  });

  it("calculates the astrological new moon window around the exact moment", () => {
    const before = getLunarSnapshot(dateFromEpoch(-12 * hourMs));
    const after = getLunarSnapshot(dateFromEpoch(12 * hourMs));
    const outside = getLunarSnapshot(dateFromEpoch(25 * hourMs));

    expect(before.astrologicalNewMoonWindow.active).toBe(true);
    expect(after.astrologicalNewMoonWindow.active).toBe(true);
    expect(outside.astrologicalNewMoonWindow.active).toBe(false);
  });

  it("calculates the young crescent money window from 24 to 72 hours after new moon", () => {
    const beforeWindow = getLunarSnapshot(dateFromEpoch(23 * hourMs));
    const activeWindow = getLunarSnapshot(dateFromEpoch(36 * hourMs));
    const afterWindow = getLunarSnapshot(dateFromEpoch(73 * hourMs));

    expect(beforeWindow.youngCrescentMoneyWindow.active).toBe(false);
    expect(beforeWindow.youngCrescentMoneyWindow.upcoming).toBe(true);
    expect(activeWindow.youngCrescentMoneyWindow.active).toBe(true);
    expect(afterWindow.youngCrescentMoneyWindow.active).toBe(false);
  });

  it("selects the next major event inside a lunar cycle", () => {
    const nextEvent = getNextMajorEvent(dateFromEpoch(2 * hourMs));

    expect(nextEvent.id).toBe("first-quarter");
    expect(nextEvent.at.getTime()).toBeGreaterThan(KNOWN_NEW_MOON_UTC_MS);
  });

  it("selects the next cycle new moon after the last quarter", () => {
    const nextEvent = getNextMajorEvent(dateFromEpoch(SYNODIC_MONTH_MS * 0.82));

    expect(nextEvent.id).toBe("new-moon");
  });

  it("formats countdown parts without negative values", () => {
    expect(getCountdownParts(dateFromEpoch(10_000), dateFromEpoch(0))).toEqual({
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    expect(getCountdownParts(dateFromEpoch(0), dateFromEpoch(25 * hourMs + 61_000))).toMatchObject({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1
    });
  });
});
