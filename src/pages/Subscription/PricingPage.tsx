import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useFetchSubscriptionPlans } from "../../hooks/useSubscriptionPlans";
import Button from "../../components/ui/button/Button";
import { CheckCircleIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";

export default function PricingPage() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const { data, isLoading } = useFetchSubscriptionPlans({ page: 1 });

    // Filter plans by billing cycle
    const plans = data?.data.filter(plan => plan.billing_cycle === billingCycle) || [];

    const handleSubscribe = (planId: number) => {
        navigate(`/pricing/checkout/${planId}`);
    };

    return (
        <>
            <PageMeta title="Pricing Plans" description="Choose the best plan for your business." />
            <PageBreadcrumb pageTitle="Subscription Pricing" />

            <div className="flex flex-col items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                    Paket Langganan POS
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl text-center">
                    Pilih paket yang sesuai dengan skala bisnis Anda. Dapatkan fitur lengkap untuk mengelola inventaris, transaksi, dan laporan harian.
                </p>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-white/[0.03] p-1 rounded-xl">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "monthly"
                                ? "bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Bulanan
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "yearly"
                                ? "bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Tahunan
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <p className="text-gray-500">Memuat paket langganan...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${plan.is_popular
                                    ? "border-brand-500 bg-white dark:bg-white/[0.03] shadow-xl scale-105 z-10"
                                    : "border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[(0.02)]"
                                }`}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge color="success">PALING POPULER</Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                        Rp {Number(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        /{plan.billing_cycle === 'monthly' ? 'bulan' : 'tahun'}
                                    </span>
                                </div>
                                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm h-12 overflow-hidden">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                <p className="font-semibold text-gray-800 dark:text-white/90 text-sm">FITUR UNGGULAN:</p>
                                <ul className="space-y-3">
                                    {Object.entries(plan.features || {}).map(([key, value]) => (
                                        <li key={key} className="flex items-start gap-3">
                                            <CheckCircleIcon className="size-5 text-green-500 shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {key.replace(/_/g, ' ')}: <span className="font-medium text-gray-800 dark:text-white/80">
                                                    {typeof value === 'boolean'
                                                        ? (value ? "Tersedia" : "Tidak Tersedia")
                                                        : (value as any)}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                    {(!plan.features || Object.keys(plan.features).length === 0) && (
                                        <li className="text-sm text-gray-400 italic">Lihat detail fitur lengkap di panduan.</li>
                                    )}
                                </ul>
                            </div>

                            <Button
                                fullWidth
                                variant={plan.is_popular ? "primary" : "outline"}
                                size="md"
                                className="rounded-2xl font-bold"
                                onClick={() => handleSubscribe(plan.id)}
                            >
                                Pilih Paket Ini
                            </Button>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/[0.05] rounded-3xl">
                            <p className="text-gray-500">Tidak ada paket langganan yang tersedia untuk siklus ini.</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
