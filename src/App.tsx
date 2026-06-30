import { useEffect, useMemo, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Countdown } from "./components/Countdown";
import { MoonPhase } from "./components/MoonPhase";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { StarField } from "./components/StarField";
import { getDisplayState } from "./lunar/display";
import { getCountdownParts, getLunarSnapshot, type CountdownParts, type TimeWindow } from "./lunar/lunarEngine";
import { ensurePwaMetadata } from "./pwa/metadata";

const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

function formatShortDateTime(date: Date): string {
  return shortDateFormatter.format(date);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
}

function formatCompactCountdown(countdown: CountdownParts): string {
  return `${countdown.days} д ${countdown.hours} ч ${countdown.minutes} м`;
}

function WindowTimes({ window }: { window?: TimeWindow }) {
  if (!window) {
    return null;
  }

  return (
    <View style={styles.windowTimes}>
      <View style={styles.windowTimeItem}>
        <Text style={styles.metaLabel}>Старт</Text>
        <Text style={styles.metaValue}>{formatShortDateTime(window.start)}</Text>
      </View>
      <View style={styles.windowTimeItem}>
        <Text style={styles.metaLabel}>Финиш</Text>
        <Text style={styles.metaValue}>{formatShortDateTime(window.end)}</Text>
      </View>
    </View>
  );
}

export function App() {
  const [now, setNow] = useState(() => new Date());
  const { height, width } = useWindowDimensions();
  const compact = height < 760 || width < 390;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    ensurePwaMetadata();
  }, []);

  const snapshot = useMemo(() => getLunarSnapshot(now), [now]);
  const display = useMemo(() => getDisplayState(snapshot), [snapshot]);
  const moneyWindowCountdown = useMemo(() => {
    const target = snapshot.youngCrescentMoneyWindow.active
      ? snapshot.youngCrescentMoneyWindow.end
      : snapshot.youngCrescentMoneyWindow.start;

    return getCountdownParts(now, target);
  }, [now, snapshot]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <StarField />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screen, compact && styles.screenCompact]}>
          <View style={[styles.moonSlot, compact && styles.moonSlotCompact]}>
            <MoonPhase
              illuminationFraction={snapshot.phase.illuminationFraction}
              isWaxing={snapshot.phase.isWaxing}
              label={snapshot.phase.label}
              size={compact ? 162 : 214}
            />
          </View>

          <View style={[styles.panel, display.mode === "money-window-active" && styles.panelActive]}>
            <Text style={styles.eyebrow}>{display.eyebrow}</Text>
            <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
              {display.title}
            </Text>
            <Countdown label={display.countdownLabel} countdown={display.countdown} compact={compact} />
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoPanel}>
              <Text style={styles.infoLabel}>Сейчас</Text>
              <Text style={styles.infoTitle} numberOfLines={1}>
                {snapshot.phase.label}
              </Text>
              <Text style={styles.infoText}>
                {snapshot.phase.isWaxing ? "растет" : "убывает"} · {formatPercent(snapshot.phase.illuminationFraction)}
              </Text>
            </View>

            <View style={[styles.infoPanel, styles.infoPanelAccent]}>
              <Text style={styles.infoLabel}>Окно</Text>
              <Text style={styles.infoTitle} numberOfLines={1}>
                {display.primaryWindow?.label ?? snapshot.nextEvent.label}
              </Text>
              <WindowTimes window={display.primaryWindow} />
              {!display.primaryWindow ? <Text style={styles.infoText}>{formatShortDateTime(snapshot.nextEvent.at)}</Text> : null}
            </View>

            <View style={styles.infoPanel}>
              <Text style={styles.infoLabel}>Серп</Text>
              <Text style={styles.infoTitle} numberOfLines={1}>
                {snapshot.youngCrescentMoneyWindow.active
                  ? formatCompactCountdown(moneyWindowCountdown)
                  : `через ${formatCompactCountdown(moneyWindowCountdown)}`}
              </Text>
              <Text style={styles.infoText}>
                {formatShortDateTime(snapshot.youngCrescentMoneyWindow.start)} -{" "}
                {formatShortDateTime(snapshot.youngCrescentMoneyWindow.end)}
              </Text>
            </View>

            {Platform.OS === "web" ? <NotificationPrompt compact={compact} /> : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: "#b9d5ff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  infoGrid: {
    gap: 8,
    width: "100%"
  },
  infoLabel: {
    color: "#9db9df",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  infoPanel: {
    backgroundColor: "rgba(7, 14, 28, 0.58)",
    borderColor: "rgba(180, 214, 255, 0.17)",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  infoPanelAccent: {
    backgroundColor: "rgba(25, 47, 82, 0.56)",
    borderColor: "rgba(210, 232, 255, 0.25)"
  },
  infoText: {
    color: "#b5c9e4",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0
  },
  infoTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0
  },
  metaLabel: {
    color: "#91acd0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  metaValue: {
    color: "#d8e8ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  moonSlot: {
    alignItems: "flex-end",
    marginRight: -18,
    marginTop: -8,
    width: "100%"
  },
  moonSlotCompact: {
    marginRight: -12,
    marginTop: -14
  },
  panel: {
    backgroundColor: "rgba(5, 10, 20, 0.54)",
    borderColor: "rgba(212, 232, 255, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    width: "100%"
  },
  panelActive: {
    backgroundColor: "rgba(22, 34, 55, 0.66)",
    borderColor: "rgba(255, 239, 178, 0.32)"
  },
  root: {
    backgroundColor: "#02040a",
    flex: 1,
    overflow: "hidden"
  },
  safeArea: {
    flex: 1
  },
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 10
  },
  screenCompact: {
    paddingBottom: 12,
    paddingHorizontal: 14,
    paddingTop: 4
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 42
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 34
  },
  windowTimeItem: {
    flex: 1,
    gap: 2
  },
  windowTimes: {
    flexDirection: "row",
    gap: 10
  }
});
