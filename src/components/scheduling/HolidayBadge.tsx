import { HolidayCalendar } from "../../types/scheduling";

interface HolidayBadgeProps {
  holidays: HolidayCalendar[];
  compact?: boolean;
}

const typeLabels: Record<string, string> = {
  national: "Nasional",
  company: "Perusahaan",
  location: "Lokasi",
};

export default function HolidayBadge({ holidays, compact = false }: HolidayBadgeProps) {
  if (holidays.length === 0) {
    return null;
  }

  const primaryHoliday = holidays[0];
  const label = holidays.length > 1 ? `${holidays.length} libur` : typeLabels[primaryHoliday.type] || "Libur";
  const title = holidays.map((holiday) => holiday.name).join(", ");

  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center justify-center rounded border border-rose-200 bg-rose-50 font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 ${
        compact ? "px-1 py-0.5 text-[8px]" : "px-1.5 py-0.5 text-[9px]"
      }`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
