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

    const formatTypeLabel = (type: string) => {
        switch (type) {
            case 'qris': return 'QRIS';
            case 'bank_transfer': return 'Transfer Bank';
            case 'e_wallet': return 'E-Wallet';
            case 'cash': return 'Tunai';
            default: return type.replace('_', ' ').toUpperCase();
        }
    };

    const formatScopeLabel = (scope: string) => {
        switch (scope) {
            case 'business': return 'Bisnis (POS)';
            case 'system': return 'Sistem (Langganan)';
            default: return scope;
        }
    };

    return (
        <>
            <PageMeta
                title="Metode Pembayaran"
                description="Kelola metode pembayaran untuk POS dan Langganan"
            />
            <PageBreadcrumb pageTitle="Metode Pembayaran" />
            <div className="space-y-6">
                <ComponentCard 
                    title="Daftar Metode Pembayaran" 
                    linkLabel="Tambah Metode" 
                    linkTo="/payment-methods/create"
                >
                    <div className="mb-4">
                        <Input
                            id="payment-method-search"
                            type="text"
                            placeholder="Cari berdasarkan nama..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            {isLoading && <p className="p-3 text-center">Memuat data...</p>}

                            {!isLoading && (
                                <Table className="table-auto">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Metode</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipe</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cakupan (Scope)</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Penyedia / Rekening</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {paymentMethods.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">Tidak ada metode pembayaran yang ditemukan.</TableCell>
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
                                                                {method.is_default && <span className="text-[10px] text-brand-500 font-bold uppercase">Utama</span>}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <Badge color={getTypeBadge(method.type) as any}>
                                                            {formatTypeLabel(method.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {formatScopeLabel(method.scope)}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                                                        {method.type === 'cash' ? (
                                                            <span className="text-gray-400 italic">Tidak memerlukan rekening</span>
                                                        ) : (
                                                            <div>
                                                                <div className="font-medium dark:text-white">{method.provider_name}</div>
                                                                <div className="text-gray-500">{method.account_number}</div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {method.is_active ? (
                                                            <Badge color="success">Aktif</Badge>
                                                        ) : (
                                                            <Badge color="light">Tidak Aktif</Badge>
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
                title="Hapus / Nonaktifkan Metode Pembayaran?"
                description={
                    pendingDelete
                        ? `Apakah Anda yakin ingin menghapus "${pendingDelete.name}"?`
                        : "Tindakan ini akan menghapus metode pembayaran."
                }
                warningNote="Metode pembayaran yang masih memiliki transaksi dalam status pending tidak dapat dihapus."
                confirmText="Hapus"
                cancelText="Batal"
                tone="danger"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmLoading={deleteMutation.isPending}
            />
        </>
    );
}
