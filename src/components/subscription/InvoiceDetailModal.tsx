import React from "react";
import { Modal } from "../ui/modal";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { useFetchBillingHistoryDetail } from "../../hooks/useSubscriptionPlans";
import { PaymentStatus } from "../../types/subscription";

interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: number | null;
}

const getStatusColor = (status?: PaymentStatus) => {
    switch (status) {
        case "paid": return "success";
        case "pending": return "warning";
        case "confirmation": return "info";
        case "failed":
        case "expired":
        case "cancelled": return "error";
        default: return "light";
    }
};

const formatCurrency = (value?: string) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{value || "-"}</p>
    </div>
);

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, paymentId }) => {
    const { data, isLoading, isError } = useFetchBillingHistoryDetail(paymentId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[760px] m-4">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Invoice</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Informasi tagihan, subscriber, bisnis, dan paket langganan.</p>
                    </div>
                    {data?.payment_status && (
                        <Badge color={getStatusColor(data.payment_status)}>
                            {data.payment_status.toUpperCase()}
                        </Badge>
                    )}
                </div>

                {isLoading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Memuat detail invoice...</p>
                ) : isError ? (
                    <p className="text-sm text-error-500">Gagal memuat detail invoice.</p>
                ) : data ? (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-100 p-5 dark:border-white/[0.05]">
                            <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Informasi Invoice</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DetailItem label="Nomor Invoice" value={data.invoice_number} />
                                <DetailItem label="Tanggal Invoice" value={formatDate(data.created_at)} />
                                <DetailItem label="Tanggal Bayar" value={formatDate(data.paid_at)} />
                                <DetailItem label="Metode Pembayaran" value={data.payment_method} />
                                <DetailItem label="Subtotal" value={formatCurrency(data.subtotal)} />
                                <DetailItem label="Pajak" value={formatCurrency(data.tax_amount)} />
                                <DetailItem label="Total" value={formatCurrency(data.amount)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 p-5 dark:border-white/[0.05]">
                                <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Informasi Subscriber</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Nama User" value={data.user?.name} />
                                    <DetailItem label="Email User" value={data.user?.email} />
                                    <DetailItem label="Nama Billing" value={data.billing_name} />
                                    <DetailItem label="Email Billing" value={data.billing_email} />
                                    <DetailItem label="Telepon Billing" value={data.billing_phone} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-5 dark:border-white/[0.05]">
                                <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Informasi Bisnis</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Nama Bisnis" value={data.business?.name} />
                                    <DetailItem label="Kode Bisnis" value={data.business?.code} />
                                    <DetailItem label="Email Bisnis" value={data.business?.email} />
                                    <DetailItem label="Telepon Bisnis" value={data.business?.phone} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 p-5 dark:border-white/[0.05]">
                            <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Detail Subscription</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <DetailItem label="Paket" value={data.subscription_plan?.name} />
                                <DetailItem label="Durasi" value={`${data.subscription_plan?.duration || 0} hari`} />
                                <DetailItem label="Billing Cycle" value={data.subscription_plan?.billing_cycle} />
                                <DetailItem label="Harga Paket" value={formatCurrency(data.subscription_plan?.price)} />
                                <DetailItem label="Maksimal Lokasi" value={data.subscription_plan?.features?.max_locations ?? "Tidak terbatas"} />
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="mt-8 flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceDetailModal;
