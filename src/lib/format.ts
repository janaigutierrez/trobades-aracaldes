const TZ = "Europe/Madrid";

export function dataLlarga(iso: string) {
  return new Intl.DateTimeFormat("ca-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ,
  }).format(new Date(iso));
}

export function hora(iso: string) {
  return new Intl.DateTimeFormat("ca-ES", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function dataCurta(iso: string) {
  return new Intl.DateTimeFormat("ca-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ,
  }).format(new Date(iso));
}

export function diaMes(iso: string) {
  const d = new Date(iso);
  return {
    dia: new Intl.DateTimeFormat("ca-ES", { day: "numeric", timeZone: TZ }).format(d),
    mes: new Intl.DateTimeFormat("ca-ES", { month: "short", timeZone: TZ }).format(d).replace(".", ""),
  };
}

/** Desplaçament (minuts) de Europe/Madrid respecte UTC en un instant donat. */
function offsetMinuts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const v = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUTC = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return (asUTC - date.getTime()) / 60000;
}

/** "2026-12-14T18:15" (hora de Caldes) -> ISO UTC */
export function localAISO(local: string): string {
  const [d, t] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, day, h, min);
  const off = offsetMinuts(new Date(guess));
  let ts = guess - off * 60000;
  const off2 = offsetMinuts(new Date(ts));
  if (off2 !== off) ts = guess - off2 * 60000;
  return new Date(ts).toISOString();
}

/** ISO UTC -> valor per a <input type="datetime-local"> en hora de Caldes */
export function isoALocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const local = new Date(date.getTime() + offsetMinuts(date) * 60000);
  return local.toISOString().slice(0, 16);
}

/** Converteix un enllaç de YouTube a URL d'inserció. */
export function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) return url;
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const live = u.pathname.match(/^\/live\/([\w-]+)/);
      if (live) return `https://www.youtube.com/embed/${live[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}
