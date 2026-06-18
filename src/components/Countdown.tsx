import type { CountdownParts } from "../lunar/lunarEngine";

interface CountdownProps {
  label: string;
  countdown: CountdownParts;
}

const units = [
  ["days", "дн"],
  ["hours", "ч"],
  ["minutes", "м"],
  ["seconds", "с"]
] as const;

export function Countdown({ label, countdown }: CountdownProps) {
  return (
    <section className="countdown" aria-label={label}>
      <p className="countdown__label">{label}</p>
      <div className="countdown__grid">
        {units.map(([key, unit]) => (
          <span className="countdown__unit" key={key}>
            <strong>{String(countdown[key]).padStart(2, "0")}</strong>
            <span>{unit}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
