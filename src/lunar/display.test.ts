import { describe, expect, it } from "vitest";
import { getDisplayState } from "./display";
import { getLunarSnapshot, KNOWN_NEW_MOON_UTC_MS, SYNODIC_MONTH_MS } from "./lunarEngine";

const hourMs = 60 * 60 * 1000;

function snapshotAt(offsetMs: number) {
  return getLunarSnapshot(new Date(KNOWN_NEW_MOON_UTC_MS + offsetMs));
}

describe("display state", () => {
  it("prioritizes the young crescent money window", () => {
    const display = getDisplayState(snapshotAt(36 * hourMs));

    expect(display.mode).toBe("money-window-active");
    expect(display.title).toBe("Молодой месяц");
  });

  it("shows a short new moon state while the moon is invisible", () => {
    const display = getDisplayState(snapshotAt(8 * hourMs));

    expect(display.mode).toBe("new-moon-window-active");
    expect(display.title).toBe("Луну не видно");
  });

  it("shows the standard countdown before a future special window", () => {
    const display = getDisplayState(snapshotAt(-30 * hourMs));

    expect(display.mode).toBe("standard-countdown");
    expect(display.countdownTarget.getTime()).toBeCloseTo(KNOWN_NEW_MOON_UTC_MS, -2);
  });

  it("falls back to the next major event away from special windows", () => {
    const display = getDisplayState(snapshotAt(SYNODIC_MONTH_MS * 0.4));

    expect(display.mode).toBe("standard-countdown");
  });
});
