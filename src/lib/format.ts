// Small text formatters shared by the projector and phone screens.

/** "482913" → "482 913" */
export const formatPin = (pin: string) => pin.replace(/\D/g, "").replace(/^(\d{3})(\d{3})$/, "$1 $2");

/** Seconds as m:ss, e.g. 95 → "1:35". */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** 1 → "1st", 2 → "2nd", 11 → "11th" */
export function ordinal(n: number) {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}
