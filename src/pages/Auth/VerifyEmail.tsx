import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { CheckCircleIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { authService } from "../../api/authService";
import { useAuth } from "../../hooks/useAuth";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Get email from: AuthContext user > URL params > location.state > localStorage
  const [email, setEmail] = useState<string>(() => {
    const fromUrl = searchParams.get("email") || "";
    const fromState = (location.state?.email as string) || "";
    const fromStorage = localStorage.getItem("pendingVerificationEmail") || "";
    
    return user?.email || fromUrl || fromState || fromStorage;
  });

  const activeEmail = email || user?.email || "";
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  // Sync email from AuthContext if available
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  // Store email in localStorage whenever it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem("pendingVerificationEmail", email);
    }
  }, [email]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage("");
    setResendError("");

    const targetEmail = activeEmail.trim();

    try {
      if (!targetEmail && !user) {
        setResendError("Alamat email tidak ditemukan. Silakan masukkan email Anda atau mendaftar kembali.");
        return;
      }
      
      const response = await authService.resendVerificationEmail(targetEmail);
      setResendMessage(response.message || "Email verifikasi berhasil dikirim! Silakan periksa kotak masuk Anda.");
    } catch (error) {
      console.error("Resend error:", error);
      if (error instanceof Error) {
        setResendError(error.message);
      } else {
        setResendError("Gagal mengirim ulang email. Silakan coba lagi.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    localStorage.removeItem("pendingVerificationEmail");
    navigate("/signin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="w-full max-w-md px-6 py-12 bg-white rounded-lg shadow-lg dark:bg-dark-800">
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-center text-gray-800 dark:text-white">
          Verifikasi Email Anda
        </h1>

        <div className="mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Kami telah mengirimkan tautan verifikasi ke:
          </p>
          <p className="mt-2 font-semibold text-gray-800 dark:text-white">
            {activeEmail && activeEmail.trim() !== "" ? activeEmail : "alamat email Anda"}
          </p>
        </div>

        {(!activeEmail || activeEmail.trim() === "") && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        <div className="p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📧 Periksa kotak masuk email Anda dan klik tautan verifikasi untuk mengaktifkan akun Anda.
          </p>
        </div>

        {resendMessage && (
          <div className="p-4 mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ {resendMessage}
            </p>
          </div>
        )}

        {resendError && (
          <div className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              ✗ {resendError}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            isLoading={isResending}
            className="w-full"
          >
            Kirim Ulang Email
          </Button>

          <button
            onClick={handleBackToSignIn}
            className="w-full py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Kembali ke Halaman Masuk
          </button>
        </div>

        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
          <p>
            Tidak menerima email? Periksa folder spam Anda atau{" "}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              coba lagi
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
