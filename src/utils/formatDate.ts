/**
 * Formats a date string or object into a human-readable format.
 * Defaults to 'MMM dd, HH:mm' pattern (e.g., Oct 24, 14:22)
 */
export const formatDate = (
  date: string | Date | null | undefined, 
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  locale: string = "en-US"
): string => {
  if (!date) return "N/A";
  
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};

/**
 * Specifically formats date for recent transactions requirement (MMM dd, HH:mm)
 */
export const formatTransactionDate = (date: string | Date): string => {
  return formatDate(date, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
/**
 * Formats a Date object to YYYY-MM-DD string using local time.
 * This avoids timezone shift issues caused by toISOString().
 */
export const formatDateToYYYYMMDD = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date/datetime string or Date object into human-readable Indonesian format
 * Example: '2026-08-25T11:58' -> '25 Agu 2026 11:58'
 * Example: '2026-08-25' -> '25 Agu 2026'
 */
export const formatDateTimeDisplay = (
  date: string | Date | null | undefined,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);

    // If date string contains time (like 'T' or ':')
    const hasTime = typeof date === "string" ? date.includes("T") || date.includes(":") : true;

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(hasTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        : {}),
    };

    return new Intl.DateTimeFormat("id-ID", options).format(d).replace(/\./g, ":");
  } catch {
    return String(date);
  }
};
