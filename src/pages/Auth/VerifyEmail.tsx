import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { CheckCircleIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import apiClient from "../../api/axiosConfig";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email from: URL params > location.state > localStorage
  const [email, setEmail] = useState<string>(() => {
    const fromUrl = searchParams.get("email") || "";
    const fromState = (location.state?.email as string) || "";
    const fromStorage = localStorage.getItem("pendingVerificationEmail") || "";
    
    const foundEmail = fromUrl || fromState || fromStorage;
    return foundEmail;
  });
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

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

    try {
      if (!email || email.trim() === "") {
        setResendError("Email address not found. Please enter your email or register again.");
        return;
      }
      
      const response = await apiClient.post("/email/verification-notification", { email });
      setResendMessage("Verification email sent! Check your inbox.");
    } catch (error) {
      console.error("Resend error:", error);
      if (error instanceof Error) {
        setResendError(error.message);
      } else {
        setResendError("Failed to resend email. Please try again.");
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
          Verify Your Email
        </h1>

        <div className="mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification link to:
          </p>
          <p className="mt-2 font-semibold text-gray-800 dark:text-white">
            {email && email.trim() !== "" ? email : "your email address"}
          </p>
        </div>

        {!email || email.trim() === "" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        <div className="p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📧 Check your email inbox and click the verification link to activate your account.
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
            disabled={isResending}
            className="w-full"
          >
            {isResending ? "Sending..." : "Resend Email"}
          </Button>

          <button
            onClick={handleBackToSignIn}
            className="w-full py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Back to Sign In
          </button>
        </div>

        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
          <p>
            Don't see the email? Check your spam folder or{" "}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
