import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { getIlluminatedPath, getMoonVisualMetrics } from "./moonMath";

interface MoonPhaseProps {
  illuminationFraction: number;
  isWaxing: boolean;
  label: string;
  size?: number;
}

export const MoonPhase = memo(function MoonPhase({
  illuminationFraction,
  isWaxing,
  label,
  size = 220
}: MoonPhaseProps) {
  const path = getIlluminatedPath(illuminationFraction, isWaxing);
  const metrics = getMoonVisualMetrics(illuminationFraction);

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel={`Текущая фаза Луны: ${label}`}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <RadialGradient id="moonLight" cx="40%" cy="38%" r="62%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="54%" stopColor="#dce9ff" />
            <Stop offset="100%" stopColor="#91a7ca" />
          </RadialGradient>
          <RadialGradient id="moonAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#f4f8ff" stopOpacity="0.38" />
            <Stop offset="56%" stopColor="#8bbfff" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#5d8dff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx="120" cy="120" r="112" fill="url(#moonAura)" opacity={metrics.auraOpacity} />
        <Circle cx="120" cy="120" r="92" fill="#090d17" opacity="0.92" />
        <Circle cx="120" cy="120" r="92" fill="#5e7faa" opacity={metrics.earthshineOpacity} />
        <Circle cx="94" cy="82" r="9" fill="#dce9ff" opacity={metrics.textureOpacity} />
        <Circle cx="146" cy="127" r="15" fill="#dce9ff" opacity={metrics.textureOpacity * 0.82} />
        <Circle cx="88" cy="151" r="12" fill="#dce9ff" opacity={metrics.textureOpacity * 0.72} />
        {path ? <Path d={path} fill="url(#moonLight)" opacity="0.98" /> : null}
      </Svg>
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  caption: {
    color: "#dce9ff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0,
    marginTop: -10,
    textAlign: "center"
  },
  container: {
    alignItems: "center",
    justifyContent: "center"
  }
});
