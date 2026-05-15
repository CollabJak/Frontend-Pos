import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import BulkAssignForm from "../../components/scheduling/BulkAssignForm";
import RotationAssignForm from "../../components/scheduling/RotationAssignForm";

const ScheduleGeneratePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bulk" | "rotation">("bulk");

  return (
    <>
      <PageMeta
        title="Generate Jadwal Karyawan | POS System"
        description="Buat draf jadwal kerja karyawan secara massal atau berbasis pola rotasi."
      />
      <PageBreadcrumb pageTitle="Generate Jadwal Kerja" />

      <div className="space-y-6">
        <ComponentCard title="Buat Draf Jadwal Baru">
          <div className="mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                className={`py-3 px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "bulk"
                    ? "text-brand-500"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("bulk")}
              >
                Bulk Assignment
                {activeTab === "bulk" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500" />
                )}
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "rotation"
                    ? "text-brand-500"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("rotation")}
              >
                Rotation Pattern
                {activeTab === "rotation" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500" />
                )}
              </button>
            </div>
          </div>

          {activeTab === "bulk" ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-400">
                <strong>Mode Bulk Assign:</strong> Gunakan ini untuk menetapkan satu shift yang sama (misal: Shift Pagi terus-menerus) kepada sekelompok karyawan dalam rentang tanggal tertentu.
              </div>
              <BulkAssignForm />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl text-xs text-purple-700 dark:text-purple-400">
                <strong>Mode Rotation Pattern:</strong> Gunakan ini untuk menghasilkan jadwal berdasarkan pola yang berulang (misal: 2 hari Pagi, 2 hari Siang, 2 hari Libur) secara otomatis.
              </div>
              <RotationAssignForm />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default ScheduleGeneratePage;
