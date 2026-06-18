import type { CSSProperties } from "react";
import { useId } from "react";

interface MoonPhaseProps {
  illuminationFraction: number;
  isWaxing: boolean;
  label: string;
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

export function MoonPhase({ illuminationFraction, isWaxing, label }: MoonPhaseProps) {
  const gradientId = useId();
  const glowId = useId();
  const fraction = clamp(illuminationFraction, 0, 1);
  const path = getIlluminatedPath(fraction, isWaxing);
  const earthshineOpacity = 0.035 + fraction * 0.24;
  const textureOpacity = 0.012 + fraction * 0.14;
  const auraOpacity = 0.1 + fraction * 0.32;

  return (
    <figure
      className="moon-figure"
      aria-label={`Текущая фаза Луны: ${label}`}
      style={
        {
          "--moon-earthshine-opacity": earthshineOpacity.toString(),
          "--moon-texture-opacity": textureOpacity.toString(),
          "--moon-aura-opacity": auraOpacity.toString()
        } as CSSProperties
      }
    >
      <svg className="moon-figure__svg" viewBox="0 0 240 240" role="img">
        <defs>
          <radialGradient id={gradientId} cx="40%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#f9fbff" />
            <stop offset="54%" stopColor="#dce9ff" />
            <stop offset="100%" stopColor="#91a7ca" />
          </radialGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle className="moon-figure__aura" cx="120" cy="120" r="106" />
        <circle className="moon-figure__shadow" cx="120" cy="120" r="92" />
        <circle className="moon-figure__texture moon-figure__texture--one" cx="94" cy="82" r="9" />
        <circle className="moon-figure__texture moon-figure__texture--two" cx="146" cy="127" r="15" />
        <circle className="moon-figure__texture moon-figure__texture--three" cx="88" cy="151" r="12" />
        {path ? <path className="moon-figure__light" d={path} fill={`url(#${gradientId})`} filter={`url(#${glowId})`} /> : null}
      </svg>
      <figcaption className="moon-figure__caption">{label}</figcaption>
    </figure>
  );
}
