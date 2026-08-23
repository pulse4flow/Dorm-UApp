"use client";

import { useEffect, useState } from "react";

function label(target: string) {
  const delta = new Date(target).getTime() - Date.now();
  if (delta <= 0) return "EXPIRED";
  const days = Math.floor(delta / 86400000);
  const hours = Math.floor((delta % 86400000) / 3600000);
  const minutes = Math.floor((delta % 3600000) / 60000);
  return `${days}D ${hours}H ${minutes}M`;
}

export function Countdown({ target }: { target: string }) {
  const [value, setValue] = useState(() => label(target));
  useEffect(() => {
    const timer = window.setInterval(() => setValue(label(target)), 60000);
    return () => window.clearInterval(timer);
  }, [target]);
  return <span className={value === "EXPIRED" ? "expired" : "countdown"}>{value === "EXPIRED" ? value : `⏳ ${value} left`}</span>;
}
