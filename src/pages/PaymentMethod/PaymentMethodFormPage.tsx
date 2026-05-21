import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPaymentMethodSchema, PaymentMethodSchemaType } from '../../Schemas/PaymentMethodSchema';
import { useCreatePaymentMethod, useUpdatePaymentMethod, useFetchPaymentMethod } from '../../hooks/usePaymentMethods';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { Input } from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { useAuth } from '../../hooks/useAuth';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const PaymentMethodFormPage: React.FC = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(role => role === 'admin');

    const { data: initialData, isLoading: isFetching } = useFetchPaymentMethod(id);
    const createMutation = useCreatePaymentMethod();
    const updateMutation = useUpdatePaymentMethod(id || 0);
    const hasExistingQrImage = Boolean(initialData?.qr_image_path || initialData?.qr_image_url);
    const paymentMethodSchema = useMemo(
        () => createPaymentMethodSchema({ hasExistingQrImage }),
        [hasExistingQrImage]
    );

    const { register, handleSubmit, watch, setValue, clearErrors, formState: { errors } } = useForm<any>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            scope: isAdmin ? 'system' : 'business',
            type: 'bank_transfer',
            is_active: true,
            is_default: false,
            sort_order: 0,
        }
    });

    const selectedType = watch('type');
    const selectedScope = watch('scope');
    const qrImage = watch('qr_image');
    const isQrImageRequired = selectedType === 'qris' && !hasExistingQrImage;

    useEffect(() => {
        if (initialData) {
            setValue('scope', initialData.scope);
            setValue('type', initialData.type);
            setValue('name', initialData.name);
            setValue('code', initialData.code || '');
            setValue('provider_name', initialData.provider_name || '');
            setValue('account_name', initialData.account_name || '');
            setValue('account_number', initialData.account_number || '');
            setValue('description', initialData.description || '');
            setValue('payment_instructions', initialData.payment_instructions || '');
            setValue('is_active', initialData.is_active);
            setValue('is_default', initialData.is_default);
            setValue('sort_order', initialData.sort_order);
        }
    }, [initialData, setValue]);

    const [qrPreview, setQrPreview] = useState<string | null>(null);

    useEffect(() => {
        if (selectedType !== 'qris') {
            clearErrors('qr_image');
        }
    }, [clearErrors, selectedType]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('qr_image', file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => setQrPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setValue('qr_image', null, { shouldValidate: true });
            setQrPreview(null);
        }
    };

    const onSubmit = (data: PaymentMethodSchemaType) => {
        if (isEdit) {
            updateMutation.mutate(data as any);
        } else {
            createMutation.mutate(data as any);
        }
    };

    if (isEdit && isFetching) return <div className="p-10 text-center">Loading method data...</div>;

    return (
        <>
            <PageMeta
                title={isEdit ? 'Edit Payment Method' : 'Create Payment Method'}
                description="Configuration for payment processing."
            />
            <PageBreadcrumb pageTitle={isEdit ? 'Edit Payment Method' : 'Create Payment Method'} />

            <div className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ComponentCard title="Method Identity" className="md:col-span-1">
                            <div className="space-y-4 pt-2">
                                {isAdmin ? (
                                    <div>
                                        <Label>Scope</Label>
                                        <select
                                            {...register('scope')}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white"
                                        >
                                            <option value="business">Business (POS)</option>
                                            <option value="system">System (Subscription)</option>
                                        </select>
                                        {errors.scope && <p className="text-xs text-red-500 mt-1">{errors.scope.message as any}</p>}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">
                                        <Label className="text-gray-400">Scope</Label>
                                        <div className="font-bold text-brand-500 capitalize">{selectedScope}</div>
                                    </div>
                                )}

                                <div>
                                    <Label>Method Type</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['bank_transfer', 'qris', 'e_wallet', 'cash'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setValue('type', type as any, { shouldValidate: true })}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${selectedType === type
                                                    ? 'bg-brand-500 border-brand-500 text-white shadow-lg'
                                                    : 'border-gray-100 dark:border-white/[0.05] text-gray-500 hover:border-gray-200'
                                                    }`}
                                            >
                                                {type.replace('_', ' ').toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        {...register('name')}
                                        placeholder="e.g. Bank BCA Operasional"
                                        error={!!errors.name}
                                        hint={errors.name?.message as any}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="code">Internal Code (Slug)</Label>
                                    <Input
                                        {...register('code')}
                                        placeholder="e.g. bca_ops"
                                    />
                                </div>
                            </div>
                        </ComponentCard>

                        <ComponentCard title="Payment Details" className="md:col-span-1">
                            <div className="space-y-4 pt-2">
                                {selectedType === 'cash' ? (
                                    <div className="py-10 text-center text-gray-500 italic">
                                        <p>Cash method doesn't need bank accounts or QR codes.</p>
                                    </div>
                                ) : selectedType === 'qris' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>QR Code Image</Label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={onFileChange}
                                                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 ${errors.qr_image ? 'text-red-500' : ''}`}
                                            />
                                            {errors.qr_image && (
                                                <p className="text-xs text-red-500 mt-1">{errors.qr_image.message as any}</p>
                                            )}
                                            {(qrPreview || initialData?.qr_image_url) && (
                                                <div className="mt-4 p-4 border rounded-2xl border-dashed border-gray-200 dark:border-white/[0.1] text-center">
                                                    <img
                                                        src={qrPreview || initialData?.qr_image_url || ''}
                                                        alt="QR Preview"
                                                        className="max-h-40 mx-auto rounded-lg"
                                                    />
                                                </div>
                                            )}
                                            {isQrImageRequired && !qrImage && !qrPreview && (
                                                <p className="text-xs text-gray-500 mt-2">Upload QRIS image before saving this method.</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="provider_name">Provider Name (Optional)</Label>
                                            <Input {...register('provider_name')} placeholder="e.g. Danamon / GoPay" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <Label htmlFor="provider_name">
                                                {selectedType === 'bank_transfer' ? 'Bank Name' : 'E-Wallet Provider'}
                                            </Label>
                                            <Input
                                                {...register('provider_name')}
                                                placeholder={selectedType === 'bank_transfer' ? 'e.g. BCA' : 'e.g. GoPay'}
                                                error={!!errors.provider_name}
                                                hint={errors.provider_name?.message as any}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="account_name">Account Holder Name</Label>
                                            <Input
                                                {...register('account_name')}
                                                placeholder="John Doe"
                                                error={!!errors.account_name}
                                                hint={errors.account_name?.message as any}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="account_number">
                                                {selectedType === 'bank_transfer' ? 'Account Number' : 'Phone Number'}
                                            </Label>
                                            <Input
                                                {...register('account_number')}
                                                placeholder="123456789"
                                                error={!!errors.account_number}
                                                hint={errors.account_number?.message as any}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </ComponentCard>

                        <ComponentCard title="Configuration & Status" className="md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                        <div>
                                            <div className="font-bold dark:text-white text-sm">Active Status</div>
                                            <div className="text-xs text-gray-500 text-[10px]">Method will be visible to users</div>
                                        </div>
                                        <input type="checkbox" {...register('is_active')} className="size-5 rounded accent-brand-500" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border-2 border-brand-500/10">
                                        <div>
                                            <div className="font-bold dark:text-white text-brand-600 text-sm">Default Method</div>
                                            <div className="text-xs text-gray-500 text-brand-500/70 text-[10px]">Unset other defaults in same scope/type</div>
                                        </div>
                                        <input type="checkbox" {...register('is_default')} className="size-5 rounded accent-brand-500" />
                                    </div>

                                    <div>
                                        <Label>Sort Order</Label>
                                        <Input type="number" {...register('sort_order', { valueAsNumber: true })} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Payment Instructions</Label>
                                        <textarea
                                            {...register('payment_instructions')}
                                            className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white text-sm"
                                            placeholder="Add steps to pay e.g. Login to m-BCA, select Transfer..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-white/[0.05] pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/payment-methods')}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                >
                                    {isEdit ? 'Update Method' : 'Save Method'}
                                </Button>
                            </div>
                        </ComponentCard>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PaymentMethodFormPage;
