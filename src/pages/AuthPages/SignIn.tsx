import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Chronalix | Sign In"
        description="Chronalix Sign In Page"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
