export interface MoonVisualMetrics {
  auraOpacity: number;
  earthshineOpacity: number;
  textureOpacity: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getIlluminatedPath(illuminationFraction: number, isWaxing: boolean): string {
  const fraction = clamp(illuminationFraction, 0, 1);
  const side = isWaxing ? 1 : -1;
  const center = 120;
  const radius = 92;

  if (fraction <= 0.02) {
    return "";
  }

  if (fraction >= 0.98) {
    return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${
      center + radius
    } A ${radius} ${radius} 0 1 1 ${center} ${center - radius} Z`;
  }

  const arcSweep = isWaxing ? 1 : 0;
  const terminatorControlX =
    fraction <= 0.5
      ? center + side * radius * (1 - 2 * fraction)
      : center - side * radius * (2 * fraction - 1);

  return [
    `M ${center} ${center - radius}`,
    `A ${radius} ${radius} 0 0 ${arcSweep} ${center} ${center + radius}`,
    `Q ${terminatorControlX} ${center} ${center} ${center - radius}`,
    "Z"
  ].join(" ");
}

export function getMoonVisualMetrics(illuminationFraction: number): MoonVisualMetrics {
  const fraction = clamp(illuminationFraction, 0, 1);

  return {
    auraOpacity: 0.1 + fraction * 0.32,
    earthshineOpacity: 0.035 + fraction * 0.24,
    textureOpacity: 0.012 + fraction * 0.14
  };
}
