import { useMemo, type CSSProperties } from "react";

interface Star {
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

interface Dust {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Cloud {
  className: string;
  d: string;
  stroke: string;
  strokeWidth: number;
}

interface Haze {
  className: string;
  d: string;
  stroke: string;
  strokeWidth: number;
}

interface Cluster {
  x: number;
  y: number;
  glowRadius: number;
  coreRadius: number;
  opacity: number;
  particles: Dust[];
}

interface SkyPattern {
  clusters: Cluster[];
  dust: Dust[];
  hazes: Haze[];
  stars: Star[];
  clouds: Cloud[];
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

function formatCoordinate(value: number): string {
  return value.toFixed(2);
}

function createRibbonPath(random: () => number, options: RibbonOptions): string {
  const startX = options.startX ?? -12;
  const endX = options.endX ?? 112;
  const segments = options.segments ?? 4;

  const yAt = (x: number) =>
    options.baseY + options.slope * (x - startX) + randomBetween(random, -options.wobble, options.wobble);

  let currentX = startX;
  let currentY = yAt(currentX);
  let path = `M${formatCoordinate(currentX)} ${formatCoordinate(currentY)}`;

  for (let segment = 1; segment <= segments; segment += 1) {
    const nextX = startX + ((endX - startX) * segment) / segments;
    const nextY = yAt(nextX);
    const span = nextX - currentX;
    const c1X = currentX + span * randomBetween(random, 0.24, 0.42);
    const c2X = currentX + span * randomBetween(random, 0.58, 0.82);
    const c1Y = currentY + randomBetween(random, -options.wobble * 1.5, options.wobble * 1.5);
    const c2Y = nextY + randomBetween(random, -options.wobble * 1.5, options.wobble * 1.5);

    path += ` C${formatCoordinate(c1X)} ${formatCoordinate(c1Y)} ${formatCoordinate(c2X)} ${formatCoordinate(
      c2Y
    )} ${formatCoordinate(nextX)} ${formatCoordinate(nextY)}`;
    currentX = nextX;
    currentY = nextY;
  }

  return path;
}

function createStars(random: () => number, count: number): Star[] {
  return Array.from({ length: count }, (_, index) => {
    const brighterBand = index % 7 === 0;
    const featured = index % 37 === 0;
    const layer = index % 5 === 0 ? "near" : index % 3 === 0 ? "mid" : "far";
    const radius = brighterBand ? randomBetween(random, 0.17, 0.41) : randomBetween(random, 0.055, 0.175);

    return {
      featured,
      haloRadius: featured ? radius * randomBetween(random, 4.8, 7.4) : 0,
      x: random() * 100,
      y: random() * 100,
      radius,
      opacity: brighterBand ? randomBetween(random, 0.62, 0.9) : randomBetween(random, 0.28, 0.72),
      sparkleSize: featured ? radius * randomBetween(random, 5.8, 8.8) : 0,
      layer,
      color: brighterBand && random() > 0.55 ? "#fff6d7" : random() > 0.82 ? "#cfe2ff" : "#f7fbff"
    };
  });
}

function createDust(random: () => number, count: number): Dust[] {
  const dust: Dust[] = [];
  const slope = randomBetween(random, -0.26, -0.42);
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
      radius: randomBetween(random, 0.035, 0.145),
      opacity: randomBetween(random, 0.12, 0.72),
      color: random() > 0.74 ? "#fff1bd" : random() > 0.48 ? "#b8d5ff" : "#eef7ff"
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
    { x: randomBetween(random, 23, 34), y: randomBetween(random, 32, 44), strong: true },
    { x: randomBetween(random, 38, 52), y: randomBetween(random, 42, 55), strong: true },
    { x: randomBetween(random, 9, 18), y: randomBetween(random, 18, 32), strong: false },
    { x: randomBetween(random, 62, 78), y: randomBetween(random, 36, 50), strong: false }
  ];

  return anchors.map((anchor) => {
    const spread = anchor.strong ? randomBetween(random, 4.5, 7.5) : randomBetween(random, 3.5, 6);

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
  return [
    {
      className: "star-field__cloud star-field__cloud--broad",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 66, 78),
        slope: randomBetween(random, -0.3, -0.44),
        wobble: randomBetween(random, 6, 10),
        segments: 6
      }),
      stroke: "url(#cloudBlue)",
      strokeWidth: randomBetween(random, 16, 21)
    },
    {
      className: "star-field__cloud star-field__cloud--upper",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 20, 34),
        slope: randomBetween(random, -0.05, -0.18),
        wobble: randomBetween(random, 5, 9),
        segments: 6
      }),
      stroke: "url(#tealCloud)",
      strokeWidth: randomBetween(random, 6.8, 10.5)
    },
    {
      className: "star-field__cloud star-field__cloud--left-mist",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 50, 64),
        slope: randomBetween(random, -0.04, -0.18),
        wobble: randomBetween(random, 7, 12),
        startX: -14,
        endX: randomBetween(random, 62, 82),
        segments: 6
      }),
      stroke: "url(#frostCloud)",
      strokeWidth: randomBetween(random, 12, 17)
    },
    {
      className: "star-field__cloud star-field__cloud--dust",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 58, 70),
        slope: randomBetween(random, -0.22, -0.38),
        wobble: randomBetween(random, 4, 8),
        endX: randomBetween(random, 96, 116),
        segments: 6
      }),
      stroke: "url(#milkyDust)",
      strokeWidth: randomBetween(random, 6, 9.2)
    },
    {
      className: "star-field__cloud star-field__cloud--core-veil",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 46, 58),
        slope: randomBetween(random, -0.18, -0.34),
        wobble: randomBetween(random, 5, 9),
        startX: randomBetween(random, 18, 30),
        endX: randomBetween(random, 88, 108),
        segments: 6
      }),
      stroke: "url(#brightNebula)",
      strokeWidth: randomBetween(random, 7.4, 11.5)
    },
    {
      className: "star-field__cloud star-field__cloud--violet",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 38, 54),
        slope: randomBetween(random, -0.08, -0.24),
        wobble: randomBetween(random, 4, 9),
        startX: randomBetween(random, -8, 8),
        endX: randomBetween(random, 96, 118),
        segments: 5
      }),
      stroke: "url(#violetCloud)",
      strokeWidth: randomBetween(random, 6.8, 10.5)
    },
    {
      className: "star-field__cloud star-field__cloud--blue-thread",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 28, 42),
        slope: randomBetween(random, 0.02, -0.12),
        wobble: randomBetween(random, 4, 8),
        startX: randomBetween(random, 22, 36),
        endX: 114,
        segments: 7
      }),
      stroke: "url(#electricCloud)",
      strokeWidth: randomBetween(random, 2.8, 4.8)
    },
    {
      className: "star-field__cloud star-field__cloud--right",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 72, 86),
        slope: randomBetween(random, -0.34, -0.52),
        wobble: randomBetween(random, 6, 11),
        startX: randomBetween(random, 58, 70),
        endX: 112,
        segments: 4
      }),
      stroke: "#62b6ff",
      strokeWidth: randomBetween(random, 9, 13)
    },
    {
      className: "star-field__cloud star-field__cloud--shadow",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 44, 60),
        slope: randomBetween(random, -0.1, -0.28),
        wobble: randomBetween(random, 3, 7),
        startX: randomBetween(random, 6, 20),
        segments: 5
      }),
      stroke: "#02040b",
      strokeWidth: randomBetween(random, 5.4, 7.8)
    },
    {
      className: "star-field__cloud star-field__cloud--gold",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 58, 70),
        slope: randomBetween(random, -0.16, -0.3),
        wobble: randomBetween(random, 2, 5),
        startX: randomBetween(random, -2, 12),
        endX: randomBetween(random, 78, 102),
        segments: 5
      }),
      stroke: "url(#milkyDust)",
      strokeWidth: randomBetween(random, 2.2, 4)
    },
    {
      className: "star-field__cloud star-field__cloud--lower",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 78, 88),
        slope: randomBetween(random, -0.08, -0.24),
        wobble: randomBetween(random, 4, 8),
        segments: 6
      }),
      stroke: "#8bc8ff",
      strokeWidth: randomBetween(random, 6, 9)
    }
  ];
}

function createHazes(random: () => number): Haze[] {
  return [
    {
      className: "star-field__haze star-field__haze--one",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 66, 78),
        slope: randomBetween(random, -0.42, -0.62),
        wobble: randomBetween(random, 3, 7),
        startX: randomBetween(random, 24, 36),
        endX: randomBetween(random, 88, 104),
        segments: 3
      }),
      stroke: "#8fb8ff",
      strokeWidth: randomBetween(random, 2.4, 3.8)
    },
    {
      className: "star-field__haze star-field__haze--two",
      d: createRibbonPath(random, {
        baseY: randomBetween(random, 74, 84),
        slope: randomBetween(random, -0.34, -0.54),
        wobble: randomBetween(random, 4, 9),
        startX: randomBetween(random, 34, 48),
        endX: randomBetween(random, 84, 100),
        segments: 3
      }),
      stroke: "#b889d7",
      strokeWidth: randomBetween(random, 1.1, 1.8)
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

const layers = ["far", "mid", "near"] as const;

export function StarField() {
  const { clusters, clouds, dust, hazes, stars } = useMemo(() => createSkyPattern(), []);

  return (
    <svg className="star-field" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="skyDepth" cx="50%" cy="34%" r="86%">
          <stop offset="0%" stopColor="#243e66" />
          <stop offset="34%" stopColor="#10213d" />
          <stop offset="68%" stopColor="#060c19" />
          <stop offset="100%" stopColor="#030711" />
        </radialGradient>
        <linearGradient id="cloudBlue" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#d8e8ff" stopOpacity="0.18" />
          <stop offset="34%" stopColor="#6aa7ff" stopOpacity="0.42" />
          <stop offset="70%" stopColor="#1d5fb4" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#9ed7ff" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="milkyDust" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#a7c8ff" stopOpacity="0.18" />
          <stop offset="46%" stopColor="#fff4c4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#75b8ff" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="violetCloud" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7ec8ff" stopOpacity="0.12" />
          <stop offset="45%" stopColor="#b798ff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffdca8" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="tealCloud" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#3766d7" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#92e6ff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#dfeaff" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="frostCloud" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#b7d8ff" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#79bfff" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#e8f4ff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="brightNebula" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#6ca7ff" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#fff2bb" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#75c9ff" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="electricCloud" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4d86ff" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#9fe7ff" stopOpacity="0.46" />
          <stop offset="100%" stopColor="#d5ecff" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8ce" stopOpacity="0.54" />
          <stop offset="42%" stopColor="#88b9ff" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#335fa8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="starSoftGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.42" />
          <stop offset="45%" stopColor="#b7d8ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6aa7ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="horizonShade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#07101f" stopOpacity="0" />
          <stop offset="100%" stopColor="#01030a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill="url(#skyDepth)" />

      <g className="star-field__nebulae">
        {clouds.map((cloud, index) => (
          <path
            key={`${cloud.className}-${index}`}
            className={cloud.className}
            d={cloud.d}
            fill="none"
            stroke={cloud.stroke}
            strokeWidth={cloud.strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </g>

      <g className="star-field__clusters">
        {clusters.map((cluster, index) => (
          <g key={`${cluster.x}-${cluster.y}-${index}`} className="star-field__cluster">
            <circle
              className="star-field__cluster-glow"
              cx={cluster.x}
              cy={cluster.y}
              r={cluster.glowRadius}
              fill="url(#clusterGlow)"
              style={
                {
                  "--cluster-opacity": cluster.opacity.toString()
                } as CSSProperties
              }
            />
            <circle className="star-field__cluster-core" cx={cluster.x} cy={cluster.y} r={cluster.coreRadius} />
            {cluster.particles.map((particle, particleIndex) => (
              <circle
                key={particleIndex}
                className="star-field__cluster-star"
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill={particle.color}
                style={
                  {
                    "--star-base-opacity": particle.opacity.toString()
                  } as CSSProperties
                }
              />
            ))}
          </g>
        ))}
      </g>

      {hazes.map((haze, index) => (
        <path
          key={`${haze.className}-${index}`}
          className={haze.className}
          d={haze.d}
          fill="none"
          stroke={haze.stroke}
          strokeWidth={haze.strokeWidth}
          strokeLinecap="round"
        />
      ))}

      <g className="featured-stars">
        {stars
          .filter((star) => star.featured)
          .map((star, index) => (
            <g key={`${star.x}-${star.y}-${index}`} className="featured-star">
              <circle
                className="featured-star__halo"
                cx={star.x}
                cy={star.y}
                r={star.haloRadius}
                fill="url(#starSoftGlow)"
                style={
                  {
                    "--star-base-opacity": (star.opacity * 0.68).toString()
                  } as CSSProperties
                }
              />
              <path
                className="featured-star__sparkle"
                d={`M${formatCoordinate(star.x - star.sparkleSize)} ${formatCoordinate(star.y)} L${formatCoordinate(
                  star.x + star.sparkleSize
                )} ${formatCoordinate(star.y)} M${formatCoordinate(star.x)} ${formatCoordinate(
                  star.y - star.sparkleSize
                )} L${formatCoordinate(star.x)} ${formatCoordinate(star.y + star.sparkleSize)}`}
                stroke={star.color}
                style={
                  {
                    "--star-base-opacity": (star.opacity * 0.72).toString()
                  } as CSSProperties
                }
              />
            </g>
          ))}
      </g>

      <g className="star-field__dust-field">
        {dust.map((speck, index) => (
          <circle
            key={index}
            className="star-field__dust"
            cx={speck.x}
            cy={speck.y}
            r={speck.radius}
            fill={speck.color}
            style={
              {
                "--star-base-opacity": speck.opacity.toString()
              } as CSSProperties
            }
          />
        ))}
      </g>

      <g>
        {layers.map((layer) => (
          <g className={`star-field__layer star-field__layer--${layer}`} key={layer}>
            {stars
              .filter((star) => star.layer === layer)
              .map((star, index) => (
                <circle
                  key={`${layer}-${index}`}
                  className="star-field__star"
                  cx={star.x}
                  cy={star.y}
                  r={star.radius}
                  fill={star.color}
                  style={
                    {
                      "--star-base-opacity": star.opacity.toString()
                    } as CSSProperties
                  }
                />
              ))}
          </g>
        ))}
      </g>

      <g className="star-field__foreground">
        <path
          className="star-field__distant-clouds"
          d="M-5 82 C7 72 20 75 31 67 C47 55 60 68 76 58 C90 50 98 48 108 41 L108 100 L-5 100 Z"
        />
        <path
          className="star-field__mountains star-field__mountains--back"
          d="M-4 91 L6 82 L15 89 L24 74 L31 90 L42 81 L52 93 L64 80 L72 91 L84 66 L96 86 L106 74 L106 100 L-4 100 Z"
        />
        <path
          className="star-field__mountains star-field__mountains--front"
          d="M-4 96 L8 88 L19 95 L31 84 L43 94 L56 87 L66 96 L76 83 L88 90 L99 82 L106 89 L106 100 L-4 100 Z"
        />
        <path
          className="star-field__tree star-field__tree--left-small"
          d="M1 100 C0.5 90 0.7 80 2.1 70 C3.2 78 4 88 3.4 100 Z"
        />
        <path
          className="star-field__tree star-field__tree--left-main"
          d="M11 100 C9.1 85 9.3 66 12.8 49 C16.9 66 18.2 84 16.4 100 Z"
        />
        <path
          className="star-field__tree star-field__tree--left-second"
          d="M18 100 C17.1 89 17.5 78 20 68 C22.9 80 23.8 91 22.4 100 Z"
        />
        <path
          className="star-field__tree star-field__tree--right"
          d="M96 100 C95.2 91 95.6 82 97.8 73 C100.5 84 101.1 93 99.9 100 Z"
        />
      </g>
      <rect width="100" height="100" fill="url(#horizonShade)" />
    </svg>
  );
}
