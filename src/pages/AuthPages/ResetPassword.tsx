import PageMeta from "../../components/common/PageMeta";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import AuthLayout from "./AuthPageLayout";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Chronalix | Reset Password"
        description="Reset Password Page"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}

