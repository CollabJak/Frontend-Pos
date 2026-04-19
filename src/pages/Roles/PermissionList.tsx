import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useFetchPermissions, useDeletePermission } from "../../hooks/useRbac";
import Button from "../../components/ui/button/Button";
import { Permission } from "../../types/types";
import PermissionFormModal from "../../components/roles/PermissionFormModal";
import { PencilIcon, TrashBinIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import { Pagination } from "../../components/tables/Datatable";

const PermissionList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: response, isLoading } = useFetchPermissions({ page, search: search.trim() || '' });
  const permissions = response?.data;
  const meta = response?.meta;
  const deletePermission = useDeletePermission();

  const { isOpen, openModal, closeModal } = useModal();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

  const handleCreate = () => {
    setSelectedPermission(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deletePermission.mutate(pendingDelete.id, {
      onSuccess: () => {
        closeModal();
        setPendingDelete(null);
      },
    });
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <>
      <PageMeta
        title="Permissions Management"
        description="Manage system permissions and RBAC"
      />
      <PageBreadcrumb pageTitle="Permissions Management" />

      <div className="space-y-6">
        <ComponentCard title="Permissions List">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreate} size="sm">
              Add New Permission
            </Button>
          </div>
          <div>
            <Input
              placeholder="Search permissions by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3 text-sm text-gray-500">Loading...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Name
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Guard
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {permissions && permissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No permissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions?.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {permission.name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {permission.guard_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEdit(permission)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-sm font-medium text-blue-500 shadow-sm transition-colors hover:border-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                <PencilIcon className="size-4" />
                                Edit
                              </button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteClick(permission.id, permission.name)}
                              >
                                <TrashBinIcon className="size-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {meta && (
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      <PermissionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        permission={selectedPermission}
      />

      <ConfirmDialog
        isOpen={isOpen}
        title="Delete Permission?"
        description={
          pendingDelete
            ? `Are you sure you want to delete the permission "${pendingDelete.name}"? This action cannot be undone and might break existing RBAC checks.`
            : "This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default PermissionList;
