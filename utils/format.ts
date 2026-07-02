/** Format a date as "1 July 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format a date as "01/07/2026" (day/month/year). */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

/** Format a percentage to 2 decimal places, e.g. 76 -> "76.00%". */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Format a GPA to 2 decimal places, e.g. 3.7 -> "3.70". */
export function formatGPA(value: number): string {
  return value.toFixed(2);
}

/** Truncate long text with an ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/** Build a URLSearchParams string from a plain object, skipping empty values. */
export function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
