import { describe, expect, it } from "vitest";
import { createSkyPattern } from "./skyPattern";

describe("StarField", () => {
  it("creates different sky layouts from different seeds", () => {
    const first = createSkyPattern(101);
    const second = createSkyPattern(202);

    expect(first.stars).toHaveLength(440);
    expect(first.dust).toHaveLength(260);
    expect(first.clouds).toHaveLength(11);
    expect(first.hazes).toHaveLength(2);
    expect(first.clusters).toHaveLength(4);
    expect(first.stars.filter((star) => star.featured).length).toBeGreaterThan(10);
    expect(first.stars[0]).not.toEqual(second.stars[0]);
    expect(first.clouds.map((cloud) => cloud.d)).not.toEqual(second.clouds.map((cloud) => cloud.d));
  });
});
