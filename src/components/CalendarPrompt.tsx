import { useState } from "react";
import { downloadYoungCrescentCalendar } from "../calendar/lunarCalendar";

type CalendarState = "idle" | "ready" | "error";

function getMessage(state: CalendarState): string {
  if (state === "ready") {
    return "Открой .ics и добавь в календарь.";
  }

  if (state === "error") {
    return "Не получилось создать файл.";
  }

  return "18 месяцев, без серверов.";
}

export function CalendarPrompt() {
  const [state, setState] = useState<CalendarState>("idle");

  function handleClick(): void {
    try {
      downloadYoungCrescentCalendar();
      setState("ready");
    } catch {
      setState("error");
    }
  }

  return (
    <button className={`calendar-prompt calendar-prompt--${state}`} onClick={handleClick} type="button">
      <span className="calendar-prompt__copy">
        <span className="calendar-prompt__title">Календарь 12:00</span>
        <span className="calendar-prompt__message">{getMessage(state)}</span>
      </span>
      <span className="calendar-prompt__badge">ICS</span>
    </button>
  );
}
