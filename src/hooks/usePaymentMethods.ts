import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import { PaymentMethod, PaymentMethodFormData } from '../types/payment-method';
import { useNavigate } from 'react-router-dom';

export const useFetchPaymentMethods = (filters: any = {}) => {
    return useQuery({
        queryKey: ['payment-methods', filters],
        queryFn: async () => {
            const { data } = await apiClient.get('/payment-methods', { params: filters });
            return data.data;
        },
    });
};

export const useFetchPaymentMethodOptions = (context: 'system' | 'bussines' = 'bussines') => {
    return useQuery({
        queryKey: ['payment-method-options', context],
        queryFn: async () => {
            const { data } = await apiClient.get('/payment-method-options', { params: { context } });
            return data.data as PaymentMethod[];
        },
    });
};

export const useFetchPaymentMethod = (id: string | number | undefined) => {
    return useQuery({
        queryKey: ['payment-methods', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/payment-methods/${id}`);
            return data.data as PaymentMethod;
        },
        enabled: !!id,
    });
};

export const useCreatePaymentMethod = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (formData: PaymentMethodFormData) => {
            const body = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'qr_image' && value instanceof File) {
                    body.append(key, value);
                } else if (typeof value === 'boolean') {
                    body.append(key, value ? '1' : '0');
                } else if (value !== null && value !== undefined) {
                    body.append(key, value as string);
                }
            });

            const { data } = await apiClient.post('/payment-methods', body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            navigate('/payment-methods');
        },
    });
};

export const useUpdatePaymentMethod = (id: string | number) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (formData: PaymentMethodFormData) => {
            const body = new FormData();
            body.append('_method', 'PUT'); // Method spoofing

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'qr_image' && value instanceof File) {
                    body.append(key, value);
                } else if (typeof value === 'boolean') {
                    body.append(key, value ? '1' : '0');
                } else if (value !== null && value !== undefined) {
                    body.append(key, value as string);
                }
            });

            const { data } = await apiClient.post(`/payment-methods/${id}`, body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            await queryClient.invalidateQueries({ queryKey: ['payment-methods', id] });
            navigate('/payment-methods');
        },
    });
};

export const useDeletePaymentMethod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete(`/payment-methods/${id}`);
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
        },
    });
};
