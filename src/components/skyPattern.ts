export interface Star {
  featured: boolean;
  haloRadius: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  sparkleSize: number;
  layer: "far" | "mid" | "near";
  color: string;
}

export interface Dust {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
}

export interface Cloud {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface Cluster {
  x: number;
  y: number;
  glowRadius: number;
  coreRadius: number;
  opacity: number;
  particles: Dust[];
}

export interface SkyPattern {
  clusters: Cluster[];
  clouds: Cloud[];
  dust: Dust[];
  hazes: Cloud[];
  stars: Star[];
}

interface RibbonOptions {
  baseY: number;
  endX?: number;
  segments?: number;
  slope: number;
  startX?: number;
  wobble: number;
}

function createRandomSeed(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || Date.now();
  }

  return Math.floor(Math.random() * 4294967295);
}

function seededRandom(seed: number): () => number {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function randomBetween(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

export function formatSkyCoordinate(value: number): string {
  return value.toFixed(2);
}

function createRibbonPath(random: () => number, options: RibbonOptions): string {
  const startX = options.startX ?? -12;
  const endX = options.endX ?? 112;
  const segments = options.segments ?? 5;
  const yAt = (x: number) =>
    options.baseY + options.slope * (x - startX) + randomBetween(random, -options.wobble, options.wobble);

  let currentX = startX;
  let currentY = yAt(currentX);
  let path = `M${formatSkyCoordinate(currentX)} ${formatSkyCoordinate(currentY)}`;

  for (let segment = 1; segment <= segments; segment += 1) {
    const nextX = startX + ((endX - startX) * segment) / segments;
    const nextY = yAt(nextX);
    const span = nextX - currentX;
    const c1X = currentX + span * randomBetween(random, 0.24, 0.42);
    const c2X = currentX + span * randomBetween(random, 0.58, 0.82);
    const c1Y = currentY + randomBetween(random, -options.wobble * 1.45, options.wobble * 1.45);
    const c2Y = nextY + randomBetween(random, -options.wobble * 1.45, options.wobble * 1.45);

    path += ` C${formatSkyCoordinate(c1X)} ${formatSkyCoordinate(c1Y)} ${formatSkyCoordinate(
      c2X
    )} ${formatSkyCoordinate(c2Y)} ${formatSkyCoordinate(nextX)} ${formatSkyCoordinate(nextY)}`;
    currentX = nextX;
    currentY = nextY;
  }

  return path;
}

function createStars(random: () => number, count: number): Star[] {
  return Array.from({ length: count }, (_, index) => {
    const bright = index % 7 === 0;
    const featured = index % 37 === 0;
    const layer = index % 5 === 0 ? "near" : index % 3 === 0 ? "mid" : "far";
    const radius = bright ? randomBetween(random, 0.17, 0.42) : randomBetween(random, 0.05, 0.17);

    return {
      featured,
      haloRadius: featured ? radius * randomBetween(random, 4.8, 7.5) : 0,
      x: random() * 100,
      y: random() * 100,
      radius,
      opacity: bright ? randomBetween(random, 0.62, 0.92) : randomBetween(random, 0.25, 0.72),
      sparkleSize: featured ? radius * randomBetween(random, 5.5, 8.8) : 0,
      layer,
      color: bright && random() > 0.55 ? "#fff2c6" : random() > 0.82 ? "#bfd9ff" : "#f7fbff"
    };
  });
}

function createDust(random: () => number, count: number): Dust[] {
  const dust: Dust[] = [];
  const slope = randomBetween(random, -0.42, -0.24);
  const baseY = randomBetween(random, 58, 74);

  while (dust.length < count) {
    const x = random() * 112 - 6;
    const bandY = baseY + slope * x;
    const y = bandY + randomBetween(random, -18, 18);

    if (y < -4 || y > 104) {
      continue;
    }

    dust.push({
      x,
      y,
      radius: randomBetween(random, 0.035, 0.15),
      opacity: randomBetween(random, 0.12, 0.7),
      color: random() > 0.72 ? "#fff0bc" : random() > 0.48 ? "#abd0ff" : "#eef7ff"
    });
  }

  return dust;
}

function createClusterParticles(random: () => number, x: number, y: number, count: number, spread: number): Dust[] {
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * spread;

    return {
      x: x + Math.cos(angle) * distance * randomBetween(random, 0.55, 1.15),
      y: y + Math.sin(angle) * distance * randomBetween(random, 0.42, 0.95),
      radius: randomBetween(random, 0.05, 0.22),
      opacity: randomBetween(random, 0.38, 0.92),
      color: random() > 0.65 ? "#fff3c6" : random() > 0.34 ? "#dce9ff" : "#8fb7ff"
    };
  });
}

function createClusters(random: () => number): Cluster[] {
  const anchors = [
    { x: randomBetween(random, 22, 34), y: randomBetween(random, 32, 44), strong: true },
    { x: randomBetween(random, 38, 52), y: randomBetween(random, 42, 55), strong: true },
    { x: randomBetween(random, 8, 18), y: randomBetween(random, 18, 32), strong: false },
    { x: randomBetween(random, 62, 78), y: randomBetween(random, 36, 50), strong: false }
  ];

  return anchors.map((anchor) => {
    const spread = anchor.strong ? randomBetween(random, 4.5, 7.5) : randomBetween(random, 3.4, 6);

    return {
      x: anchor.x,
      y: anchor.y,
      coreRadius: anchor.strong ? randomBetween(random, 0.8, 1.45) : randomBetween(random, 0.42, 0.85),
      glowRadius: anchor.strong ? randomBetween(random, 7, 10.5) : randomBetween(random, 4.8, 7.5),
      opacity: anchor.strong ? randomBetween(random, 0.52, 0.78) : randomBetween(random, 0.28, 0.48),
      particles: createClusterParticles(random, anchor.x, anchor.y, anchor.strong ? 28 : 18, spread)
    };
  });
}

function createClouds(random: () => number): Cloud[] {
  const cloudPalette = [
    "url(#cloudBlue)",
    "url(#milkyDust)",
    "url(#violetCloud)",
    "url(#tealCloud)",
    "url(#frostCloud)",
    "url(#brightNebula)",
    "url(#electricCloud)",
    "#62b6ff",
    "#02040b",
    "url(#milkyDust)",
    "#8bc8ff"
  ];

  return cloudPalette.map((stroke, index) => {
    const high = index % 3 === 1;
    const lower = index > 6;

    return {
      d: createRibbonPath(random, {
        baseY: lower ? randomBetween(random, 72, 88) : high ? randomBetween(random, 20, 42) : randomBetween(random, 44, 72),
        slope: lower ? randomBetween(random, -0.52, -0.26) : randomBetween(random, -0.42, -0.04),
        wobble: lower ? randomBetween(random, 4, 10) : randomBetween(random, 5, 12),
        startX: index % 4 === 0 ? -14 : randomBetween(random, -8, 34),
        endX: index % 5 === 0 ? randomBetween(random, 70, 108) : 114,
        segments: lower ? 4 : 6
      }),
      stroke,
      strokeWidth: lower ? randomBetween(random, 4, 13) : randomBetween(random, 3, 21),
      opacity: stroke === "#02040b" ? 0.42 : randomBetween(random, 0.42, 0.8)
    };
  });
}

function createHazes(random: () => number): Cloud[] {
  return [
    {
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 66, 78),
        slope: randomBetween(random, -0.62, -0.42),
        wobble: randomBetween(random, 3, 7),
        startX: randomBetween(random, 24, 36),
        endX: randomBetween(random, 88, 104),
        segments: 3
      }),
      stroke: "#8fb8ff",
      strokeWidth: randomBetween(random, 2.4, 3.8),
      opacity: 0.46
    },
    {
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 74, 84),
        slope: randomBetween(random, -0.54, -0.34),
        wobble: randomBetween(random, 4, 9),
        startX: randomBetween(random, 34, 48),
        endX: randomBetween(random, 84, 100),
        segments: 3
      }),
      stroke: "#b889d7",
      strokeWidth: randomBetween(random, 1.1, 1.8),
      opacity: 0.38
    }
  ];
}

export function createSkyPattern(seed = createRandomSeed()): SkyPattern {
  const random = seededRandom(seed);

  return {
    clusters: createClusters(random),
    clouds: createClouds(random),
    dust: createDust(random, 260),
    hazes: createHazes(random),
    stars: createStars(random, 440)
  };
}
