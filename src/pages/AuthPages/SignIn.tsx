import { useAuth } from "../../hooks/useAuth";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Mengautentikasi...</span>
      </div>
    );
  }

  if (user) {
    return null;
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
