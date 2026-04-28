import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useFetchBillingHistory, useFetchMySubscription } from "../../hooks/useSubscriptionPlans";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { CalendarIcon, CreditCardIcon } from "../../icons";

import UploadProofModal from "../../components/subscription/UploadProofModal";

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'confirmation': return 'info';
        case 'failed':
        case 'expired': return 'error';
        default: return 'light';
    }
};

export default function BillingHistoryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean, paymentId: number, invoiceNumber: string }>({
        isOpen: false,
        paymentId: 0,
        invoiceNumber: ""
    });

    const { data: currentSub, isLoading: isSubLoading } = useFetchMySubscription();
    const { data: history, isLoading: isHistoryLoading } = useFetchBillingHistory(page);

    return (
        <>
            <PageMeta title="Billing History" description="Manage your invoices and subscription status." />
            <PageBreadcrumb pageTitle="Billing & Usage" />
            
            {/* ... rest of widgets ... */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Active Plan Widget */}
                <ComponentCard title="Paket Aktif Saat Ini" className="lg:col-span-1">
                    {isSubLoading ? (
                        <p className="text-sm text-gray-500">Memuat status...</p>
                    ) : currentSub ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                                <h3 className="text-white dark:text-brand-400 font-bold text-lg">{currentSub.subscription_plan?.name}</h3>
                                <p className="text-sm text-white">Aktif hingga {new Date(currentSub.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Status:</span>
                                <Badge color="success">AKTIF</Badge>
                            </div>
                            
                            <Button fullWidth variant="outline" size="sm" onClick={() => navigate('/pricing')}>
                                Perbarui / Upgrade Paket
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-4">Anda belum memiliki paket aktif.</p>
                            <Button size="sm" onClick={() => navigate('/pricing')}>
                                Berlangganan Sekarang
                            </Button>
                        </div>
                    )}
                </ComponentCard>

                {/* Billing Summary Widget */}
                <ComponentCard title="Ringkasan & Penggunaan" className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                                <CalendarIcon className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Tagihan Berikutnya</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {currentSub?.next_billing_date 
                                        ? new Date(currentSub.next_billing_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '-'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600">
                                <CreditCardIcon className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Metode Pembayaran</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {currentSub?.payment_method?.toUpperCase() || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Usage Progress Bars */}
                    {currentSub && (
                        <div className="pt-6 border-t border-gray-100 dark:border-white/[0.05]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Penggunaan Lokasi Bisnis</span>
                                <span className="text-xs font-semibold text-gray-500">
                                    {currentSub.current_usage?.locations || 0} / {currentSub.subscription_plan?.features?.max_locations || '∞'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ 
                                        width: `${Math.min(100, ((currentSub.current_usage?.locations || 0) / (currentSub.subscription_plan?.features?.max_locations || 1)) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400">
                                *Batas lokasi ditentukan berdasarkan paket langganan Anda.
                            </p>
                        </div>
                    )}
                </ComponentCard>
            </div>

            {/* Invoices Table */}
            <ComponentCard title="Riwayat Tagihan & Invoice">
                <div className="overflow-hidden">
                    <Table className="table-auto">
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Invoice</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Paket</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Metode</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tanggal</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jumlah</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Aksi</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {isHistoryLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">Memuat riwayat...</TableCell>
                                </TableRow>
                            ) : history?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center text-gray-500">Tidak ada riwayat pembayaran.</TableCell>
                                </TableRow>
                            ) : history?.data.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-gray-800 dark:text-white/90">
                                        {item.invoice_number}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.subscription_plan?.name}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.payment_method || '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        Rp {Number(item.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={getStatusColor(item.payment_status) as any}>
                                            {item.payment_status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.payment_status === 'pending' ? (
                                            <Button 
                                                size="sm" 
                                                variant="primary"
                                                onClick={() => setUploadModal({ isOpen: true, paymentId: item.id, invoiceNumber: item.invoice_number })}
                                            >
                                                Upload Bukti
                                            </Button>
                                        ) : item.payment_status === 'confirmation' ? (
                                            <Badge color="light">SEDANG DITINJAU</Badge>
                                        ) : (
                                            <Badge color="success">AKTIF</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {history?.meta && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={history.meta.current_page}
                                lastPage={history.meta.last_page}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </ComponentCard>

            <UploadProofModal
                isOpen={uploadModal.isOpen}
                onClose={() => setUploadModal({ ...uploadModal, isOpen: false })}
                paymentId={uploadModal.paymentId}
                invoiceNumber={uploadModal.invoiceNumber}
            />
        </>
    );
}
