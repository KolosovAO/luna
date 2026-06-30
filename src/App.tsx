import { useEffect, useMemo, useState } from "react";
import { Countdown } from "./components/Countdown";
import { MoonPhase } from "./components/MoonPhase";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { StarField } from "./components/StarField";
import { getDisplayState } from "./lunar/display";
import { getCountdownParts, getLunarSnapshot, type CountdownParts, type TimeWindow } from "./lunar/lunarEngine";

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
    <dl className="window-times">
      <div>
        <dt>Старт</dt>
        <dd>{formatShortDateTime(window.start)}</dd>
      </div>
      <div>
        <dt>Финиш</dt>
        <dd>{formatShortDateTime(window.end)}</dd>
      </div>
    </dl>
  );
}

export function App() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
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
    <main className="app-shell">
      <StarField />
      <div className="app-shell__content">
        <section className={`hero hero--${display.mode}`}>
          <div className="hero__visual">
            <MoonPhase
              illuminationFraction={snapshot.phase.illuminationFraction}
              isWaxing={snapshot.phase.isWaxing}
              label={snapshot.phase.label}
            />
          </div>

          <div className="hero__details">
            <p className="eyebrow">{display.eyebrow}</p>
            <h1>{display.title}</h1>
            <Countdown label={display.countdownLabel} countdown={display.countdown} />

            <section className="info-grid" aria-label="Лунные данные">
              <article className="info-panel">
                <span className="info-panel__label">Сейчас</span>
                <h2>{snapshot.phase.label}</h2>
                <dl>
                  <div>
                    <dt>Луна</dt>
                    <dd>{snapshot.phase.isWaxing ? "растет" : "убывает"}</dd>
                  </div>
                  <div>
                    <dt>Свет</dt>
                    <dd>{formatPercent(snapshot.phase.illuminationFraction)}</dd>
                  </div>
                  <div>
                    <dt>Видно</dt>
                    <dd>{snapshot.phase.normallyVisible ? "да" : "нет"}</dd>
                  </div>
                </dl>
              </article>

              <article className="info-panel info-panel--accent">
                <span className="info-panel__label">Окно</span>
                <h2>{display.primaryWindow?.label ?? snapshot.nextEvent.label}</h2>
                <WindowTimes window={display.primaryWindow} />
                {!display.primaryWindow ? (
                  <p className="info-panel__text">{formatShortDateTime(snapshot.nextEvent.at)}</p>
                ) : null}
              </article>

              <article className="info-panel">
                <span className="info-panel__label">Серп</span>
                <h2>
                  {snapshot.youngCrescentMoneyWindow.active
                    ? formatCompactCountdown(moneyWindowCountdown)
                    : `через ${formatCompactCountdown(moneyWindowCountdown)}`}
                </h2>
                <p className="info-panel__text">
                  {formatShortDateTime(snapshot.youngCrescentMoneyWindow.start)} -{" "}
                  {formatShortDateTime(snapshot.youngCrescentMoneyWindow.end)}
                </p>
              </article>
            </section>

            <NotificationPrompt />
          </div>
        </section>
      </div>
    </main>
  );
}
