import React from "react";
import { CalendarCell, HolidayCalendar } from "../../types/scheduling";

interface ScheduleCellProps {
  cell?: CalendarCell;
  holidays?: HolidayCalendar[];
  date: string;
  userId: number;
  onClick: (userId: number, date: string, cell?: CalendarCell) => void;
}

const ScheduleCell: React.FC<ScheduleCellProps> = ({ cell, holidays = [], date, userId, onClick }) => {
  const isHoliday = holidays.length > 0;

  const getStatusColor = () => {
    if (!cell && isHoliday) return "bg-rose-50/60 dark:bg-rose-500/5";
    if (!cell) return "bg-gray-50 dark:bg-gray-900/40";
    if (cell.is_day_off) return "bg-gray-100 dark:bg-gray-800 text-gray-400";
    if (cell.status === 'draft') return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800";
    return "bg-white dark:bg-gray-800";
  };

  return (
    <div
      onClick={() => onClick(userId, date, cell)}
      title={
        cell
          ? `${cell.shift_name || "Hari Off"} - ${cell.status}`
          : isHoliday
            ? holidays.map((holiday) => holiday.name).join(", ")
          : "Klik untuk membuat draft jadwal"
      }
      className={`h-16 w-full border-r border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 flex flex-col items-center justify-center p-1 text-center ${getStatusColor()}`}
    >
      {cell ? (
        <>
          {!cell.is_day_off ? (
            <div className="space-y-1">
              <div 
                className="text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white shadow-sm truncate max-w-[80px]"
                style={{ backgroundColor: cell.shift_color || '#3b82f6' }}
              >
                {cell.shift_name}
              </div>
              {cell.status === 'draft' && (
                <span className="text-[8px] text-yellow-600 dark:text-yellow-400 font-medium">DRAFT</span>
              )}
              {cell.status === 'published' && cell.override_type !== 'original' && (
                <span className="text-[8px] text-brand-600 dark:text-brand-300 font-medium">
                  {cell.override_type.toUpperCase()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">OFF</span>
              {cell.day_off_note && (
                <span className="text-[8px] text-gray-400 mt-0.5 line-clamp-1 px-1">
                  {cell.day_off_note}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        isHoliday ? (
          <div className="flex max-w-full flex-col items-center gap-1 px-1">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Libur</span>
            <span className="max-w-[72px] truncate text-[8px] text-rose-500 dark:text-rose-300">
              {holidays[0].name}
            </span>
          </div>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        )
      )}
    </div>
  );
};

export default ScheduleCell;
