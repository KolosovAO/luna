import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg";
import { createSkyPattern, formatSkyCoordinate } from "./skyPattern";

const layers = ["far", "mid", "near"] as const;

export function StarField() {
  const { clusters, clouds, dust, hazes, stars } = useMemo(() => createSkyPattern(), []);

  return (
    <Svg style={styles.sky} viewBox="0 0 100 100" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="skyDepth" cx="50%" cy="34%" r="86%">
          <Stop offset="0%" stopColor="#243e66" />
          <Stop offset="34%" stopColor="#10213d" />
          <Stop offset="68%" stopColor="#060c19" />
          <Stop offset="100%" stopColor="#030711" />
        </RadialGradient>
        <LinearGradient id="cloudBlue" x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor="#d8e8ff" stopOpacity="0.18" />
          <Stop offset="34%" stopColor="#6aa7ff" stopOpacity="0.42" />
          <Stop offset="70%" stopColor="#1d5fb4" stopOpacity="0.26" />
          <Stop offset="100%" stopColor="#9ed7ff" stopOpacity="0.16" />
        </LinearGradient>
        <LinearGradient id="milkyDust" x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor="#a7c8ff" stopOpacity="0.18" />
          <Stop offset="46%" stopColor="#fff4c4" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#75b8ff" stopOpacity="0.14" />
        </LinearGradient>
        <LinearGradient id="violetCloud" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#7ec8ff" stopOpacity="0.12" />
          <Stop offset="45%" stopColor="#b798ff" stopOpacity="0.32" />
          <Stop offset="100%" stopColor="#ffdca8" stopOpacity="0.16" />
        </LinearGradient>
        <LinearGradient id="tealCloud" x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor="#3766d7" stopOpacity="0.16" />
          <Stop offset="50%" stopColor="#92e6ff" stopOpacity="0.28" />
          <Stop offset="100%" stopColor="#dfeaff" stopOpacity="0.12" />
        </LinearGradient>
        <LinearGradient id="frostCloud" x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor="#b7d8ff" stopOpacity="0.1" />
          <Stop offset="45%" stopColor="#79bfff" stopOpacity="0.36" />
          <Stop offset="100%" stopColor="#e8f4ff" stopOpacity="0.18" />
        </LinearGradient>
        <LinearGradient id="brightNebula" x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor="#6ca7ff" stopOpacity="0.18" />
          <Stop offset="45%" stopColor="#fff2bb" stopOpacity="0.44" />
          <Stop offset="100%" stopColor="#75c9ff" stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="electricCloud" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#4d86ff" stopOpacity="0.12" />
          <Stop offset="55%" stopColor="#9fe7ff" stopOpacity="0.46" />
          <Stop offset="100%" stopColor="#d5ecff" stopOpacity="0.12" />
        </LinearGradient>
        <RadialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fff8ce" stopOpacity="0.54" />
          <Stop offset="42%" stopColor="#88b9ff" stopOpacity="0.24" />
          <Stop offset="100%" stopColor="#335fa8" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="starSoftGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fff8d6" stopOpacity="0.42" />
          <Stop offset="45%" stopColor="#b7d8ff" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#6aa7ff" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="horizonShade" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor="#07101f" stopOpacity="0" />
          <Stop offset="100%" stopColor="#01030a" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      <Rect width="100" height="100" fill="url(#skyDepth)" />

      <G>
        {clouds.map((cloud, index) => (
          <Path
            key={`cloud-${index}`}
            d={cloud.d}
            fill="none"
            stroke={cloud.stroke}
            strokeWidth={cloud.strokeWidth}
            strokeLinecap="round"
            opacity={cloud.opacity}
          />
        ))}
      </G>

      <G>
        {clusters.map((cluster, index) => (
          <G key={`cluster-${index}`}>
            <Circle cx={cluster.x} cy={cluster.y} r={cluster.glowRadius} fill="url(#clusterGlow)" opacity={cluster.opacity} />
            <Circle cx={cluster.x} cy={cluster.y} r={cluster.coreRadius} fill="#fff8ce" opacity={0.9} />
            {cluster.particles.map((particle, particleIndex) => (
              <Circle
                key={`cluster-particle-${index}-${particleIndex}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                fill={particle.color}
                opacity={particle.opacity}
              />
            ))}
          </G>
        ))}
      </G>

      {hazes.map((haze, index) => (
        <Path
          key={`haze-${index}`}
          d={haze.d}
          fill="none"
          stroke={haze.stroke}
          strokeWidth={haze.strokeWidth}
          strokeLinecap="round"
          opacity={haze.opacity}
        />
      ))}

      <G>
        {stars
          .filter((star) => star.featured)
          .map((star, index) => (
            <G key={`featured-${index}`}>
              <Circle cx={star.x} cy={star.y} r={star.haloRadius} fill="url(#starSoftGlow)" opacity={star.opacity * 0.68} />
              <Path
                d={`M${formatSkyCoordinate(star.x - star.sparkleSize)} ${formatSkyCoordinate(
                  star.y
                )} L${formatSkyCoordinate(star.x + star.sparkleSize)} ${formatSkyCoordinate(star.y)} M${formatSkyCoordinate(
                  star.x
                )} ${formatSkyCoordinate(star.y - star.sparkleSize)} L${formatSkyCoordinate(star.x)} ${formatSkyCoordinate(
                  star.y + star.sparkleSize
                )}`}
                stroke={star.color}
                strokeWidth={0.08}
                strokeLinecap="round"
                opacity={star.opacity * 0.72}
              />
            </G>
          ))}
      </G>

      <G>
        {dust.map((speck, index) => (
          <Circle key={`dust-${index}`} cx={speck.x} cy={speck.y} r={speck.radius} fill={speck.color} opacity={speck.opacity} />
        ))}
      </G>

      <G>
        {layers.map((layer) => (
          <G key={layer}>
            {stars
              .filter((star) => star.layer === layer)
              .map((star, index) => (
                <Circle
                  key={`${layer}-${index}`}
                  cx={star.x}
                  cy={star.y}
                  r={star.radius}
                  fill={star.color}
                  opacity={star.opacity}
                />
              ))}
          </G>
        ))}
      </G>

      <G>
        <Path d="M-5 82 C7 72 20 75 31 67 C47 55 60 68 76 58 C90 50 98 48 108 41 L108 100 L-5 100 Z" fill="#122841" opacity={0.5} />
        <Path d="M-4 91 L6 82 L15 89 L24 74 L31 90 L42 81 L52 93 L64 80 L72 91 L84 66 L96 86 L106 74 L106 100 L-4 100 Z" fill="#071120" />
        <Path d="M-4 96 L8 88 L19 95 L31 84 L43 94 L56 87 L66 96 L76 83 L88 90 L99 82 L106 89 L106 100 L-4 100 Z" fill="#02050c" />
        <Path d="M1 100 C0.5 90 0.7 80 2.1 70 C3.2 78 4 88 3.4 100 Z" fill="#02050c" />
        <Path d="M11 100 C9.1 85 9.3 66 12.8 49 C16.9 66 18.2 84 16.4 100 Z" fill="#02050c" />
        <Path d="M18 100 C17.1 89 17.5 78 20 68 C22.9 80 23.8 91 22.4 100 Z" fill="#02050c" />
        <Path d="M96 100 C95.2 91 95.6 82 97.8 73 C100.5 84 101.1 93 99.9 100 Z" fill="#02050c" />
      </G>

      <Rect width="100" height="100" fill="url(#horizonShade)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  sky: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%"
  }
});
