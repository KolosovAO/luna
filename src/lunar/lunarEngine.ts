const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Deterministic approximation based on a known astronomical new moon.
// It is intentionally centralized so a more precise astronomy library can replace it later.
export const SYNODIC_MONTH_DAYS = 29.530588853;
export const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * DAY_MS;
export const KNOWN_NEW_MOON_UTC_MS = Date.parse("2000-01-06T18:14:00.000Z");

export type LunarPhaseId =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export type LunarEventId = "new-moon" | "first-quarter" | "full-moon" | "last-quarter";

export interface LunarPhase {
  id: LunarPhaseId;
  label: string;
  ageDays: number;
  cycleFraction: number;
  illuminationFraction: number;
  isWaxing: boolean;
  normallyVisible: boolean;
}

export interface LunarEvent {
  id: LunarEventId;
  label: string;
  at: Date;
}

export interface TimeWindow {
  id: "astrological-new-moon" | "young-crescent-money";
  label: string;
  start: Date;
  peak?: Date;
  end: Date;
  active: boolean;
  upcoming: boolean;
}

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface LunarSnapshot {
  calculatedAt: Date;
  phase: LunarPhase;
  previousNewMoon: Date;
  nextNewMoon: Date;
  nextEvent: LunarEvent;
  astrologicalNewMoonWindow: TimeWindow;
  youngCrescentMoneyWindow: TimeWindow;
}

const MAJOR_EVENT_OFFSETS: ReadonlyArray<{ id: LunarEventId; label: string; fraction: number }> = [
  { id: "new-moon", label: "Новолуние", fraction: 0 },
  { id: "first-quarter", label: "Первая четверть", fraction: 0.25 },
  { id: "full-moon", label: "Полнолуние", fraction: 0.5 },
  { id: "last-quarter", label: "Последняя четверть", fraction: 0.75 }
];

const PHASE_LABELS: Record<LunarPhaseId, string> = {
  "new-moon": "Новолуние",
  "waxing-crescent": "Растущий серп",
  "first-quarter": "Первая четверть",
  "waxing-gibbous": "Растущая Луна",
  "full-moon": "Полнолуние",
  "waning-gibbous": "Убывающая Луна",
  "last-quarter": "Последняя четверть",
  "waning-crescent": "Старый серп"
};

function positiveModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

function getCycleIndex(date: Date): number {
  return Math.floor((date.getTime() - KNOWN_NEW_MOON_UTC_MS) / SYNODIC_MONTH_MS);
}

function getNewMoonAtCycle(cycleIndex: number): Date {
  return new Date(KNOWN_NEW_MOON_UTC_MS + cycleIndex * SYNODIC_MONTH_MS);
}

function getPhaseId(ageDays: number): LunarPhaseId {
  const quarter = SYNODIC_MONTH_DAYS / 4;
  const toleranceDays = 0.7;

  if (ageDays < 1 || SYNODIC_MONTH_DAYS - ageDays < 1) {
    return "new-moon";
  }

  if (Math.abs(ageDays - quarter) <= toleranceDays) {
    return "first-quarter";
  }

  if (Math.abs(ageDays - quarter * 2) <= toleranceDays) {
    return "full-moon";
  }

  if (Math.abs(ageDays - quarter * 3) <= toleranceDays) {
    return "last-quarter";
  }

  if (ageDays < quarter) {
    return "waxing-crescent";
  }

  if (ageDays < quarter * 2) {
    return "waxing-gibbous";
  }

  if (ageDays < quarter * 3) {
    return "waning-gibbous";
  }

  return "waning-crescent";
}

export function getLunarPhase(date: Date): LunarPhase {
  const elapsedMs = date.getTime() - KNOWN_NEW_MOON_UTC_MS;
  const cycleMs = positiveModulo(elapsedMs, SYNODIC_MONTH_MS);
  const cycleFraction = cycleMs / SYNODIC_MONTH_MS;
  const ageDays = cycleFraction * SYNODIC_MONTH_DAYS;
  const illuminationFraction = (1 - Math.cos(2 * Math.PI * cycleFraction)) / 2;
  const id = getPhaseId(ageDays);
  const normallyVisible = id !== "new-moon" && illuminationFraction > 0.02;

  return {
    id,
    label: PHASE_LABELS[id],
    ageDays,
    cycleFraction,
    illuminationFraction,
    isWaxing: cycleFraction < 0.5,
    normallyVisible
  };
}

export function getNewMoonBounds(date: Date): { previousNewMoon: Date; nextNewMoon: Date } {
  const cycleIndex = getCycleIndex(date);
  const previous = getNewMoonAtCycle(cycleIndex);

  if (previous.getTime() > date.getTime()) {
    return {
      previousNewMoon: getNewMoonAtCycle(cycleIndex - 1),
      nextNewMoon: previous
    };
  }

  return {
    previousNewMoon: previous,
    nextNewMoon: getNewMoonAtCycle(cycleIndex + 1)
  };
}

function makeAstrologicalNewMoonWindow(now: Date, previousNewMoon: Date, nextNewMoon: Date): TimeWindow {
  const candidates = [previousNewMoon, nextNewMoon];
  const activeCenter = candidates.find((center) => {
    const start = center.getTime() - DAY_MS;
    const end = center.getTime() + DAY_MS;
    return now.getTime() >= start && now.getTime() <= end;
  });
  const center = activeCenter ?? nextNewMoon;
  const start = new Date(center.getTime() - DAY_MS);
  const end = new Date(center.getTime() + DAY_MS);

  return {
    id: "astrological-new-moon",
    label: "Окно новолуния",
    start,
    peak: center,
    end,
    active: now.getTime() >= start.getTime() && now.getTime() <= end.getTime(),
    upcoming: now.getTime() < start.getTime()
  };
}

function makeYoungCrescentMoneyWindow(now: Date, previousNewMoon: Date, nextNewMoon: Date): TimeWindow {
  const previousEnd = previousNewMoon.getTime() + 3 * DAY_MS;
  const center = now.getTime() <= previousEnd ? previousNewMoon : nextNewMoon;
  const start = new Date(center.getTime() + DAY_MS);
  const end = new Date(center.getTime() + 3 * DAY_MS);

  return {
    id: "young-crescent-money",
    label: "Окно молодого серпа",
    start,
    peak: center,
    end,
    active: now.getTime() >= start.getTime() && now.getTime() <= end.getTime(),
    upcoming: now.getTime() < start.getTime()
  };
}

export function getNextMajorEvent(date: Date): LunarEvent {
  const { previousNewMoon } = getNewMoonBounds(date);
  const epsilonMs = 1000;
  const currentCycleEvents = MAJOR_EVENT_OFFSETS.map((event) => ({
    ...event,
    at: new Date(previousNewMoon.getTime() + event.fraction * SYNODIC_MONTH_MS)
  }));
  const nextCycleNewMoon = new Date(previousNewMoon.getTime() + SYNODIC_MONTH_MS);
  const upcomingEvents = [
    ...currentCycleEvents,
    { id: "new-moon" as const, label: "Новолуние", at: nextCycleNewMoon }
  ]
    .filter((event) => event.at.getTime() > date.getTime() + epsilonMs)
    .sort((left, right) => left.at.getTime() - right.at.getTime());

  const next = upcomingEvents[0];

  return {
    id: next.id,
    label: next.label,
    at: next.at
  };
}

export function getCountdownParts(from: Date, to: Date): CountdownParts {
  const totalMs = Math.max(0, to.getTime() - from.getTime());
  const days = Math.floor(totalMs / DAY_MS);
  const hours = Math.floor((totalMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((totalMs % HOUR_MS) / (60 * 1000));
  const seconds = Math.floor((totalMs % (60 * 1000)) / 1000);

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds
  };
}

export function getLunarSnapshot(date = new Date()): LunarSnapshot {
  const { previousNewMoon, nextNewMoon } = getNewMoonBounds(date);

  return {
    calculatedAt: date,
    phase: getLunarPhase(date),
    previousNewMoon,
    nextNewMoon,
    nextEvent: getNextMajorEvent(date),
    astrologicalNewMoonWindow: makeAstrologicalNewMoonWindow(date, previousNewMoon, nextNewMoon),
    youngCrescentMoneyWindow: makeYoungCrescentMoneyWindow(date, previousNewMoon, nextNewMoon)
  };
}
