import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getInitialPushState,
  registerForLunarPush,
  type PushRegistrationState
} from "../pwa/webPush";

const INITIAL_STATE: PushRegistrationState = {
  status: "checking",
  message: "Проверяю уведомления..."
};

function getButtonTitle(state: PushRegistrationState): string {
  if (state.status === "enabled") {
    return "Уведомления включены";
  }

  if (state.status === "registering") {
    return "Включаю...";
  }

  return "Напомнить в 12:00";
}

function isDisabled(state: PushRegistrationState): boolean {
  return (
    state.status === "checking" ||
    state.status === "registering" ||
    state.status === "enabled" ||
    state.status === "unsupported" ||
    state.status === "not-configured"
  );
}

export function NotificationPrompt({ compact }: { compact?: boolean }) {
  const [state, setState] = useState<PushRegistrationState>(INITIAL_STATE);

  useEffect(() => {
    let mounted = true;

    void getInitialPushState().then((nextState) => {
      if (mounted) {
        setState(nextState);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handlePress(): Promise<void> {
    setState({
      status: "registering",
      message: "Открой системный запрос и разреши уведомления."
    });

    setState(await registerForLunarPush());
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled(state)}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        state.status === "enabled" && styles.containerEnabled,
        isDisabled(state) && state.status !== "enabled" && styles.containerDisabled,
        pressed && styles.containerPressed,
        compact && styles.containerCompact
      ]}
    >
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {getButtonTitle(state)}
        </Text>
        <Text style={styles.message} numberOfLines={compact ? 1 : 2}>
          {state.message}
        </Text>
      </View>
      <View style={[styles.badge, state.status === "enabled" && styles.badgeEnabled]}>
        <Text style={styles.badgeText}>{state.status === "enabled" ? "ON" : "12"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: "rgba(170, 207, 255, 0.16)",
    borderColor: "rgba(221, 238, 255, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 42
  },
  badgeEnabled: {
    backgroundColor: "rgba(255, 234, 165, 0.22)",
    borderColor: "rgba(255, 240, 188, 0.35)"
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  },
  container: {
    alignItems: "center",
    backgroundColor: "rgba(9, 18, 35, 0.68)",
    borderColor: "rgba(210, 232, 255, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: "100%"
  },
  containerCompact: {
    paddingVertical: 9
  },
  containerDisabled: {
    opacity: 0.72
  },
  containerEnabled: {
    backgroundColor: "rgba(30, 45, 68, 0.68)",
    borderColor: "rgba(255, 238, 180, 0.3)"
  },
  containerPressed: {
    transform: [{ scale: 0.99 }]
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0
  },
  message: {
    color: "#a9c0dc",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0
  },
  title: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  }
});
