import React, { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
  useGetTodayAttendance, 
  useGetAttendanceHistory,
  useGetFaceEnrollment,
  useGetMySchedules
} from "../../hooks/api/useAbsensi";
import { 
  ArrowUpIcon, 
  ChevronLeftIcon, 
  AngleRightIcon,
  CalenderIcon,
  PlusIcon,
  CheckCircleIcon,
  CloseIcon
} from "../../icons";

import { 
  CalendarDayStatus, 
  CalendarDayItem, 
  AttendanceRecord,
} from "../../types/attendance";

const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDayItem | null>(null);

  // Month param for my_schedules (YYYY-MM)
  const monthParam = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  // Calculate start and end of current month for API history (formatted safely without UTC shifts)
  const dateParams = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();

    return {
      start_date: `${y}-${String(m + 1).padStart(2, '0')}-01`,
      end_date: `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    };
  }, [currentDate]);

  const { data: todayAttendance } = useGetTodayAttendance();
  const { data: historyData } = useGetAttendanceHistory(dateParams);
  const { data: faceEnrollment } = useGetFaceEnrollment();
  const { data: mySchedules } = useGetMySchedules({ month: monthParam });

  const isCheckedIn = !!todayAttendance?.check_in_time;
  const isCheckedOut = !!todayAttendance?.check_out_time;

  // Dynamic Calendar Logic
  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" });
  }, [currentDate]);

  const calendarDays = useMemo<CalendarDayItem[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayStr = new Date().toISOString().split('T')[0];
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days: CalendarDayItem[] = [];
    // Previous month padding
    for (let i = 0; i < emptyDaysCount; i++) {
      days.push({ day: null, dateStr: null, status: "empty", schedule: null, attendance: null });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        
        // Find published schedule from backend for this date
        const schedule = mySchedules?.find((s: any) => s.schedule_date === dateStr) ?? null;

        // Find actual attendance record for this date (prioritize schedule.attendance, todayAttendance, then historyData)
        const attendance = schedule?.attendance 
           ?? (isToday && todayAttendance?.check_in_time ? todayAttendance : null)
           ?? historyData?.find((h: any) => {
              if (!h) return false;
              const hDate = h.tanggal ? String(h.tanggal).split('T')[0].split(' ')[0] : '';
              return hDate === dateStr;
           }) 
           ?? null;

        let status: CalendarDayStatus = "none";

        if (schedule?.is_day_off || schedule?.is_holiday) {
            status = "holiday";
        } else if (attendance?.check_in_time) {
            // User HAS checked in (today or past)
            const isLate = checkIsLate(attendance, schedule);
            status = isLate ? "late" : (isToday ? "active" : "present");
        } else if (isToday) {
            // User HAS NOT checked in yet today
            status = "active";
        } else if (schedule) {
            if (isPast) {
                // Past date with published schedule but no check-in -> ABSENT
                status = "absent";
            } else {
                // Future date with published schedule -> SCHEDULED
                status = "scheduled";
            }
        }

        days.push({
            day: i,
            dateStr,
            status,
            schedule,
            attendance,
        });
    }
    return days;
  }, [currentDate, historyData, mySchedules, todayAttendance]);

  // 1. Calculate Weekly Working Hours (Current Week Monday-Sunday vs Previous Week)
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    // Monday as start of week (ISO 8601)
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const mondayCurrentWeek = new Date(now);
    mondayCurrentWeek.setDate(now.getDate() - distanceToMonday);
    mondayCurrentWeek.setHours(0, 0, 0, 0);

    const sundayCurrentWeek = new Date(mondayCurrentWeek);
    sundayCurrentWeek.setDate(mondayCurrentWeek.getDate() + 6);
    sundayCurrentWeek.setHours(23, 59, 59, 999);

    const mondayPrevWeek = new Date(mondayCurrentWeek);
    mondayPrevWeek.setDate(mondayCurrentWeek.getDate() - 7);

    const sundayPrevWeek = new Date(mondayCurrentWeek);
    sundayPrevWeek.setDate(mondayCurrentWeek.getDate() - 1);
    sundayPrevWeek.setHours(23, 59, 59, 999);

    // Combine all available attendance records
    const allRecords: AttendanceRecord[] = [];
    if (historyData) allRecords.push(...historyData);
    if (todayAttendance?.check_in_time) {
      const exists = allRecords.some((r) => r.tanggal === todayAttendance.tanggal);
      if (!exists) allRecords.push(todayAttendance);
    }
    if (mySchedules) {
      mySchedules.forEach((s) => {
        if (s.attendance?.check_in_time) {
          const exists = allRecords.some((r) => r.id === s.attendance?.id || r.tanggal === s.schedule_date);
          if (!exists) allRecords.push(s.attendance as AttendanceRecord);
        }
      });
    }

    let currentWeekMins = 0;
    let prevWeekMins = 0;

    allRecords.forEach((rec) => {
      if (!rec.check_in_time) return;
      const recDate = new Date(rec.tanggal ? (rec.tanggal.includes("T") ? rec.tanggal : `${rec.tanggal}T00:00:00`) : rec.check_in_time);
      if (isNaN(recDate.getTime())) return;

      // Calculate duration
      let durMins = 0;
      if (rec.durasi && rec.durasi.includes("jam")) {
        const parts = rec.durasi.match(/\d+/g);
        if (parts && parts.length >= 2) {
          durMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }
      if (durMins === 0 && rec.check_in_time) {
        const inTime = new Date(rec.check_in_time.includes("T") || rec.check_in_time.includes(" ") ? rec.check_in_time : `${rec.tanggal || '2026-08-17'}T${rec.check_in_time}`);
        const outTime = rec.check_out_time 
          ? new Date(rec.check_out_time.includes("T") || rec.check_out_time.includes(" ") ? rec.check_out_time : `${rec.tanggal || '2026-08-17'}T${rec.check_out_time}`)
          : new Date();

        if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
          const diffMs = outTime.getTime() - inTime.getTime();
          durMins = diffMs > 0 ? Math.floor(diffMs / 60000) : 0;
        }
      }

      if (recDate >= mondayCurrentWeek && recDate <= sundayCurrentWeek) {
        currentWeekMins += durMins;
      } else if (recDate >= mondayPrevWeek && recDate <= sundayPrevWeek) {
        prevWeekMins += durMins;
      }
    });

    const currentHours = (currentWeekMins / 60).toFixed(1);
    const prevHours = (prevWeekMins / 60).toFixed(1);
    const diffHours = (parseFloat(currentHours) - parseFloat(prevHours)).toFixed(1);

    return {
      currentHours,
      diffHours: parseFloat(diffHours),
      formattedDiff: `${parseFloat(diffHours) >= 0 ? '+' : ''}${diffHours}j vs minggu lalu`,
    };
  }, [historyData, todayAttendance, mySchedules]);

  // 2. Calculate Punctuality Rate (%) based on completed/past scheduled shifts so far
  const punctualityStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const scheduledDaysSoFar = calendarDays.filter(
      (d) => d.day && d.dateStr && d.dateStr <= todayStr && d.schedule && !d.schedule.is_day_off && !d.schedule.is_holiday
    );

    const totalShifts = scheduledDaysSoFar.length;
    if (totalShifts === 0) {
      return { percentage: 100, onTimeCount: 0, totalShifts: 0, hasData: false };
    }

    const onTimeCount = scheduledDaysSoFar.filter(
      (d) => d.status === 'present' || (d.status === 'active' && d.attendance?.check_in_time && !checkIsLate(d.attendance, d.schedule))
    ).length;

    const percentage = Math.round((onTimeCount / totalShifts) * 100);
    return { percentage, onTimeCount, totalShifts, hasData: true };
  }, [calendarDays]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <MetricCard 
           title="JAM KERJA MINGGUAN" 
           value={`${weeklyStats.currentHours}j`} 
           subValue={weeklyStats.formattedDiff}
           subValueColor={weeklyStats.diffHours >= 0 ? "text-success-500" : "text-error-500"}
           icon={
             weeklyStats.diffHours >= 0 
               ? <ArrowUpIcon className="size-3 text-success-500" />
               : <ArrowUpIcon className="size-3 text-error-500 rotate-180" />
           }
         />
         <MetricCard 
           title="KETEPATAN WAKTU" 
           value={punctualityStats.hasData ? `${punctualityStats.percentage}%` : "--"} 
           subValue={
             <div className="w-full space-y-1 mt-1">
                <span className="text-[10px] text-gray-400 font-semibold block">
                   {punctualityStats.hasData 
                     ? `${punctualityStats.onTimeCount} dari ${punctualityStats.totalShifts} shift tepat waktu`
                     : "Belum ada shift berlangsung"}
                </span>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                   <div 
                      className={`h-full transition-all duration-300 ${
                         punctualityStats.percentage >= 90 ? 'bg-success-500' :
                         punctualityStats.percentage >= 75 ? 'bg-amber-400' : 'bg-error-500'
                      }`} 
                      style={{ width: `${punctualityStats.hasData ? punctualityStats.percentage : 0}%` }} 
                   />
                </div>
             </div>
           }
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            {/* Work Status Toggle Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-theme-sm space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status Kehadiran</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${isCheckedIn ? "bg-success-100 text-success-600" : "bg-gray-100 text-gray-400"}`}>
                    {isCheckedIn ? (isCheckedOut ? "Selesai Shift" : "Sedang Bekerja") : "Belum Absen"}
                  </span>
               </div>
               <div 
                 className={`p-4 rounded-xl flex items-center justify-between border transition-all duration-300 ${
                   isCheckedIn ? "bg-brand-50 border-brand-200" : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                 }`}
               >
                  <div className="flex items-center gap-3">
                     <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                        {faceEnrollment?.image ? (
                          <img src={faceEnrollment.image} alt="User" className="size-full object-cover" />
                        ) : (
                          <PlusIcon className="size-4 text-gray-400 rotate-45" />
                        )}
                     </div>
                     <span className={`text-sm font-bold transition-colors ${isCheckedIn ? "text-brand-700" : "text-gray-700 dark:text-gray-300"}`}>
                        {isCheckedIn ? (isCheckedOut ? "Sudah Check Out" : "Sudah Check In") : "Belum Check In"}
                     </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${isCheckedIn ? (isCheckedOut ? "bg-error-500" : "bg-success-500") : "bg-gray-300"}`}>
                     <div className={`size-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isCheckedIn ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
               </div>
               <p className="text-center text-[10px] text-gray-400">
                 {isCheckedIn 
                    ? `Check in: ${formatIndonesianTime(todayAttendance?.check_in_time)}` 
                    : (todayAttendance?.check_out_time ? `Check out terakhir: ${formatIndonesianTime(todayAttendance.check_out_time)}` : "Belum ada absensi hari ini")}
               </p>
            </div>

            {/* Live Feed Widget */}
            <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-900 shadow-2xl relative aspect-video group">
               {todayAttendance?.check_in_image ? (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <img src={todayAttendance.check_in_image} alt="Face Capture" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 border-2 border-brand-500/30 m-4 rounded-xl">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                         <CheckCircleIcon className="size-16 text-success-500" />
                      </div>
                    </div>
                  </div>
               ) : (
                  <div className="absolute inset-0 bg-[url('/images/background/terminal-feed.png')] bg-cover opacity-30" />
               )}
               
               <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isCheckedIn ? "bg-success-500" : "bg-error-500"}`} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">Kamera Terminal Absensi</span>
               </div>
               <div className="absolute bottom-4 left-4">
                  <h4 className="text-white font-bold text-sm">{user?.name || "Memuat autentikasi..."}</h4>
                  <p className="text-[10px] text-white/60 font-medium">
                    {isCheckedIn ? `WAJAH TERIDENTIFIKASI • ${formatIndonesianTime(todayAttendance?.check_in_time)}` : "PINDAI WAJAH..."}
                  </p>
               </div>
            </div>

           {/* Pending Alerts */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-theme-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Informasi & Pengumuman</h3>
              <div className="space-y-3">
                 <div className="bg-brand-500 p-3 rounded-xl flex gap-3 shadow-lg shadow-brand-500/20">
                    <CalenderIcon className="size-4 text-white shrink-0 mt-0.5" />
                    <div>
                       <h4 className="text-xs font-bold text-white">Jadwal Shift</h4>
                       <p className="text-[10px] text-white/80">Jam Kerja: 09:00 - 18:00 WIB</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Main Content (Calendar) */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-theme-sm flex-1">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{monthYearLabel}</h2>
                     <p className="text-xs text-gray-400 font-medium tracking-wide">Riwayat Kehadiran Karyawan</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={prevMonth}
                       className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                     >
                        <ChevronLeftIcon className="size-4 text-gray-600 dark:text-gray-400" />
                     </button>
                     <button 
                       onClick={nextMonth}
                       className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                     >
                        <AngleRightIcon className="size-4 text-gray-600 dark:text-gray-400" />
                     </button>
                  </div>
               </div>

               {/* Calendar Grid */}
               <div className="grid grid-cols-7 gap-y-8 gap-x-4">
                  {['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'].map(day => (
                     <div key={day} className="text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest">{day}</div>
                  ))}
                  
                  {calendarDays.map((item, idx) => {
                     const shiftColor = item.schedule?.snapshot?.color || '#3B82F6';

                     return (
                        <div 
                           key={idx} 
                           onClick={() => item.day && setSelectedDay(item)}
                           className={`flex flex-col items-center gap-2 group min-h-[50px] ${item.day ? 'cursor-pointer' : ''}`}
                        >
                           {item.day && (
                             <>
                               <div className="relative">
                                  <div className={`size-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                                     item.status === 'active' 
                                     ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                                     : (item.status === 'present' 
                                        ? 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400' 
                                        : (item.status === 'late'
                                           ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                           : (item.status === 'absent'
                                              ? 'bg-error-50 text-error-700 dark:bg-error-500/20 dark:text-error-400'
                                              : (item.status === 'scheduled'
                                                 ? 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/20 dark:text-blue-light-400'
                                                 : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'))))
                                  }`}>
                                     {item.day}
                                  </div>

                                  {/* Shift Color Badge Dot */}
                                  {item.schedule && !item.schedule.is_day_off && !item.schedule.is_holiday && (
                                     <span 
                                        className="absolute -top-1 -right-1 size-2.5 rounded-full border border-white dark:border-gray-800 shadow-xs"
                                        style={{ backgroundColor: shiftColor }}
                                        title={item.schedule.snapshot?.shift_name || 'Shift'}
                                     />
                                  )}
                               </div>

                               {/* Status Indicator Bar */}
                               <div className="w-6 h-1 rounded-full flex overflow-hidden">
                                  {item.status === 'present' && <div className="w-full bg-success-500" />}
                                  {item.status === 'late' && <div className="w-full bg-amber-400" />}
                                  {item.status === 'absent' && <div className="w-full bg-error-500" />}
                                  {item.status === 'scheduled' && <div className="w-full bg-blue-light-500" />}
                                  {item.status === 'holiday' && <div className="w-full bg-gray-300 dark:bg-gray-600" />}
                               </div>
                             </>
                           )}
                        </div>
                     );
                  })}
               </div>

              {/* Legend */}
              <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-6 items-center">
                 <LegendItem color="bg-success-500" label="HADIR" />
                 <LegendItem color="bg-amber-400" label="TERLAMBAT" />
                 <LegendItem color="bg-error-500" label="TIDAK HADIR" />
                 <LegendItem color="bg-blue-light-500" label="TERJADWAL" />
                 <LegendItem color="bg-gray-300 dark:bg-gray-600" label="LIBUR" />
              </div>
           </div>
        </div>
      </div>

      {/* Popover / Detail Modal */}
      {selectedDay && (
         <DayDetailModal dayItem={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
};

// Sub-components
const MetricCard: React.FC<{title: string; value: string; subValue?: React.ReactNode; subValueColor?: string; icon?: React.ReactNode}> = ({title, value, subValue, subValueColor, icon}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-theme-sm space-y-2">
     <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
     <div className="flex items-baseline gap-2">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{value}</h2>
     </div>
     <div className={`flex items-center gap-1 text-[10px] font-bold ${subValueColor}`}>
        {icon}
        {subValue}
     </div>
  </div>
);

const LegendItem: React.FC<{color: string; label: string}> = ({color, label}) => (
   <div className="flex items-center gap-2">
      <div className={`size-2.5 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-gray-400 tracking-widest">{label}</span>
   </div>
);

// Helper to extract time in minutes (HH * 60 + mm) from ISO timestamp or time string
const extractTimeInMinutes = (timeStr?: string | null): number | null => {
  if (!timeStr) return null;

  let cleanTime = timeStr;
  if (cleanTime.includes("T")) {
    cleanTime = cleanTime.split("T")[1];
  } else if (cleanTime.includes(" ")) {
    cleanTime = cleanTime.split(" ")[1];
  }

  const parts = cleanTime.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      return hours * 60 + minutes;
    }
  }

  return null;
};

// Helper to determine if an attendance record is late
const checkIsLate = (attendance: any, schedule: any): boolean => {
  if (!attendance) return false;

  // 1. Check backend indicators first
  const statusFromBackend = attendance.analytics?.attendance_status || attendance.attendance_status;
  if (statusFromBackend === 'late') return true;

  const lateMinsFromBackend = Number(attendance.analytics?.late_minutes ?? attendance.late_minutes ?? 0);
  if (lateMinsFromBackend > 0) return true;

  // 2. Fallback: Extract HH:mm directly from string to avoid timezone parsing mismatches
  const actualStr = attendance.check_in_time;
  const scheduledStr = schedule?.snapshot?.check_in_time || attendance.schedule?.scheduled_check_in;

  if (actualStr && scheduledStr) {
    let actualMins = extractTimeInMinutes(actualStr);
    let scheduledMins = extractTimeInMinutes(scheduledStr);

    if (actualMins !== null && scheduledMins !== null) {
      const isCrossDay = schedule?.snapshot?.is_cross_day || attendance.schedule?.is_cross_day;
      const tolerance = Number(schedule?.snapshot?.tolerance_late ?? attendance.schedule?.tolerance_late_minutes ?? 0);

      // Handle cross-day shift where check-in happens after midnight (e.g. 01:00 AM)
      if (isCrossDay && actualMins < scheduledMins && actualMins < 360) {
        actualMins += 1440;
      }

      if (actualMins > scheduledMins + tolerance) {
        return true;
      }
    }
  }

  return false;
};

// Helper format time to "HH:mm WIB"
const formatIndonesianTime = (timeStr?: string | null): string => {
  if (!timeStr) return "--:--";
  
  // ISO timestamp or SQL datetime (e.g., "2026-08-17T07:15:30.000000Z" or "2026-08-17 07:15:30")
  if (timeStr.includes("T") || timeStr.includes(" ")) {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm} WIB`;
    }
  }
  
  // Time string (e.g., "07:15:00" or "07:15")
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')} WIB`;
  }

  return `${timeStr} WIB`;
};

// Helper format date to "Senin, 17 Agustus 2026"
const formatIndonesianDate = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const DayDetailModal: React.FC<{dayItem: CalendarDayItem; onClose: () => void}> = ({dayItem, onClose}) => {
  const { dateStr, schedule, attendance, status } = dayItem;
  
  const formattedDate = useMemo(() => {
     return formatIndonesianDate(dateStr);
  }, [dateStr]);

  const shiftSnapshot = schedule?.snapshot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
       <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
             <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{formattedDate}</h3>
                <span className="text-xs text-gray-400">Detail Jadwal & Kehadiran</span>
             </div>
             <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
             >
                <CloseIcon className="size-5" />
             </button>
          </div>

          {/* Schedule Info Section */}
          <div className="space-y-2">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informasi Jadwal Shift</h4>
             {schedule ? (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 space-y-2">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span 
                            className="size-3 rounded-full" 
                            style={{ backgroundColor: shiftSnapshot?.color || '#3B82F6' }} 
                         />
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {schedule.is_day_off ? 'Hari Libur Karyawan' : (schedule.is_holiday ? 'Hari Libur Nasional' : (shiftSnapshot?.shift_name || 'Shift'))}
                         </span>
                      </div>
                      {shiftSnapshot?.is_cross_day && (
                         <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-600 rounded-full">Cross-Day</span>
                      )}
                   </div>
                   
                   {!schedule.is_day_off && !schedule.is_holiday && shiftSnapshot && (
                      <p className="text-xs text-gray-500 font-medium">
                         Jam Kerja: <span className="font-bold text-gray-700 dark:text-gray-300">{formatIndonesianTime(shiftSnapshot.check_in_time)} - {formatIndonesianTime(shiftSnapshot.check_out_time)}</span>
                      </p>
                   )}

                   {schedule.day_off_note && (
                      <p className="text-xs text-gray-400 italic">Catatan: {schedule.day_off_note}</p>
                   )}
                </div>
             ) : (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs text-gray-400 italic">
                   Tidak ada jadwal shift yang dipublikasikan pada tanggal ini.
                </div>
             )}
          </div>

          {/* Attendance Realization Section */}
          <div className="space-y-2">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Realisasi Kehadiran</h4>
             {attendance ? (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 space-y-3">
                   <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                         <span className="text-gray-400 block text-[10px] uppercase font-bold">Check In</span>
                         <span className="font-bold text-gray-800 dark:text-gray-200">{formatIndonesianTime(attendance.check_in_time)}</span>
                      </div>
                      <div>
                         <span className="text-gray-400 block text-[10px] uppercase font-bold">Check Out</span>
                         <span className="font-bold text-gray-800 dark:text-gray-200">{formatIndonesianTime(attendance.check_out_time)}</span>
                      </div>
                   </div>

                   {attendance.durasi && (
                      <p className="text-xs text-gray-500 font-medium">
                         Durasi Kerja: <span className="font-bold text-gray-700 dark:text-gray-300">{attendance.durasi}</span>
                      </p>
                   )}

                   <div className="flex items-center gap-2 pt-1 border-t border-gray-200/50 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                         status === 'present' ? 'bg-success-100 text-success-600' :
                         status === 'late' ? 'bg-amber-100 text-amber-600' :
                         status === 'absent' ? 'bg-error-100 text-error-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                         {status === 'present' ? 'Hadir Tepat Waktu' :
                          status === 'late' ? 'Terlambat' :
                          status === 'absent' ? 'Tidak Hadir' : status}
                      </span>
                   </div>
                </div>
             ) : (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                   {status === 'absent' ? (
                      <span className="text-error-500 font-bold">⚠️ Anda tidak melakukan absensi pada jadwal ini.</span>
                   ) : status === 'scheduled' ? (
                      <span className="text-blue-light-600 dark:text-blue-light-400 font-medium">📅 Jadwal kerja belum berlangsung.</span>
                   ) : (
                      <span>Belum ada data absensi untuk tanggal ini.</span>
                   )}
                </div>
             )}
          </div>

          <div className="pt-2 flex justify-end">
             <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
             >
                Tutup
             </button>
          </div>
       </div>
    </div>
  );
};

export default AttendanceHistoryPage;
