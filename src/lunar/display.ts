import {
  getCountdownParts,
  type CountdownParts,
  type LunarSnapshot,
  type TimeWindow
} from "./lunarEngine";

export type DisplayMode =
  | "money-window-active"
  | "new-moon-window-active"
  | "standard-countdown";

export interface DisplayState {
  mode: DisplayMode;
  eyebrow: string;
  title: string;
  countdownLabel: string;
  countdownTarget: Date;
  countdown: CountdownParts;
  primaryWindow?: TimeWindow;
}

export function getDisplayState(snapshot: LunarSnapshot): DisplayState {
  const now = snapshot.calculatedAt;
  const moneyWindow = snapshot.youngCrescentMoneyWindow;
  const newMoonWindow = snapshot.astrologicalNewMoonWindow;

  if (moneyWindow.active) {
    return {
      mode: "money-window-active",
      eyebrow: "Окно серпа",
      title: "Молодой месяц",
      countdownLabel: "До конца",
      countdownTarget: moneyWindow.end,
      countdown: getCountdownParts(now, moneyWindow.end),
      primaryWindow: moneyWindow
    };
  }

  if (newMoonWindow.active) {
    return {
      mode: "new-moon-window-active",
      eyebrow: "Новолуние",
      title: "Луну не видно",
      countdownLabel: "До конца окна",
      countdownTarget: newMoonWindow.end,
      countdown: getCountdownParts(now, newMoonWindow.end),
      primaryWindow: newMoonWindow
    };
  }

  return {
    mode: "standard-countdown",
    eyebrow: "Следующее событие",
    title: snapshot.nextEvent.label,
    countdownLabel: "Осталось",
    countdownTarget: snapshot.nextEvent.at,
    countdown: getCountdownParts(now, snapshot.nextEvent.at)
  };
}
