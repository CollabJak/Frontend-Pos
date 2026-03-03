import PageMeta from "../../components/common/PageMeta";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import AuthLayout from "./AuthPageLayout";

export default function ForgotPassword() {
  return (
    <>
      <PageMeta
        title="Chronalix | Forgot Password"
        description="Forgot Password Page"
      />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}

