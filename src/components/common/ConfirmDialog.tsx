import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

type ConfirmTone = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
}

const toneStyles: Record<ConfirmTone, { ring: string; icon: string; button: "danger" | "warning" | "info" }> = {
  danger: {
    ring: "ring-red-200 bg-red-50 text-red-700 dark:ring-red-900/40 dark:bg-red-950/40 dark:text-red-200",
    icon: "text-red-600 dark:text-red-200",
    button: "danger",
  },
  warning: {
    ring: "ring-amber-200 bg-amber-50 text-amber-700 dark:ring-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-200",
    button: "warning",
  },
  info: {
    ring: "ring-blue-200 bg-blue-50 text-blue-700 dark:ring-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-200",
    button: "info",
  },
};

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
  confirmLoading = false,
}: ConfirmDialogProps) {
  const toneStyle = toneStyles[tone];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-md m-4" showCloseButton={false}>
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950" />
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneStyle.ring}`}>
              <svg
                className={toneStyle.icon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button size="sm" variant={toneStyle.button} onClick={onConfirm} disabled={confirmLoading}>
              {confirmLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
