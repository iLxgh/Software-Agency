"use client";

import { useState } from "react";
import { cx } from "./icon-glyph-styles";

/** Días visibles del mes (3 semanas). */
const days = [
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
];

const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

/** Días con punto de "hay hueco". */
const MARKED = ["14", "21"];
/** Días apagados (fuera de agenda). */
const MUTED = ["7", "13", "20", "27"];

type CalendarProps = {
  month?: string;
  /** Día preseleccionado. */
  defaultSelected?: string;
  variant?: "default" | "dark";
  className?: string;
};

/**
 * Calendario decorativo de la tarjeta de agenda. No consulta disponibilidad
 * real: los días marcados son fijos, y la selección es local.
 */
export function Calendar({
  month = "Septiembre 2026",
  defaultSelected = "18",
  variant = "default",
  className,
}: CalendarProps) {
  const isDark = variant === "dark";
  const [selected, setSelected] = useState(defaultSelected);

  const border = isDark ? "border-white/15" : "border-foreground/15";

  return (
    <div
      className={cx(
        "w-full overflow-hidden rounded-xl border",
        border,
        isDark
          ? "bg-foreground text-background"
          : "bg-background text-foreground",
        className,
      )}
    >
      <div
        className={cx(
          "flex items-center justify-between border-b px-4 py-3",
          "text-[10px] font-bold uppercase tracking-[0.12em]",
          border,
        )}
      >
        <span>{month}</span>

        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="size-1.5 rounded-full bg-brand" />
        </span>
      </div>

      <div
        className={cx(
          "grid grid-cols-7 px-2.5 pt-3 pb-2 text-center text-[10px] font-bold",
          isDark ? "text-background/40" : "text-foreground/35",
        )}
        aria-hidden="true"
      >
        {weekdays.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-2 px-2.5 pt-2 pb-4">
        {days.map((day) => {
          const isSelected = day === selected;
          const isMarked = MARKED.includes(day);
          const isMuted = MUTED.includes(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(day)}
              aria-label={`${month.split(" ")[0]} ${day}`}
              aria-pressed={isSelected}
              className={cx(
                "relative grid size-[38px] place-items-center justify-self-center",
                "rounded-full text-[15px] font-bold transition-colors",
                "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none",
                isSelected
                  ? "bg-brand text-white"
                  : cx(
                      isMuted
                        ? isDark
                          ? "text-background/40"
                          : "text-foreground/35"
                        : isDark
                          ? "text-background"
                          : "text-foreground",
                      isDark ? "hover:bg-white/10" : "hover:bg-brand/10",
                    ),
              )}
            >
              {day}

              {isMarked && !isSelected && (
                <span
                  className="absolute right-0 bottom-0 size-1.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
