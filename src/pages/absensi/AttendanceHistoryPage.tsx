import React, { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
  useGetTodayAttendance, 
  useGetAttendanceHistory,
  useGetFaceEnrollment
} from "../../hooks/api/useAbsensi";
import { 
  ArrowUpIcon, 
  DownloadIcon, 
  ChevronLeftIcon, 
  AngleRightIcon,
  CalenderIcon,
  PlusIcon,
  CheckCircleIcon
} from "../../icons";

const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate start and end of current month for API
  const dateParams = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    };
  }, [currentDate]);

  const { data: todayAttendance } = useGetTodayAttendance();
  const { data: historyData } = useGetAttendanceHistory(dateParams);
  const { data: faceEnrollment } = useGetFaceEnrollment();

  const isCheckedIn = !!todayAttendance?.check_in_time;
  const isCheckedOut = !!todayAttendance?.check_out_time;

  // Dynamic Calendar Logic
  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" });
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    // Previous month padding
    for (let i = 0; i < emptyDaysCount; i++) {
      days.push({ day: null, status: "empty" });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        // Find match in history
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const record = historyData?.find((h: any) => h.tanggal === dateStr);
        
        let status = "none";
        if (record) {
            status = record.status === 'Hadir' ? 'present' : 'none';
        }

        const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

        days.push({
            day: i,
            status: isToday ? "active" : (i % 7 === 0 ? "holiday" : status)
        });
    }
    return days;
  }, [currentDate, historyData]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard 
           title="JAM KERJA MINGGUAN" 
           value={isCheckedIn ? "Aktif" : "0.0j"} 
           subValue="+0,0j vs minggu lalu"
           subValueColor="text-success-500"
           icon={<ArrowUpIcon className="size-3 text-success-500" />}
         />
         <MetricCard 
           title="WAKTU LEMBUR" 
           value="0.0j" 
           subValue="Terkumpul periode ini"
           subValueColor="text-gray-400"
         />
         <MetricCard 
           title="KETEPATAN WAKTU" 
           value="--" 
           subValue={
             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-success-500 h-full w-[0%]" />
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
                    ? `Check in: ${todayAttendance?.check_in_time}` 
                    : (todayAttendance?.check_out_time ? `Check out terakhir: ${todayAttendance.check_out_time}` : "Belum ada absensi hari ini")}
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
                    {isCheckedIn ? `WAJAH TERIDENTIFIKASI • ${todayAttendance?.check_in_time}` : "PINDAI WAJAH..."}
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
                  
                  {calendarDays.map((item, idx) => (
                     <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer min-h-[50px]">
                        {item.day && (
                          <>
                            <div className={`size-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                               item.status === 'active' 
                               ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                               : (item.status === 'present' 
                                  ? 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400' 
                                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50')
                            }`}>
                               {item.day}
                            </div>
                            {/* Status Indicator Bar */}
                            <div className="w-6 h-1 rounded-full flex overflow-hidden">
                               {item.status === 'present' && <div className="w-full bg-success-600" />}
                               {item.status === 'holiday' && <div className="w-full bg-gray-200 dark:bg-gray-700" />}
                            </div>
                          </>
                        )}
                     </div>
                  ))}
               </div>

              {/* Legend */}
              <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-6 items-center">
                 <LegendItem color="bg-success-600" label="HADIR" />
                 <LegendItem color="bg-error-400" label="TERLAMBAT" />
                 <LegendItem color="bg-gray-200 dark:bg-gray-700" label="LIBUR" />
              </div>
           </div>

           {/* Bottom Action Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-brand-500 p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-brand-500/20">
                  <div className="space-y-1">
                     <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Laporan Kehadiran</h4>
                     <p className="text-sm font-bold text-white">Unduh Laporan Mingguan</p>
                  </div>
                  <button className="size-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                     <DownloadIcon className="size-5 text-white" />
                  </button>
               </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-theme-sm flex items-center justify-between">
                 <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Klaim Lembur</h4>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Ajukan Klaim Lembur Karyawan</p>
                 </div>
                 <button className="size-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <AngleRightIcon className="size-5 text-gray-400" />
                 </button>
              </div>
           </div>
        </div>
      </div>
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
      <div className={`size-2 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-gray-400 tracking-widest">{label}</span>
   </div>
);

export default AttendanceHistoryPage;
