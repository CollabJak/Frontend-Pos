import React from "react";
import { CalendarViewData, CalendarCell } from "../../types/scheduling";
import ScheduleCell from "./ScheduleCell";
import HolidayBadge from "./HolidayBadge";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";

interface ScheduleCalendarProps {
  month: string; // YYYY-MM
  data: CalendarViewData;
  onCellClick: (userId: number, date: string, cell?: CalendarCell) => void;
  isLoading?: boolean;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  month,
  data,
  onCellClick,
  isLoading,
}) => {
  const [year, monthIdx] = month.split("-").map(Number);
  
  // Generate days of the month
  const getDaysInMonth = (y: number, m: number) => {
    const d = new Date(y, m - 1, 1);
    const days = [];
    while (d.getMonth() === m - 1) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(year, monthIdx);

  const formatDayName = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date);
  };

  const formatDateKey = (date: Date) => {
    return formatDateToYYYYMMDD(date);
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse">
        <div className="h-64 bg-gray-50 dark:bg-gray-900/20" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50">
            <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-700 min-w-[200px]">
              Karyawan
            </th>
            {days.map((day) => {
              const dateKey = formatDateKey(day);
              const holidays = data.holidays[dateKey] || [];

              return (
                <th
                  key={day.getTime()}
                  className={`p-2 text-center border-b border-gray-200 dark:border-gray-700 min-w-[72px] ${
                    holidays.length > 0 ? "bg-rose-50/70 dark:bg-rose-500/5" : ""
                  }`}
                >
                  <div className="text-[10px] text-gray-400 uppercase">{formatDayName(day)}</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {day.getDate()}
                  </div>
                  <div className="mt-1 flex justify-center">
                    <HolidayBadge holidays={holidays} compact />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.users.length > 0 ? (
            data.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 p-3 border-r border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                      {user.name}
                    </div>
                  </div>
                </td>
                {days.map((day) => {
                  const dateKey = formatDateKey(day);
                  const cell = data.schedules[dateKey]?.[user.id];
                  const holidays = data.holidays[dateKey] || [];
                  return (
                    <td key={dateKey} className="p-0 border-b border-gray-100 dark:border-gray-800">
                      <ScheduleCell
                        userId={user.id}
                        date={dateKey}
                        cell={cell}
                        holidays={holidays}
                        onClick={onCellClick}
                      />
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={days.length + 1} className="p-10 text-center text-gray-500 italic">
                Tidak ada data karyawan ditemukan untuk periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleCalendar;
