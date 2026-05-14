"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { strings } from "@/i18n/page-strings";

const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown() {
  const locale = useLocale();
  const t = strings(locale);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const diff = TOURNAMENT_START.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: t.cd_d, value: timeLeft.days },
    { label: t.cd_h, value: timeLeft.hours },
    { label: t.cd_m, value: timeLeft.minutes },
    { label: t.cd_s, value: timeLeft.seconds },
  ];

  return (
    <div
      className="flex items-center gap-1 font-heading tabular-nums text-sm text-muted"
      aria-label="Countdown to World Cup 2026"
    >
      {units.map(({ label, value }, i) => (
        <span key={label}>
          <span className="text-fg font-bold">{pad(value)}</span>
          <span className="text-muted text-xs">{label}</span>
          {i < units.length - 1 && <span className="mx-0.5 text-line/30">:</span>}
        </span>
      ))}
    </div>
  );
}
