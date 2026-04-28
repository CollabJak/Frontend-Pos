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
import { useFetchPaymentMethods, useDeletePaymentMethod } from "../../hooks/usePaymentMethods";
import { PencilIcon, TrashBinIcon, CreditCardIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router-dom";
import { PaymentMethod } from "../../types/payment-method";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Input } from "../../components/form/input/InputField";

export default function PaymentMethodListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim(), 400);

    const { data: response, isLoading } = useFetchPaymentMethods({
        search: debouncedSearch || undefined
    });
    const deleteMutation = useDeletePaymentMethod();
    const { isOpen, openModal, closeModal } = useModal();
    const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

    const paymentMethods = Array.isArray(response) ? response : (response?.data || []);

    const handleDeleteClick = (id: number, name: string) => () => {
        setPendingDelete({ id, name });
        openModal();
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete) return;
        await deleteMutation.mutateAsync(pendingDelete.id);
        setPendingDelete(null);
        closeModal();
    };

    const handleCancelDelete = () => {
        setPendingDelete(null);
        closeModal();
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'qris': return 'success';
            case 'bank_transfer': return 'primary';
            case 'e_wallet': return 'warning';
            default: return 'light';
        }
    };

    return (
        <>
            <PageMeta
                title="Payment Methods"
                description="Manage payment methods for POS and Subscriptions"
            />
            <PageBreadcrumb pageTitle="Payment Methods" />
            <div className="space-y-6">
                <ComponentCard 
                    title="Payment Method List" 
                    linkLabel="Add Method" 
                    linkTo="/payment-methods/create"
                >
                    <div className="mb-4">
                        <Input
                            id="payment-method-search"
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            {isLoading && <p className="p-3 text-center">Loading...</p>}

                            {!isLoading && (
                                <Table className="table-auto">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Scope</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Provider / Account</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {paymentMethods.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">No payment methods found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            paymentMethods.map((method: PaymentMethod) => (
                                                <TableRow key={method.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${method.is_default ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-white/[0.05] text-gray-500'}`}>
                                                                <CreditCardIcon className="size-4" />
                                                            </div>
                                                            <div>
                                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{method.name}</span>
                                                                {method.is_default && <span className="text-[10px] text-brand-500 font-bold uppercase">Default</span>}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <Badge color={getTypeBadge(method.type) as any}>
                                                            {method.type.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                                                        {method.scope}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                                                        {method.type === 'cash' ? (
                                                            <span className="text-gray-400 italic">No account needed</span>
                                                        ) : (
                                                            <div>
                                                                <div className="font-medium dark:text-white">{method.provider_name}</div>
                                                                <div className="text-gray-500">{method.account_number}</div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {method.is_active ? (
                                                            <Badge color="success">Active</Badge>
                                                        ) : (
                                                            <Badge color="light">Inactive</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-end">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => navigate(`/payment-methods/edit/${method.id}`)}
                                                                className="p-2 text-gray-400 hover:text-brand-500 transition-colors"
                                                            >
                                                                <PencilIcon className="size-4" />
                                                            </button>
                                                            <button 
                                                                onClick={handleDeleteClick(method.id, method.name)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <TrashBinIcon className="size-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <ConfirmDialog
                isOpen={isOpen}
                title="Deactivate Payment Method?"
                description={
                    pendingDelete
                        ? `Are you sure you want to deactivate "${pendingDelete.name}"? This method will no longer be available for new transactions.`
                        : "This action will deactivate the payment method."
                }
                confirmText="Deactivate"
                cancelText="Cancel"
                tone="danger"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmLoading={deleteMutation.isPending}
            />
        </>
    );
}
