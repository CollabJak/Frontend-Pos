import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAttendanceMutation,
  useGetTodayAttendance
} from "../../hooks/api/useAbsensi";
import {
  UserCircleIcon,
  ArrowRightIcon,
  InfoIcon,
} from "../../icons";
import { useAuth } from "../../hooks/useAuth";

const AttendanceScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { data: todayAttendance } = useGetTodayAttendance();
  const { mutateAsync: checkIn, isPending: isCheckingIn } = useAttendanceMutation("checkin");
  const { mutateAsync: checkOut, isPending: isCheckingOut } = useAttendanceMutation("checkout");

  const assignedLocations = user?.locations || [];
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  useEffect(() => {
    if (assignedLocations.length === 1) {
      setSelectedLocationId(assignedLocations[0].id);
    } else if (assignedLocations.length > 1) {
      const primary = assignedLocations.find((loc) => loc.is_primary);
      if (primary) {
        setSelectedLocationId(primary.id);
      } else {
        setSelectedLocationId(assignedLocations[0].id);
      }
    }
  }, [assignedLocations]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const captureFrame = useCallback((): File | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        // Convert base64 to File
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], `attendance_${Date.now()}.jpg`, { type: mime });
      }
    }
    return null;
  }, []);

  const handleAction = async (type: "checkin" | "checkout") => {
    if (cooldown > 0) return;
    const file = captureFrame();
    if (!file) {
      console.error("Failed to capture image");
      return;
    }

    const formData = new FormData();
    formData.append("face_image", file);
    if (type === "checkin" && selectedLocationId) {
      formData.append("location_id", selectedLocationId.toString());
    }

    try {
      if (type === "checkin") {
        await checkIn(formData);
      } else {
        await checkOut(formData);
      }
      navigate("/absensi/history");
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      setCooldown(5); // 5 seconds cooldown
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsCameraActive(false);
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
      }
    };
  }, []);

  const isLoading = isCheckingIn || isCheckingOut;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Scanner View */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-0 space-y-0">
              <div className="relative aspect-video bg-gray-950 overflow-hidden group">
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? "bg-success-500 animate-pulse" : "bg-error-500"}`} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {isCameraActive ? "Kamera Aktif" : "Kamera Tidak Aktif"}
                  </span>
                </div>

                {/* Real Camera Feed */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Scanning frame overlay */}
                    <div className="w-72 h-72 border-2 border-brand-500/30 rounded-3xl relative">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-500 rounded-tl-3xl -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-500 rounded-tr-3xl -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-500 rounded-bl-3xl -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-500 rounded-br-3xl -mb-1 -mr-1" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <UserCircleIcon className="size-48 text-brand-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity Verified Overlay (Glassmorphism) - Logic could be added here if backend identification is 1:N */}
              </div>
            </div>
          </div>

          {/* Instructions Alert */}
          <div className="bg-brand-500 dark:bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl flex gap-3">
            <InfoIcon className="size-6 text-white dark:text-brand-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-white dark:text-white font-semibold text-sm">Instruksi Pengambilan</h4>
              <p className="text-white/90 dark:text-gray-300 text-xs leading-relaxed">
                Pastikan wajah berada di tengah bingkai, lepaskan kacamata, dan pastikan pencahayaan cukup terang.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-theme-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8 h-full flex flex-col justify-center">
          <div className="space-y-2">
            <p className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs">{todayAttendance ? 'Selamat Datang Kembali' : 'Selamat Datang'}</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {todayAttendance?.check_out_time
                ? 'Absensi Hari Ini Selesai'
                : (todayAttendance?.check_in_time ? 'Waktunya Check Out?' : 'Mulai Absensi Hari Ini')}
            </h2>
          </div>

          <div className="space-y-4">
            {assignedLocations.length === 0 ? (
              <div className="p-4 rounded-xl border border-error-200 bg-error-50 dark:bg-error-950/10 text-error-600 dark:text-error-400 text-sm">
                ⚠️ Anda belum ditugaskan ke lokasi kerja mana pun. Silakan hubungi manajer Anda.
              </div>
            ) : assignedLocations.length === 1 ? (
              <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/50 dark:bg-brand-950/10 text-gray-700 dark:text-gray-300 text-sm flex justify-between items-center">
                <span>📍 Lokasi Absensi:</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{assignedLocations[0].name}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Pilih Lokasi Absensi
                </label>
                <select
                  value={selectedLocationId || ""}
                  onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                  disabled={!!todayAttendance?.check_in_time}
                  className="w-full p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold focus:border-brand-500 focus:ring-brand-500 disabled:opacity-75"
                >
                  {assignedLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.is_primary && " (Utama)"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Check In Button */}
            <button
              onClick={() => handleAction("checkin")}
              disabled={isLoading || cooldown > 0 || !!todayAttendance?.check_in_time || assignedLocations.length === 0}
              className="group relative flex items-center justify-between p-6 bg-brand-500 hover:bg-brand-600 rounded-2xl transition-all duration-300 shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:grayscale"
            >
              <div className="flex items-center gap-6">
                <div className="size-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowRightIcon className="size-8 text-white fill-current rotate-0" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">Check In</h3>
                  <p className="text-white/70 text-sm italic font-medium">
                    {cooldown > 0 ? `Menunggu (${cooldown}s)...` : (todayAttendance?.check_in_time ? `Masuk: ${todayAttendance.check_in_time}` : 'Mulai bekerja sekarang')}
                  </p>
                </div>
              </div>
            </button>

            {/* Check Out Button */}
            <button
              onClick={() => handleAction("checkout")}
              disabled={isLoading || cooldown > 0 || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
              className="group relative flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-6">
                <div className="size-14 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <ArrowRightIcon className="size-8 text-gray-400 dark:text-gray-500 fill-current rotate-180" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Check Out</h3>
                  <p className="text-gray-400 text-sm italic font-medium">
                    {cooldown > 0 ? `Menunggu (${cooldown}s)...` : (todayAttendance?.check_out_time ? `Keluar: ${todayAttendance.check_out_time}` : 'Selesai waktu kerja')}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Last Record Status */}
          {todayAttendance?.check_in_time && (
            <div className="bg-success-50 dark:bg-success-500/10 p-4 rounded-2xl border border-success-100 dark:border-success-500/20 flex items-center gap-4">
              <div className="size-10 rounded-full bg-success-500/10 flex items-center justify-center overflow-hidden">
                <img
                  src={(todayAttendance.check_out_time ? todayAttendance.check_out_image : todayAttendance.check_in_image) || user?.photo || "/images/user/user-01.png"}
                  alt="User"
                  className="size-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-success-700 dark:text-success-500 uppercase tracking-widest leading-none mb-1">Status Kehadiran</p>
                <p className="text-sm font-bold text-success-800 dark:text-success-400">
                  {todayAttendance.check_out_time ? 'Sudah Check Out' : 'Sedang Bekerja'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-center pt-4">
            <InfoIcon className="size-4 text-error-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lupa ID Card? Gunakan Face Recognition. <button onClick={() => navigate('/absensi/history')} className="text-brand-600 font-bold hover:underline">Riwayat</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScannerPage;
