import { getAccountStatementSimple, type Transaction } from '@/src/infrastructure/services';
import { useEffect, useState } from 'react';

type MonthlyData = {
  deposits: number;
  withdrawals: number;
};

export function useTransactions(accountNumber?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAccountStatementSimple();
      if (response.success) {
        setTransactions(response.transactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      console.error('Erro ao buscar transações:', err);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionsForChart = (selectedMonth: string): { chartData: MonthlyData[]; labels: string[] } => {
    const monthlyData = new Map<string, MonthlyData>();
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { deposits: 0, withdrawals: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      if (transaction.type === 'DEPOSIT') {
        monthData.deposits += transaction.amount;
      } else {
        monthData.withdrawals += transaction.amount;
      }
    });
    
    const chartData: MonthlyData[] = [];
    const labels: string[] = [];
    
    const monthData = monthlyData.get(selectedMonth) || { deposits: 0, withdrawals: 0 };
    
    const [year, month] = selectedMonth.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    labels.push(label);
    chartData.push(monthData);
    
    return { chartData, labels };
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountNumber]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    processTransactionsForChart,
  };
}
