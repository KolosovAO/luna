import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createSkyPattern, StarField } from "./StarField";

describe("StarField", () => {
  it("renders an svg star field with scalable background layers", () => {
    const markup = renderToStaticMarkup(<StarField />);

    expect(markup).toContain("class=\"star-field\"");
    expect(markup.match(/class="star-field__star"/g)?.length).toBe(440);
    expect(markup.match(/class="star-field__dust"/g)?.length).toBe(260);
    expect(markup.match(/class="star-field__cluster"/g)?.length).toBe(4);
    expect(markup.match(/class="featured-star__halo"/g)?.length).toBeGreaterThan(10);
    expect(markup).toContain("star-field__nebulae");
    expect(markup).toContain("star-field__foreground");
    expect(markup).toContain("haze");
  });

  it("creates different sky layouts from different seeds", () => {
    const first = createSkyPattern(101);
    const second = createSkyPattern(202);

    expect(first.stars).toHaveLength(440);
    expect(first.dust).toHaveLength(260);
    expect(first.clouds).toHaveLength(11);
    expect(first.clusters).toHaveLength(4);
    expect(first.stars.filter((star) => star.featured).length).toBeGreaterThan(10);
    expect(first.stars[0]).not.toEqual(second.stars[0]);
    expect(first.clouds.map((cloud) => cloud.d)).not.toEqual(second.clouds.map((cloud) => cloud.d));
  });
});
