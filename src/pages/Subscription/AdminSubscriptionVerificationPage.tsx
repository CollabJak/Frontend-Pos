import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import {
    useFetchAllSubscriptionPayments,
    useConfirmSubscriptionPayment,
    useFetchProofImage,
    useDownloadProofImage
} from "../../hooks/useSubscriptionPlans";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, CheckCircleIcon, DownloadIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import { Input } from "../../components/form/input/InputField";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { useFetchBusiness } from "../../hooks/useBusinesses";

type SelectedBusinessPayment = {
    businessId: number;
    userName?: string | null;
};

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="mb-1 text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{label}</p>
        <p className="break-words text-sm font-medium text-gray-800 dark:text-white/90">
            {value || "-"}
        </p>
    </div>
);

export default function AdminSubscriptionVerificationPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim(), 400);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<{ id: number; invoiceNumber: string } | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [loadingImageId, setLoadingImageId] = useState<number | null>(null);
    const [selectedBusinessPayment, setSelectedBusinessPayment] = useState<SelectedBusinessPayment | null>(null);

    const { data, isLoading } = useFetchAllSubscriptionPayments({
        page,
        search: debouncedSearch || undefined,
    });
    const { data: selectedBusiness, isLoading: isLoadingBusiness } = useFetchBusiness(
        selectedBusinessPayment?.businessId ?? 0
    );

    const { mutate: confirmPayment, isPending: isConfirming } = useConfirmSubscriptionPayment();
    const { mutate: fetchImage } = useFetchProofImage();
    const { mutate: downloadProof, isPending: isDownloadingProof } = useDownloadProofImage();
    const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal();
    const [pendingConfirm, setPendingConfirm] = useState<{ id: number; invoice: string } | null>(null);

    const handleViewProof = (payment: any) => {
        setLoadingImageId(payment.id);
        fetchImage(payment.id, {
            onSuccess: (url) => {
                setSelectedPayment({
                    id: payment.id,
                    invoiceNumber: payment.invoice_number,
                });
                setSelectedImage(url);
                setIsImageModalOpen(true);
                setLoadingImageId(null);
            },
            onError: () => {
                setLoadingImageId(null);
            }
        });
    };

    const handleCloseImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setSelectedPayment(null);
    };

    const handleDownloadProof = () => {
        if (!selectedPayment) return;

        downloadProof({
            id: selectedPayment.id,
            invoiceNumber: selectedPayment.invoiceNumber,
        });
    };

    const handleOpenBusinessModal = (payment: any) => {
        if (!payment.business?.id) return;

        setSelectedBusinessPayment({
            businessId: payment.business.id,
            userName: payment.user?.name || null,
        });
    };

    const handleCloseBusinessModal = () => {
        setSelectedBusinessPayment(null);
    };

    const handleConfirmClick = (id: number, invoice: string) => {
        setPendingConfirm({ id, invoice });
        openConfirm();
    };

    const handleConfirmSubmit = () => {
        if (!pendingConfirm) return;
        confirmPayment(pendingConfirm.id, {
            onSuccess: () => {
                closeConfirm();
                setPendingConfirm(null);
            },
            onError: (err: any) => {
                console.error("Error confirming payment:", err)
            }
        });
    };

    const handleCancelConfirm = () => {
        setPendingConfirm(null);
        closeConfirm();
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        return () => {
            if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
            }
        };
    }, [selectedImage]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid": return <Badge color="success">LUNAS</Badge>;
            case "pending": return <Badge color="warning">PENDING</Badge>;
            case "confirmation": return <Badge variant="solid" color="primary">KONFIRMASI</Badge>;
            case "expired": return <Badge color="error">KADALUWARSA</Badge>;
            default: return <Badge color="light">{status.toUpperCase()}</Badge>;
        }
    };

    return (
        <>
            <PageMeta
                title="Verifikasi Langganan | POS System"
                description="Halaman verifikasi pembayaran langganan user oleh Admin."
            />
            <PageBreadcrumb pageTitle="Verifikasi Langganan" />

            <div className="space-y-6">
                <ComponentCard title="Subscription Verification List">
                    <div className="mb-4">
                        <Input
                            id="payment-search"
                            type="text"
                            placeholder="Search by invoice, business, or user name..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            {isLoading && <p className="p-3">Loading...</p>}

                            {!isLoading && (
                                <Table className="table-auto">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Invoice / Date
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Business / User
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Plan
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Amount
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Status
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {data?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                    No subscription payments found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data?.data?.map((payment: any) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                            {payment.invoice_number}
                                                        </span>
                                                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                            {new Date(payment.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {payment.business?.id ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenBusinessModal(payment)}
                                                                aria-label={`Lihat detail business ${payment.business?.name || ""}`}
                                                                className="group block max-w-[220px] rounded-md text-left focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                                            >
                                                                <span className="block truncate font-medium text-gray-800 text-theme-sm transition-colors group-hover:text-brand-600 group-hover:underline dark:text-white/90 dark:group-hover:text-brand-400">
                                                                    {payment.business?.name || "N/A"}
                                                                </span>
                                                                <span className="block truncate text-gray-500 text-theme-xs dark:text-gray-400">
                                                                    {payment.user?.name || "-"}
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                                    N/A
                                                                </span>
                                                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                    {payment.user?.name || "-"}
                                                                </span>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {payment.subscription_plan?.name}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-800 font-bold text-theme-sm dark:text-white/90">
                                                        Rp {parseFloat(payment.amount).toLocaleString("id-ID")}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {getStatusBadge(payment.payment_status)}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-end">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewProof(payment)}
                                                                disabled={loadingImageId === payment.id || payment.payment_status === 'pending' || payment.payment_status === 'expired'}
                                                                startIcon={<EyeIcon className="size-5 text-gray-500" />}
                                                            >
                                                                {loadingImageId === payment.id ? "..." : "Lihat"}
                                                            </Button>
                                                            {payment.payment_status === "confirmation" && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleConfirmClick(payment.id, payment.invoice_number)}
                                                                    disabled={isConfirming}
                                                                    startIcon={<CheckCircleIcon className="size-5 text-white" />}
                                                                >
                                                                    Verifikasi
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}

                            {data?.meta && (
                                <Pagination
                                    currentPage={data.meta.current_page}
                                    lastPage={data.meta.last_page}
                                    onPageChange={setPage}
                                />
                            )}
                        </div>
                    </div>
                </ComponentCard>
            </div>

            {/* Image Modal */}
            <Modal
                isOpen={isImageModalOpen}
                onClose={handleCloseImageModal}
                className="max-w-2xl"
            >
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold dark:text-white mb-4">Bukti Pembayaran</h3>
                    {selectedImage ? (
                        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
                            <img
                                src={selectedImage}
                                alt="Bukti Pembayaran"
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">Tidak ada gambar untuk ditampilkan.</p>
                    )}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleCloseImageModal}
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleDownloadProof}
                            disabled={!selectedPayment}
                            isLoading={isDownloadingProof}
                            startIcon={<DownloadIcon className="size-5 text-white" />}
                        >
                            Download
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Business Detail Modal */}
            <Modal
                isOpen={!!selectedBusinessPayment}
                onClose={handleCloseBusinessModal}
                className="max-w-2xl"
            >
                <div className="p-6">
                    <div className="mb-6 pr-12">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            Business Detail
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Informasi business yang terdaftar pada menu Business.
                        </p>
                    </div>

                    {isLoadingBusiness ? (
                        <p className="rounded-lg border border-gray-100 p-4 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                            Loading business detail...
                        </p>
                    ) : selectedBusiness ? (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-100 p-4 dark:border-white/[0.05]">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
                                        Business
                                    </p>
                                    <h4 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                                        {selectedBusiness.name}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Registered user: {selectedBusinessPayment?.userName || "-"}
                                    </p>
                                </div>
                                {selectedBusiness.is_active ? (
                                    <Badge color="success">Active</Badge>
                                ) : (
                                    <Badge color="error">Inactive</Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailItem label="Code" value={selectedBusiness.code} />
                                <DetailItem label="Email" value={selectedBusiness.email} />
                                <DetailItem label="Phone" value={selectedBusiness.phone} />
                                <DetailItem label="Address" value={selectedBusiness.address} />
                            </div>
                        </div>
                    ) : (
                        <p className="rounded-lg border border-gray-100 p-4 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                            Business detail tidak tersedia.
                        </p>
                    )}

                    <div className="mt-6">
                        <Button variant="outline" fullWidth onClick={handleCloseBusinessModal}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Confirm Payment?"
                description={
                    pendingConfirm
                        ? `Are you sure you want to confirm the payment for invoice "${pendingConfirm.invoice}"? This will activate the subscription.`
                        : "Confirming this payment will activate the subscription."
                }
                confirmText="Confirm"
                cancelText="Cancel"
                tone="info"
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelConfirm}
            />
        </>
    );
}
