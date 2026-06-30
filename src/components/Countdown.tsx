import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CountdownParts } from "../lunar/lunarEngine";

interface CountdownProps {
  label: string;
  countdown: CountdownParts;
  compact?: boolean;
}

const units = [
  ["days", "дн"],
  ["hours", "ч"],
  ["minutes", "м"],
  ["seconds", "с"]
] as const;

export const Countdown = memo(function Countdown({ label, countdown, compact = false }: CountdownProps) {
  return (
    <View style={styles.container} accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.grid, compact && styles.gridCompact]}>
        {units.map(([key, unit]) => (
          <View style={[styles.unit, compact && styles.unitCompact]} key={key}>
            <Text style={[styles.value, compact && styles.valueCompact]}>{String(countdown[key]).padStart(2, "0")}</Text>
            <Text style={styles.unitLabel}>{unit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 10
  },
  grid: {
    flexDirection: "row",
    gap: 8
  },
  gridCompact: {
    gap: 6
  },
  label: {
    color: "#adc8f4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  unit: {
    alignItems: "center",
    backgroundColor: "rgba(10, 18, 34, 0.66)",
    borderColor: "rgba(185, 216, 255, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  unitCompact: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  unitLabel: {
    color: "#9db9df",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 2
  },
  value: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 30
  },
  valueCompact: {
    fontSize: 21,
    lineHeight: 25
  }
});
