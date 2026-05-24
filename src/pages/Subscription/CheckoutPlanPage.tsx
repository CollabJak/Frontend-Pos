import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetchSubscriptionPlan, useSubscriptionCheckout } from "../../hooks/useSubscriptionPlans";
import { useFetchPaymentMethodOptions } from "../../hooks/usePaymentMethods";
import { useFetchBusinesses } from "../../hooks/useBusinesses";
import { CheckoutSchema, CheckoutFormData } from "../../Schemas/CheckoutSchema";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Badge from "../../components/ui/badge/Badge";
import { CheckCircleIcon, CreditCardIcon, EyeIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";

export default function CheckoutPlanPage() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
    const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false);
    const [_, setCheckoutResult] = React.useState<any>(null);

    const { data: plan, isLoading: isPlanLoading } = useFetchSubscriptionPlan(parseInt(planId || "0", 10));
    const { data: businesses, isLoading: isBusinessesLoading } = useFetchBusinesses({ page: 1 });
    const { data: paymentMethods = [], isLoading: isMethodsLoading } = useFetchPaymentMethodOptions('system');
    const { mutate: checkout, isPending: isCheckingOut } = useSubscriptionCheckout();
    const business = businesses?.data?.[0];

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            business_name: "",
            email: "",
            phone: "",
        },
    });

    const selectedPaymentMethodId = watch("payment_method_id");
    const activeMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);

    useEffect(() => {
        if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
            const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
            setValue("payment_method_id", defaultMethod.id);
        }
    }, [paymentMethods, setValue, selectedPaymentMethodId]);

    useEffect(() => {
        if (!business) return;

        setValue("business_name", business.name, { shouldValidate: true });
        setValue("email", business.email, { shouldValidate: true });
        setValue("phone", business.phone || "", { shouldValidate: true });
    }, [business, setValue]);

    const onSubmit = (data: CheckoutFormData) => {
        if (!plan) return;
        if (!business) {
            setError("root", {
                type: "manual",
                message: "Business belum tersedia. Silakan buat business terlebih dahulu.",
            });
            return;
        }

        checkout({
            subscription_plan_id: plan.id,
            payment_method_id: data.payment_method_id,
            business_name: data.business_name,
            email: data.email,
            phone: data.phone,
        }, {
            onSuccess: (res) => {
                setCheckoutResult(res);
                setIsSuccessModalOpen(true);
            },
        });
    };

    if (isPlanLoading || isMethodsLoading || isBusinessesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Memuat detail paket...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Paket Tidak Ditemukan</h2>
                <Button onClick={() => navigate("/pricing")}>Kembali ke Daftar Paket</Button>
            </div>
        );
    }

    if (!business) {
        return (
            <>
                <PageMeta title="Checkout" description="Complete your subscription purchase." />
                <PageBreadcrumb pageTitle="Checkout" />
                <div className="mx-auto max-w-2xl">
                    <ComponentCard title="Business Information Required">
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Business belum tersedia untuk akun ini. Silakan buat business terlebih dahulu sebelum melakukan checkout subscription.
                            </p>
                            <Button onClick={() => navigate("/businesses/create")}>
                                Buat Business
                            </Button>
                        </div>
                    </ComponentCard>
                </div>
            </>
        );
    }

    const subtotal = Number(plan.price);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    return (
        <>
            <PageMeta title="Checkout" description="Complete your subscription purchase." />
            <PageBreadcrumb pageTitle="Checkout" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Left Section: Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">CHECKOUT</span>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">Complete your subscription</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                        {/* Step 1: Business Information */}
                        <ComponentCard title="1. Business Information" className="shadow-sm">
                            {errors.root?.message && (
                                <p className="mb-4 text-sm text-red-500">{errors.root.message}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                <div>
                                    <Label htmlFor="business_code">Business Code</Label>
                                    <Input
                                        id="business_code"
                                        value={business.code}
                                        readOnly
                                        className="!bg-gray-50 dark:!bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="business_name">Business Name</Label>
                                    <Input
                                        {...register("business_name")}
                                        id="business_name"
                                        placeholder="Your business name"
                                        readOnly
                                        className="!bg-gray-50 dark:!bg-gray-800"
                                    />
                                    {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name.message as any}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        id="email"
                                        placeholder="business@example.com"
                                        readOnly
                                        className="!bg-gray-50 dark:!bg-gray-800"
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as any}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        {...register("phone")}
                                        id="phone"
                                        placeholder="+62 812..."
                                        readOnly
                                        className="!bg-gray-50 dark:!bg-gray-800"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as any}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="business_address">Address</Label>
                                    <TextArea
                                        value={business.address || ""}
                                        rows={3}
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800"
                                    />
                                </div>
                            </div>
                        </ComponentCard>

                        {/* Step 2: Payment Method */}
                        <ComponentCard title="2. Payment Method" className="shadow-sm">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setValue("payment_method_id", method.id)}
                                            className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedPaymentMethodId === method.id
                                                ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                                                : "border-gray-100 dark:border-white/[0.05] hover:border-gray-200 dark:hover:border-white/[0.1] text-gray-500"
                                                }`}
                                        >
                                            <div className={`p-2 rounded-full mb-2 ${selectedPaymentMethodId === method.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/[0.05]"}`}>
                                                {(method.type as string) === 'credit_card' ? <CreditCardIcon className="size-5" /> :
                                                    method.type === 'qris' ? <div className="font-bold text-[10px]">QRIS</div> :
                                                        <div className="font-bold text-[10px]">{method.provider_name || 'BANK'}</div>}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-tight text-center ${selectedPaymentMethodId === method.id ? "text-white" : "text-gray-700 dark:text-gray-400"}`}>
                                                {method.name}
                                            </span>
                                            {method.is_default && <span className={`text-[8px] uppercase font-bold mt-1 ${selectedPaymentMethodId === method.id ? 'text-white/70' : 'text-brand-500'}`}>DEFAULT</span>}
                                        </div>
                                    ))}
                                </div>
                                {errors.payment_method_id && <p className="text-xs text-red-500 mt-1">{errors.payment_method_id.message as any}</p>}

                                {paymentMethods.length === 0 && (
                                    <div className="py-8 text-center bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-400">No payment methods available for subscription.</p>
                                    </div>
                                )}

                                {paymentMethods.find(m => m.id === selectedPaymentMethodId) && paymentMethods.find(m => m.id === selectedPaymentMethodId)?.type !== 'cash' && (
                                    <div className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            Payment Details
                                        </h4>

                                        {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.type === 'qris' ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                                 <div 
                                                     onClick={() => setIsZoomModalOpen(true)}
                                                     className="relative group cursor-pointer p-3 bg-white rounded-2xl shadow-sm border border-gray-100 ring-4 ring-brand-500/5 transition-all hover:scale-[1.03] hover:ring-brand-500/15 overflow-hidden"
                                                 >
                                                     <img
                                                         src={paymentMethods.find(m => m.id === selectedPaymentMethodId)?.qr_image_url || undefined}
                                                         alt="QR Code"
                                                         className="size-32 object-contain transition-transform duration-300 group-hover:scale-105"
                                                     />
                                                     
                                                     {/* Sleek Overlay Hover */}
                                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                                                         <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white ring-1 ring-white/30 transform scale-95 group-hover:scale-100 transition-all duration-300">
                                                             <EyeIcon className="size-6" />
                                                         </div>
                                                     </div>

                                                     {/* Floating Eye Button */}
                                                     <button
                                                         type="button"
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             setIsZoomModalOpen(true);
                                                         }}
                                                         className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:text-brand-500 hover:bg-brand-50 hover:scale-105 transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                                     >
                                                         <EyeIcon className="size-4" />
                                                     </button>
                                                 </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Merchant Name</div>
                                                        <div className="text-sm font-bold dark:text-white">{paymentMethods.find(m => m.id === selectedPaymentMethodId)?.provider_name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Instructions</div>
                                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                                            {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.payment_instructions || 'Scan the QR code with your banking or e-wallet app.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-100 dark:border-white/[0.05]">
                                                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-1">Account Number</div>
                                                    <div className="text-lg font-mono font-black text-brand-600 dark:text-brand-400">
                                                        {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.account_number}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-100 dark:border-white/[0.05]">
                                                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-1">Account Holder</div>
                                                    <div className="text-sm font-black dark:text-white truncate">
                                                        {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.account_name}
                                                    </div>
                                                </div>
                                                {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.payment_instructions && (
                                                    <div className="sm:col-span-2 p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-xl border border-brand-100/50 dark:border-brand-500/10">
                                                        <div className="text-[10px] text-brand-500 uppercase font-black tracking-tighter mb-1">How to pay</div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                                            {paymentMethods.find(m => m.id === selectedPaymentMethodId)?.payment_instructions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ComponentCard>

                        <div className="hidden lg:block lg:pt-4">
                            <Button
                                type="submit"
                                fullWidth
                                size="md"
                                disabled={isCheckingOut || !business}
                            >
                                {isCheckingOut ? "Processing Transaction..." : "Complete Secure Purchase"}
                            </Button>
                            <p className="text-[10px] text-gray-400 text-center mt-3">
                                By clicking the button, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Section: Order Summary (Sticky) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <ComponentCard title="Order Summary" className="shadow-lg border-brand-100 dark:border-white/[0.08]">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.05]">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-tighter">
                                            {plan.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} Billing
                                        </p>
                                    </div>
                                    <Badge color="success">ACTIVE</Badge>
                                </div>

                                <ul className="space-y-3">
                                    {Object.entries(plan.features || {}).map(([key, value]) => (
                                        <li key={key} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CheckCircleIcon className="size-4 text-green-500" />
                                            <span>
                                                {key === 'max_locations' && `${value} Business Locations`}
                                                {key === 'max_products' && `${value} Products Catalog`}
                                                {key === 'has_face_recognition' && (value ? "Face Recognition Available" : "Face Recognition Not Available")}
                                                {key === 'support_type' && (String(value).includes('priority') ? "Priority Email Support" : "Standard Email Support")}
                                                {!['max_locations', 'max_products', 'has_face_recognition', 'support_type'].includes(key) && `${key.replace(/_/g, ' ')}: ${value}`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Input className="text-xs h-9" placeholder="Promo Code" />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4"
                                            disabled
                                        >
                                            Apply
                                        </Button>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">PPN (11%)</span>
                                            <span className="font-medium">Rp {tax.toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-brand-600 dark:text-brand-400 pt-2">
                                            <span>Total Amount</span>
                                            <span>Rp {total.toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>

                        <div className="lg:hidden">
                            <Button
                                onClick={handleSubmit(onSubmit as any)}
                                fullWidth
                                size="lg"
                                disabled={isCheckingOut || !business}
                            >
                                {isCheckingOut ? "Processing..." : "Complete Purchase"}
                            </Button>
                        </div>

                        <div className="flex flex-col items-center gap-3 px-4">
                            <div className="flex items-center gap-4 opacity-50 grayscale">
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 border border-gray-300 px-1 rounded">IDR</span>
                                <Badge color="light" size="sm">Verified Merchant</Badge>
                                <Badge color="light" size="sm">Instant Activation</Badge>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center">
                                Secure encrypted checkout provided by our payment partners.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    navigate("/billing");
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold dark:text-white mb-4 text-center">Checkout Berhasil!</h3>
                    <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="size-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <CheckCircleIcon className="size-12" />
                    </div>
                    
                    <h3 className="text-xl font-bold dark:text-white">Pesanan Anda Telah Dicatat</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Silakan lakukan pembayaran sebesar:
                    </p>
                    <div className="text-3xl font-black text-brand-600 dark:text-brand-400">
                        Rp {total.toLocaleString("id-ID")}
                    </div>

                    <div className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.05] space-y-3 text-left">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 uppercase font-bold tracking-widest">Metode Bayar</span>
                            <span className="font-bold dark:text-white">{activeMethod?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 uppercase font-bold tracking-widest">Rekening</span>
                            <span className="font-mono font-bold text-brand-500">{activeMethod?.account_number}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 uppercase font-bold tracking-widest">Atas Nama</span>
                            <span className="font-bold dark:text-white">{activeMethod?.account_name}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed italic">
                        *Harap simpan bukti transfer dan upload di halaman Riwayat Tagihan untuk aktivasi instan.
                    </p>

                    <div className="w-full pt-4 space-y-3">
                        <Button fullWidth onClick={() => navigate("/billing")}>
                            Beralih ke Riwayat Tagihan
                        </Button>
                        <Button fullWidth variant="outline" onClick={() => setIsSuccessModalOpen(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>

        <Modal
            isOpen={isZoomModalOpen}
            onClose={() => setIsZoomModalOpen(false)}
            className="max-w-lg"
        >
            <div className="p-6">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <EyeIcon className="size-5 text-brand-500" />
                        QR Code Pembayaran
                    </h3>
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-inner mb-6">
                    <img
                        src={activeMethod?.qr_image_url || undefined}
                        alt="QR Code Zoomed"
                        className="max-h-[50vh] w-auto max-w-full object-contain rounded-lg ring-1 ring-gray-100"
                    />
                </div>

                <div className="p-4 bg-brand-50 dark:bg-brand-500/5 rounded-xl border border-brand-100/50 dark:border-brand-500/10 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Pindai kode QR di atas menggunakan aplikasi perbankan atau e-wallet Anda untuk menyelesaikan pembayaran.
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setIsZoomModalOpen(false)} variant="outline">
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
        </>
    );
}
