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
