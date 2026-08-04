import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Checkbox from "../form/input/Checkbox";
import { Input } from "../form/input/InputField";
import { Role, Permission } from "../../types/types";
import { CloseIcon } from "../../icons";

interface PermissionSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: Permission[];
  onSync: (permissions: string[]) => void;
  loading?: boolean;
}

const PermissionSyncModal: React.FC<PermissionSyncModalProps> = ({
  isOpen,
  onClose,
  role,
  allPermissions,
  onSync,
  loading,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPermissions(role.permissions.map((p) => p.name));
    } else {
      setSelectedPermissions([]);
    }
    setSearchQuery("");
  }, [role, isOpen]);

  // Client-side filtering of permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPermissions;
    }
    const query = searchQuery.toLowerCase().trim();
    return allPermissions.filter((permission) =>
      permission.name.toLowerCase().includes(query)
    );
  }, [allPermissions, searchQuery]);

  // Group permissions by their prefix (e.g. "user.view" -> "User")
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach((permission) => {
      const parts = permission.name.split(".");
      const groupName =
        parts.length > 1
          ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
          : "General";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });
    return groups;
  }, [filteredPermissions]);

  const togglePermission = (name: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredNames = filteredPermissions.map((p) => p.name);
    setSelectedPermissions((prev) =>
      Array.from(new Set([...prev, ...filteredNames]))
    );
  };

  const handleDeselectAllFiltered = () => {
    const filteredNamesSet = new Set(filteredPermissions.map((p) => p.name));
    setSelectedPermissions((prev) =>
      prev.filter((name) => !filteredNamesSet.has(name))
    );
  };

  const handleSave = () => {
    onSync(selectedPermissions);
  };

  if (!role) return null;

  const totalGroups = Object.keys(groupedPermissions).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-6 lg:p-10">
      <div className="flex flex-col h-full max-h-[80vh]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Atur Hak Akses: {role.name}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih hak akses yang ingin diberikan pada peran ini. Perubahan akan langsung diterapkan setelah disimpan.
            </p>
          </div>
        </div>

        {/* Counter & Search Control Bar */}
        <div className="my-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Cari hak akses (contoh: product.create, supplier)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Hapus kata kunci"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 underline transition-colors"
              >
                Pilih Semua {searchQuery ? "Hasil" : ""}
              </button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition-colors"
              >
                Hapus Pilihan {searchQuery ? "Hasil" : ""}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>
              Terpilih <strong className="text-brand-500 dark:text-brand-400">{selectedPermissions.length}</strong> dari <strong>{allPermissions.length}</strong> hak akses
            </span>
            {searchQuery && (
              <span>
                Menampilkan <strong>{filteredPermissions.length}</strong> hasil pencarian
              </span>
            )}
          </div>
        </div>

        {/* Permissions List / Empty State Container */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-8 scrollbar-thin">
          {totalGroups > 0 ? (
            Object.entries(groupedPermissions).map(([group, permissions]) => (
              <div key={group} className="space-y-4">
                <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
                  <span>{group}</span>
                  <span className="text-xs font-normal text-gray-400 lowercase">
                    ({permissions.length} item)
                  </span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => togglePermission(permission.name)}
                        label={permission.name.replace(`${group.toLowerCase()}.`, "").replace(/_/g, " ")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Tidak ada hak akses yang sesuai dengan kata kunci &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-brand-500 hover:underline font-medium"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Hak Akses"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionSyncModal;
