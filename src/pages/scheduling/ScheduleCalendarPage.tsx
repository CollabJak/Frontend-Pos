import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import ScheduleCalendar from "../../components/scheduling/ScheduleCalendar";
import { useScheduleCalendar } from "../../hooks/scheduling/useScheduleCalendar";
import { useLocationOptions } from "../../hooks/useLocationOptions";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useNavigate } from "react-router-dom";
import { CalendarCell } from "../../types/scheduling";
import DatePicker from "../../components/form/date-picker";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";
import ScheduleDetailModal from "../../components/scheduling/ScheduleDetailModal";

const ScheduleCalendarPage: React.FC = () => {
  const navigate = useNavigate();

  const [viewMonth, setViewMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string>("all");
  const [selectedCell, setSelectedCell] = useState<{
    userId: number;
    date: string;
    cell?: CalendarCell;
  } | null>(null);

  const { data: calendarData, isLoading } = useScheduleCalendar({
    month: viewMonth,
    location_id: locationId,
    status: status,
  });

  const { data: locationOptionsData = [] } = useLocationOptions();


  const handleCellClick = (userId: number, date: string, cell?: CalendarCell) => {
    setSelectedCell({ userId, date, cell });
  };

  const locationOptions = [
    { value: "", label: "Semua Lokasi" },
    ...locationOptionsData.map((loc) => ({
      value: loc.id.toString(),
      label: loc.name,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "published", label: "Published Only" },
    { value: "draft", label: "Draft Only" },
  ];


  return (
    <>
      <PageMeta
        title="Kalender Jadwal Kerja | POS System"
        description="Pantau dan kelola jadwal kerja karyawan secara bulanan."
      />
      <PageBreadcrumb pageTitle="Kalender Jadwal Kerja" />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-48">
              <DatePicker
                id="view_month_picker"
                viewMode="month"
                defaultDate={viewMonth}
                onChange={([date]) => setViewMonth(formatDateToYYYYMMDD(date).slice(0, 7))}
                placeholder="Pilih Bulan"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <Select
                options={locationOptions}
                value={locationId?.toString() || ""}
                onChange={(val) => setLocationId(val ? Number(val) : undefined)}
                className="text-xs"
              />
            </div>
            <div className="w-40">
              <Select
                options={statusOptions}
                value={status}
                onChange={(val) => setStatus(val)}
                className="text-xs"
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate("/scheduling/generate")}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Generate Jadwal
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/scheduling/batches")}>
              Batch Jadwal
            </Button>
          </div>
        </div>

        {status === "draft" && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-orange-300">
            Jadwal draft perlu dipublish dari halaman Batch Jadwal sebelum bisa digunakan karyawan.
          </div>
        )}

        <ComponentCard title="Kalender Jadwal">
          <ScheduleCalendar
            month={viewMonth}
            data={calendarData || { users: [], schedules: {}, holidays: {} }}
            onCellClick={handleCellClick}
            isLoading={isLoading}
          />
        </ComponentCard>

        <div className="flex items-center gap-6 text-xs text-gray-500 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200" />
            <span>Tanpa Jadwal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 text-gray-400" />
            <span>Hari Off (Libur)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-50 border border-rose-200" />
            <span>Kalender Libur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Draf (Belum Publish)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span>Published</span>
          </div>
        </div>

        {selectedCell && (
          <ScheduleDetailModal
            isOpen={!!selectedCell}
            userId={selectedCell.userId}
            date={selectedCell.date}
            cell={selectedCell.cell}
            holidays={calendarData?.holidays[selectedCell.date] || []}
            locationId={locationId}
            onClose={() => setSelectedCell(null)}
          />
        )}
      </div>
    </>
  );
};

export default ScheduleCalendarPage;
