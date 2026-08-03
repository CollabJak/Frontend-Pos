import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authService } from "../../api/authService";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const token = useMemo(
    () => searchParams.get("token") || params.token || "",
    [params.token, searchParams]
  );
  const email = useMemo(
    () => searchParams.get("email") || params.email || "",
    [params.email, searchParams]
  );

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccessMessage(response.message || "Kata sandi berhasil diatur ulang.");

      setTimeout(() => {
        navigate("/signin?reset=success", { replace: true });
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengatur ulang kata sandi.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const invalidLink = !token || !email;

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Kembali ke Halaman Masuk
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Buat kata sandi baru Anda untuk <span className="font-medium">{email || "-"}</span>.
          </p>
        </div>

        {invalidLink ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              Tautan atur ulang tidak valid atau tidak lengkap. Silakan minta email atur ulang kata sandi yang baru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
              </div>
            )}

            <div>
              <Label htmlFor="reset-password">
                Kata Sandi Baru <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi baru Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="reset-password-confirmation">
                Konfirmasi Kata Sandi <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="reset-password-confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Konfirmasi kata sandi baru Anda"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPasswordConfirmation ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <Button className="w-full" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mengatur ulang..." : "Atur Ulang Kata Sandi"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
