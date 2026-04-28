import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadProofSchema, UploadProofFormData } from "../../Schemas/UploadProofSchema";
import { useUploadPaymentProof } from "../../hooks/useSubscriptionPlans";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../../components/form/Label";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface UploadProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: number;
    invoiceNumber: string;
}

export default function UploadProofModal({ isOpen, onClose, paymentId, invoiceNumber }: UploadProofModalProps) {
    const [files, setFiles] = useState<any[]>([]);
    const { mutate: uploadProof, isPending } = useUploadPaymentProof();

    const {
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        register
    } = useForm<UploadProofFormData>({
        resolver: zodResolver(UploadProofSchema),
    });

    React.useEffect(() => {
        register("file");
    }, [register]);

    const onSubmit = (data: UploadProofFormData) => {
        uploadProof({
            id: paymentId,
            file: (data.file as any)[0],
        }, {
            onSuccess: () => {
                setFiles([]);
                reset();
                onClose();
            },
            onError: (err: any) => {
                console.error("Upload error:", err);
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setFiles([]);
                reset();
                onClose();
            }}
            className="max-w-md"
        >
            <div className="p-6">
                <h3 className="text-xl font-bold dark:text-white mb-4">
                    Upload Bukti Bayar - {invoiceNumber}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="file">Pilih Gambar Bukti Transfer</Label>

                        <FilePond
                            {...({
                                files: files,
                                onupdatefiles: (fileItems: any) => {
                                    setFiles(fileItems);
                                    if (fileItems.length > 0) {
                                        setValue("file", [fileItems[0].file] as any, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true
                                        });
                                    } else {
                                        setValue("file", null as any, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true
                                        });
                                    }
                                },
                                allowMultiple: false,
                                maxFiles: 1,
                                name: "file",
                                labelIdle: 'Klik untuk upload atau <span class="filepond--label-action">drag and drop</span><br><span class="text-xs text-gray-400">PNG, JPG atau JPEG (MAX. 2MB)</span>',
                                acceptedFileTypes: ['image/*'],
                                labelFileTypeNotAllowed: "File tidak valid",
                                fileValidateTypeLabelExpectedTypes: "Hanya file gambar (PNG, JPG, JPEG)"
                            } as any)}
                        />

                        {errors.file && <p className="text-xs text-red-500 mt-2">{errors.file.message as string}</p>}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            disabled={isPending}
                        >
                            {isPending ? "Mengirim..." : "Kirim Bukti Bayar"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

