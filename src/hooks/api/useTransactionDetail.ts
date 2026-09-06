import { useQuery } from '@tanstack/react-query';
import { fetchTransactionDetail } from '../../services/api/transactionService';

export const useTransactionDetail = (transactionId: number | null) => {
  return useQuery({
    queryKey: ['transaction-detail', transactionId],
    queryFn: () => fetchTransactionDetail(transactionId!),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
