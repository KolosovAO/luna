import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getIlluminatedPath, MoonPhase } from "./MoonPhase";

describe("MoonPhase", () => {
  it("does not render a bright crescent for a near-new moon", () => {
    expect(getIlluminatedPath(0.01, true)).toBe("");
  });

  it("renders different lit-side paths for waxing and waning crescents", () => {
    expect(getIlluminatedPath(0.16, true)).not.toBe(getIlluminatedPath(0.16, false));
  });

  it("renders accessible svg markup with the phase label", () => {
    const markup = renderToStaticMarkup(
      <MoonPhase illuminationFraction={0.18} isWaxing={true} label="Растущий серп" />
    );

    expect(markup).toContain("Текущая фаза Луны: Растущий серп");
    expect(markup).toContain("moon-figure__light");
  });

  it("keeps earthshine subtle for a young crescent", () => {
    const markup = renderToStaticMarkup(
      <MoonPhase illuminationFraction={0.08} isWaxing={true} label="Молодой месяц" />
    );

    expect(markup).toContain("--moon-earthshine-opacity:0.054");
    expect(markup).toContain("--moon-aura-opacity:0.125");
  });
});
