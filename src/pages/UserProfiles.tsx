import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../hooks/useAuth";

export default function UserProfiles() {
  const { loading } = useAuth();

  return (
    <>
      <PageMeta
        title="Profil Pengguna"
        description="Halaman profil pengguna dan pengaturan akun."
      />
      <PageBreadcrumb pageTitle="Profil Pengguna" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Pengaturan Profil
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data profil...</p>
        ) : (
          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserAddressCard />
          </div>
        )}
      </div>
    </>
  );
}
