import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.roles?.includes("manager") || user.roles?.includes("admin")) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/absensi/scanner", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Mengautentikasi...</span>
      </div>
    );
  }

  if (user) {
    return null; // or a redirecting message
  }

  return (
    <>
      <PageMeta
        title="Chronalix | Masuk"
        description="Halaman Masuk Chronalix"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
