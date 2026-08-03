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

    const formatTypeButtonText = (type: string) => {
        switch (type) {
            case 'bank_transfer': return 'Transfer Bank';
            case 'qris': return 'QRIS';
            case 'e_wallet': return 'E-Wallet';
            case 'cash': return 'Tunai';
            default: return type.replace('_', ' ').toUpperCase();
        }
    };

    if (isEdit && isFetching) return <div className="p-10 text-center">Memuat data metode pembayaran...</div>;

    return (
        <>
            <PageMeta
                title={isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                description="Konfigurasi pengaturan metode pembayaran."
            />
            <PageBreadcrumb pageTitle={isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'} />

            <div className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ComponentCard title="Identitas Metode" className="md:col-span-1">
                            <div className="space-y-4 pt-2">
                                {isAdmin ? (
                                    <div>
                                        <Label>Cakupan (Scope)</Label>
                                        <select
                                            {...register('scope')}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white"
                                        >
                                            <option value="business">Bisnis (POS)</option>
                                            <option value="system">Sistem (Langganan)</option>
                                        </select>
                                        {errors.scope && <p className="text-xs text-red-500 mt-1">{errors.scope.message as any}</p>}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">
                                        <Label className="text-gray-400">Cakupan (Scope)</Label>
                                        <div className="font-bold text-brand-500 capitalize">
                                            {selectedScope === 'business' ? 'Bisnis (POS)' : selectedScope === 'system' ? 'Sistem (Langganan)' : selectedScope}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label>Tipe Pembayaran</Label>
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
                                                {formatTypeButtonText(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="name">Nama Tampilan</Label>
                                    <Input
                                        {...register('name')}
                                        placeholder="contoh: Bank BCA Operasional"
                                        error={!!errors.name}
                                        hint={errors.name?.message as any}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="code">Kode Internal (Slug)</Label>
                                    <Input
                                        {...register('code')}
                                        placeholder="contoh: bca_ops"
                                    />
                                </div>
                            </div>
                        </ComponentCard>

                        <ComponentCard title="Detail Pembayaran" className="md:col-span-1">
                            <div className="space-y-4 pt-2">
                                {selectedType === 'cash' ? (
                                    <div className="py-10 text-center text-gray-500 italic">
                                        <p>Metode tunai tidak membutuhkan akun bank atau kode QR.</p>
                                    </div>
                                ) : selectedType === 'qris' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Gambar Kode QR (QRIS)</Label>
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
                                                <p className="text-xs text-gray-500 mt-2">Unggah gambar QRIS sebelum menyimpan metode ini.</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="provider_name">Nama Penyedia / Bank (Opsional)</Label>
                                            <Input {...register('provider_name')} placeholder="contoh: Danamon / GoPay" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <Label htmlFor="provider_name">
                                                {selectedType === 'bank_transfer' ? 'Nama Bank' : 'Penyedia E-Wallet'}
                                            </Label>
                                            <Input
                                                {...register('provider_name')}
                                                placeholder={selectedType === 'bank_transfer' ? 'contoh: BCA' : 'contoh: GoPay'}
                                                error={!!errors.provider_name}
                                                hint={errors.provider_name?.message as any}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
                                            <Input
                                                {...register('account_name')}
                                                placeholder="contoh: Budi Santoso"
                                                error={!!errors.account_name}
                                                hint={errors.account_name?.message as any}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="account_number">
                                                {selectedType === 'bank_transfer' ? 'Nomor Rekening' : 'Nomor Telepon / HP'}
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

                        <ComponentCard title="Konfigurasi & Status" className="md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                        <div>
                                            <div className="font-bold dark:text-white text-sm">Status Aktif</div>
                                            <div className="text-xs text-gray-500 text-[10px]">Metode akan tampil dan dapat digunakan</div>
                                        </div>
                                        <input type="checkbox" {...register('is_active')} className="size-5 rounded accent-brand-500" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border-2 border-brand-500/10">
                                        <div>
                                            <div className="font-bold dark:text-white text-brand-600 text-sm">Metode Utama (Default)</div>
                                            <div className="text-xs text-gray-500 text-brand-500/70 text-[10px]">Menonaktifkan status utama metode lain dalam tipe/cakupan yang sama</div>
                                        </div>
                                        <input type="checkbox" {...register('is_default')} className="size-5 rounded accent-brand-500" />
                                    </div>

                                    <div>
                                        <Label>Urutan Tampilan</Label>
                                        <Input type="number" {...register('sort_order', { valueAsNumber: true })} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Instruksi Pembayaran</Label>
                                        <textarea
                                            {...register('payment_instructions')}
                                            className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white text-sm"
                                            placeholder="Masukkan langkah-langkah pembayaran, contoh: Buka aplikasi m-BCA, pilih menu Transfer..."
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
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                >
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan Metode Pembayaran'}
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
