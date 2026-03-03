import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authService } from "../../api/authService";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await authService.forgotPassword({ email });
      setSuccessMessage(response.message || "Password reset link sent successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset link.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Sign In
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

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
            <Label htmlFor="forgot-email">
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="info@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button className="w-full" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}

