import { useState } from "react";
import { downloadLunarCalendar, type CalendarReminderMode } from "../calendar/lunarCalendar";

type CalendarState = "idle" | "ready" | "error";

const OPTIONS: ReadonlyArray<{ label: string; mode: CalendarReminderMode }> = [
  { label: "Полдень", mode: "young-crescent-noon" },
  { label: "Вечер", mode: "young-crescent-evening" }
];

function getMessage(state: CalendarState, mode: CalendarReminderMode): string {
  if (state === "ready") {
    return "Открой .ics и добавь в календарь.";
  }

  if (state === "error") {
    return "Не получилось создать файл.";
  }

  return mode === "young-crescent-evening"
    ? "Напомнит вечером, когда искать молодой месяц."
    : "Напомнит днем, чтобы не забыть про вечер.";
}

export function CalendarPrompt() {
  const [state, setState] = useState<CalendarState>("idle");
  const [mode, setMode] = useState<CalendarReminderMode>("young-crescent-noon");

  function handleClick(): void {
    try {
      downloadLunarCalendar(mode);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  function handleModeChange(nextMode: CalendarReminderMode): void {
    setMode(nextMode);
    setState("idle");
  }

  return (
    <section className={`calendar-prompt calendar-prompt--${state}`} aria-label="Настройка календаря">
      <div className="calendar-prompt__mode" role="group" aria-label="Когда напоминать">
        {OPTIONS.map((option) => (
          <button
            className={option.mode === mode ? "calendar-prompt__mode-button is-active" : "calendar-prompt__mode-button"}
            key={option.mode}
            onClick={() => handleModeChange(option.mode)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <button className="calendar-prompt__download" onClick={handleClick} type="button">
        <span className="calendar-prompt__copy">
          <span className="calendar-prompt__title">Добавить в календарь</span>
          <span className="calendar-prompt__message">{getMessage(state, mode)}</span>
        </span>
        <span className="calendar-prompt__badge">ICS</span>
      </button>
    </section>
  );
}
