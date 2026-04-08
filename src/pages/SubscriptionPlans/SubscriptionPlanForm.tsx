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
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import SubscriptionPlanFormModal from "../../components/subscriptionPlans/SubscriptionPlanFormModal";
import {
    useDeleteSubscriptionPlan,
    useFetchSubscriptionPlans,
    useUpsertSubscriptionPlan,
} from "../../hooks/useSubscriptionPlans";
import { SubscriptionPlan, SubscriptionPlanFormData } from "../../types/types";
import { Pagination } from "../../components/tables/Datatable";

const formatPrice = (price: number) => Number(price).toLocaleString();

export default function SubscriptionPlanForm() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useFetchSubscriptionPlans({ page });
    const { mutate: upsertSubscriptionPlan, isPending: isUpserting } =
        useUpsertSubscriptionPlan();
    const { mutate: deleteSubscriptionPlan, isPending: isDeleting } =
        useDeleteSubscriptionPlan();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const {
        isOpen: isConfirmOpen,
        openModal: openConfirm,
        closeModal: closeConfirm,
    } = useModal();
    const [pendingDelete, setPendingDelete] = useState<SubscriptionPlan | null>(
        null
    );

    const handleCreate = () => {
        setSelectedPlan(null);
        setIsFormOpen(true);
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (plan: SubscriptionPlan) => {
        setPendingDelete(plan);
        openConfirm();
    };

    const onFormSubmit = (formData: SubscriptionPlanFormData) => {
        upsertSubscriptionPlan(
            { id: selectedPlan?.id, data: formData },
            {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            }
        );
    };

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }

        deleteSubscriptionPlan(pendingDelete.id, {
            onSuccess: () => {
                closeConfirm();
                setPendingDelete(null);
            },
        });
    };

    return (
        <>
            <PageMeta
                title="Subscription Plans"
                description="Manage subscription plans and pricing."
            />
            <PageBreadcrumb pageTitle="Subscription Plans" />

            <div className="space-y-6">
                <ComponentCard title="Subscription Plans">
                    <div className="flex justify-end mb-4">
                        <Button
                            size="sm"
                            startIcon={<PlusIcon className="size-5" />}
                            onClick={handleCreate}
                        >
                            Add Subscription Plan
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            {isLoading && (
                                <p className="p-5 text-sm text-gray-500">
                                    Loading subscription plans...
                                </p>
                            )}

                            {!isLoading && data && (
                                <>
                                    <Table className="table-auto">
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Name
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Duration
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Price
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                    Description
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                            {data.data.map((plan) => (
                                                <TableRow key={plan.id}>
                                                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                        {plan.name}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                        {plan.duration}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                        {formatPrice(plan.price)}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 max-w-md">
                                                        {plan.description || "-"}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-end">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(plan)}
                                                                className="p-2 text-gray-500 hover:text-brand-500 transition-colors"
                                                                title="Edit Subscription Plan"
                                                            >
                                                                <PencilIcon className="size-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(plan)}
                                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                                                title="Delete Subscription Plan"
                                                                disabled={isDeleting}
                                                            >
                                                                <TrashBinIcon className="size-5" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {data.meta && (
                                        <Pagination
                                            currentPage={data.meta.current_page}
                                            lastPage={data.meta.last_page}
                                            onPageChange={setPage}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <SubscriptionPlanFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={onFormSubmit}
                initialData={selectedPlan}
                loading={isUpserting}
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Delete Subscription Plan?"
                description={
                    pendingDelete
                        ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
                        : "This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                tone="danger"
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
                confirmLoading={isDeleting}
            />
        </>
    );
}
