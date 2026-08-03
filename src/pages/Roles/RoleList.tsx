import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import {
  useFetchRoles,
  useUpsertRole,
  useDeleteRole,
  useFetchPermissionOptions,
  useSyncPermissions
} from "../../hooks/useRbac";
import { Role } from "../../types/types";
import RoleFormModal from "../../components/roles/RoleFormModal";
import PermissionSyncModal from "../../components/roles/PermissionSyncModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, LockIcon } from "../../icons";
import Button from "../../components/ui/button/Button";

export default function RoleList() {
  const { data: roles, isLoading: rolesLoading } = useFetchRoles();
  const { data: allPermissions, isLoading: permsLoading } = useFetchPermissionOptions();

  const { mutate: upsertRole, isPending: isUpserting } = useUpsertRole();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const { mutate: syncPermissions, isPending: isSyncing } = useSyncPermissions();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  const {
    isOpen: isConfirmOpen,
    openModal: openConfirm,
    closeModal: closeConfirm
  } = useModal();
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEditName = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsSyncOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setPendingDelete(role);
    openConfirm();
  };

  const onFormSubmit = (data: { name: string }) => {
    upsertRole(
      { id: selectedRole?.id, data },
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const onSyncSubmit = (permissions: string[]) => {
    if (!selectedRole) return;
    syncPermissions(
      { roleId: selectedRole.id, payload: { permissions } },
      {
        onSuccess: () => {
          setIsSyncOpen(false);
        },
      }
    );
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteRole(pendingDelete.id, {
        onSuccess: () => {
          closeConfirm();
          setPendingDelete(null);
        },
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Manajemen Peran"
        description="Kelola peran pengguna sistem dan hak akses (izin) yang terkait."
      />
      <PageBreadcrumb pageTitle="Manajemen Peran" />

      <div className="space-y-6">
        <ComponentCard title="Peran Sistem">
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={handleCreate}
            >
              Tambah Peran
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {(rolesLoading || permsLoading) && <p className="p-5 text-sm text-gray-500">Memuat data peran...</p>}

              {!rolesLoading && roles && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Nama Peran
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Guard
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Hak Akses (Permissions)
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                          {role.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                          {role.guard_name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start max-w-md">
                          <div className="flex flex-wrap gap-1.5">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions.map((p) => (
                                <Badge key={p.id} color="light" size="sm">
                                  {p.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">Belum ada hak akses</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleManagePermissions(role)}
                              className="p-2 text-gray-500 hover:text-brand-500 transition-colors"
                              title="Atur Hak Akses"
                            >
                              <LockIcon className="size-5" />
                            </button>
                            <button
                              onClick={() => handleEditName(role)}
                              className="p-2 text-gray-500 hover:text-brand-500 transition-colors"
                              title="Edit Nama Peran"
                            >
                              <PencilIcon className="size-5" />
                            </button>
                            {role.name !== "admin" && (
                              <button
                                onClick={() => handleDeleteClick(role)}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Hapus Peran"
                                disabled={isDeleting}
                              >
                                <TrashBinIcon className="size-5" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onFormSubmit}
        initialData={selectedRole}
        loading={isUpserting}
      />

      <PermissionSyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        role={selectedRole}
        allPermissions={allPermissions || []}
        onSync={onSyncSubmit}
        loading={isSyncing}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Peran?"
        description={`Apakah Anda yakin ingin menghapus peran "${pendingDelete?.name}"? Tindakan ini dapat memengaruhi pengguna yang memiliki peran ini.`}
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </>
  );
}
