import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Checkbox from "../form/input/Checkbox";
import { Role, Permission } from "../../types/types";

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

  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPermissions(role.permissions.map((p) => p.name));
    } else {
      setSelectedPermissions([]);
    }
  }, [role, isOpen]);

  // Group permissions by their prefix (e.g. "user.view" -> "User")
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach((permission) => {
      const parts = permission.name.split(".");
      const groupName = parts.length > 1
        ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        : "General";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });
    return groups;
  }, [allPermissions]);

  const togglePermission = (name: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    onSync(selectedPermissions);
  };

  if (!role) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-6 lg:p-10">
      <div className="flex flex-col h-full max-h-[80vh]">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Atur Hak Akses: {role.name}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          Pilih hak akses yang ingin diberikan pada peran ini. Perubahan akan langsung diterapkan setelah disimpan.
        </p>

        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-8 scrollbar-thin">
          {Object.entries(groupedPermissions).map(([group, permissions]) => (
            <div key={group} className="space-y-4">
              <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                {group}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPermissions.includes(permission.name)}
                      onChange={() => togglePermission(permission.name)}
                      label={permission.name.replace(`${group.toLowerCase()}.`, "").replace("_", " ")}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
