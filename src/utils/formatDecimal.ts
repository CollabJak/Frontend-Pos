export const formatDecimal = (value?: string | number | null): string => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return String(value);
  }

  const parsed = Number(value.trim());
  if (Number.isNaN(parsed)) {
    return value;
  }

  return String(parsed);
};
