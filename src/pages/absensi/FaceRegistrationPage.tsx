import React, { useRef, useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  faceRegistrationSchema,
  FaceRegistrationFormValues,
} from "../../Schemas/absensiSchema";
import { useEnrollFace, useGetFaceEnrollment } from "../../hooks/api/useAbsensi";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { UserCircleIcon, PlusIcon, InfoIcon, CheckCircleIcon } from "../../icons";

const FaceRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isReEnrolling, setIsReEnrolling] = useState(false);

  const { data: faceEnrollment } = useGetFaceEnrollment();
  const { mutateAsync: enrollFace, isPending } = useEnrollFace();

  const registeredImage = faceEnrollment?.image;
  const hasExistingEnrollment = !!registeredImage;
  const showCameraView = !hasExistingEnrollment || isReEnrolling;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FaceRegistrationFormValues>({
    resolver: zodResolver(faceRegistrationSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      isActive: true,
    },
  });

  useEffect(() => {
    register("face_image");
  }, [register]);

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
        return new File([u8arr], `enroll_${Date.now()}.jpg`, { type: mime });
      }
    }
    return null;
  }, []);

  // Manage Camera Life Cycle strictly when showCameraView is true
  useEffect(() => {
    if (!showCameraView) {
      setIsCameraActive(false);
      return;
    }

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
  }, [showCameraView]);

  const onSubmit = async (data: FaceRegistrationFormValues) => {
    try {
      const formData = new FormData();
      formData.append("full_name", data.fullName);
      formData.append("email", data.email);
      formData.append("is_active", data.isActive ? "1" : "0");
      formData.append("face_image", data.face_image);

      await enrollFace(formData);
      setIsReEnrolling(false);
      navigate("/absensi/scanner");
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  const handleCaptureAndEnroll = async () => {
    const file = captureFrame();
    if (!file) {
      console.error("Failed to capture image");
      return;
    }
    
    setValue("face_image", file);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex flex-col gap-1">
        <h1 className="text-title-sm font-bold text-gray-900 dark:text-white">Pendaftaran Wajah (Biometrik Absensi)</h1>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Pendaftaran biometrik wajah karyawan untuk sistem absensi berbasis pemindaian kecerdasan buatan (AI).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera / Registered Image Preview and Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 space-y-6">
              
              {/* Display Area: Image Preview OR Camera Stream */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden group border border-gray-100 dark:border-gray-700">
                
                {/* Status Indicator Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
                  {showCameraView ? (
                    <>
                      <span className={`w-2 h-2 rounded-full ${isCameraActive ? "bg-success-500 animate-pulse" : "bg-error-500"}`} />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {isCameraActive ? "Kamera Aktif" : "Memuat Kamera..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="size-4 text-success-500" />
                      <span className="text-xs font-semibold text-success-700 dark:text-success-400 uppercase tracking-wider">
                        Wajah Sudah Terdaftar
                      </span>
                    </>
                  )}
                </div>

                {/* Content: Show Registered Image OR Real Camera Feed */}
                {!showCameraView && registeredImage ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                    <img
                      src={registeredImage}
                      alt="Wajah Terdaftar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                      <div className="text-white space-y-1">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-300">Foto Biometrik Aktif</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                )}
              </div>

              {/* Instructions Alert */}
              <div className="bg-brand-500 dark:bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl flex gap-3">
                <InfoIcon className="size-6 text-white dark:text-brand-400 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-white dark:text-white font-semibold text-sm">Instruksi Pengambilan Foto</h4>
                  <p className="text-white/90 dark:text-gray-300 text-xs leading-relaxed">
                    Pastikan wajah berada tepat di tengah bingkai pemindai, lepaskan kacamata atau masker, dan pastikan pencahayaan cukup terang.
                  </p>
                </div>
              </div>

              {/* Form Section & Dynamic Actions */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <InputField
                      id="fullName"
                      placeholder="Nama Lengkap"
                      readOnly
                      {...register("fullName")}
                      error={!!errors.fullName}
                      hint={errors.fullName?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Karyawan</Label>
                    <InputField
                      id="email"
                      placeholder="Email Karyawan"
                      readOnly
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                    />
                  </div>
                </div>

                {errors.face_image && (
                  <p className="text-xs text-error-500 font-medium">
                    {errors.face_image.message as string}
                  </p>
                )}

                {/* Actions: Show "Perbarui Wajah" if preview mode, OR "Ambil Foto & Daftarkan" if camera mode */}
                {!showCameraView ? (
                  <Button
                    type="button"
                    onClick={() => setIsReEnrolling(true)}
                    className="w-full py-4 text-base font-bold tracking-wide"
                    startIcon={<PlusIcon className="size-5" />}
                  >
                    PERBARUI WAJAH (AMBIL FOTO ULANG)
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    {hasExistingEnrollment && (
                      <button
                        type="button"
                        onClick={() => setIsReEnrolling(false)}
                        className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-colors"
                        disabled={isPending}
                      >
                        Batal
                      </button>
                    )}
                    <Button
                      type="button"
                      onClick={handleCaptureAndEnroll}
                      className="flex-1 py-4 text-base font-bold tracking-wide"
                      startIcon={<PlusIcon className="size-5" />}
                      disabled={isPending || !isCameraActive}
                    >
                      {isPending
                        ? "MENDAFTARKAN WAJAH..."
                        : hasExistingEnrollment
                        ? "SIMPAN PEMBARUAN WAJAH"
                        : "AMBIL FOTO & DAFTARKAN WAJAH"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-theme-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Alur Pendaftaran Biometrik
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Data profil karyawan (Nama & Email) otomatis terisi dari akun sesi login Anda.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Jika sudah pernah terdaftar, foto terdaftar ditampilkan. Klik <b>Perbarui Wajah</b> untuk membuka kamera dan mendaftar ulang.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">3</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Setelah berhasil terdaftar, Anda dapat langsung melakukan absensi pada pemindai wajah.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/absensi/scanner')}
              className="w-full mt-10 py-3 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-colors uppercase tracking-widest border border-brand-100 dark:border-brand-500/20"
            >
              Buka Pemindai Absensi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationPage;
