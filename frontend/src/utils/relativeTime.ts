/** Relative time for review timestamps (vi / ja UI locales). */
export function formatRelativeTime(iso: string, lang: "ja" | "vi"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const locale = lang === "ja" ? "ja" : "vi";
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const now = Date.now();
    const diffSec = Math.round((date.getTime() - now) / 1000);
    const abs = Math.abs(diffSec);

    if (abs < 60) return rtf.format(diffSec, "second");

    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");

    const diffHour = Math.round(diffSec / 3600);
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");

    const diffDay = Math.round(diffSec / 86400);
    if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");

    const diffWeek = Math.round(diffSec / 604800);
    if (Math.abs(diffWeek) < 5) return rtf.format(diffWeek, "week");

    const diffMonth = Math.round(diffSec / 2592000);
    if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");

    return rtf.format(Math.round(diffSec / 31536000), "year");
  } catch {
    return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  }
}
