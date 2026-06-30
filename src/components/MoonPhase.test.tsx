import { describe, expect, it } from "vitest";
import { getIlluminatedPath, getMoonVisualMetrics } from "./moonMath";

describe("MoonPhase", () => {
  it("does not render a bright crescent for a near-new moon", () => {
    expect(getIlluminatedPath(0.01, true)).toBe("");
  });

  it("renders different lit-side paths for waxing and waning crescents", () => {
    expect(getIlluminatedPath(0.16, true)).not.toBe(getIlluminatedPath(0.16, false));
  });

  it("keeps earthshine subtle for a young crescent", () => {
    const metrics = getMoonVisualMetrics(0.08);

    expect(metrics.earthshineOpacity).toBeCloseTo(0.054, 3);
    expect(metrics.auraOpacity).toBeCloseTo(0.126, 3);
  });
});
