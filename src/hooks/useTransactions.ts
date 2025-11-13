import { bankingApi, type Transaction, type YearlyTransactionsResponse } from '@/src/services/bankingApi';
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
      const response = await bankingApi.getAccountStatement();
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

export function useYearlyTransactions(year?: number) {
  const [yearlyData, setYearlyData] = useState<YearlyTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYearlyTransactions = async () => {
    if (!year) return;

    setLoading(true);
    setError(null);

    try {
      const response = await bankingApi.getYearlyTransactions(year);
      if (response.success) {
        setYearlyData(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações anuais');
      console.error('Erro ao buscar transações anuais:', err);
    } finally {
      setLoading(false);
    }
  };

  const processYearlyDataForChart = (selectedMonth: string): { chartData: MonthlyData[]; labels: string[] } => {
    if (!yearlyData) {
      return { chartData: [], labels: [] };
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const monthNumber = parseInt(monthStr);
    
    const monthData = yearlyData.months.find(m => m.month === monthNumber);
    
    if (!monthData) {
      return { chartData: [{ deposits: 0, withdrawals: 0 }], labels: [selectedMonth] };
    }

    let deposits = 0;
    let withdrawals = 0;

    monthData.transactions.forEach(transaction => {
      if (transaction.type === 'DEPOSIT') {
        deposits += transaction.amount;
      } else {
        withdrawals += transaction.amount;
      }
    });

    const selectedDate = new Date(parseInt(yearStr), monthNumber - 1, 1);
    const label = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return {
      chartData: [{ deposits, withdrawals }],
      labels: [label]
    };
  };

  const getAllTransactions = (): Transaction[] => {
    if (!yearlyData) return [];
    
    return yearlyData.months.flatMap(month => month.transactions);
  };

  const processCategoryData = (): { category: string; amount: number; color: string }[] => {
    if (!yearlyData) return [];

    const categoryMap = new Map<string, number>();
    
    yearlyData.months.forEach(month => {
      month.transactions.forEach(transaction => {
        if (transaction.type === 'WITHDRAWAL') {
          const category = transaction.category || 'Outros';
          const currentAmount = categoryMap.get(category) || 0;
          categoryMap.set(category, currentAmount + transaction.amount);
        }
      });
    });

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    const categoryData = Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.amount - a.amount);

    return categoryData;
  };

  const processMonthlyCategoryData = (selectedMonth: string): { category: string; amount: number; color: string; percentage: number }[] => {
    if (!yearlyData) {
      return [];
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const monthNumber = parseInt(monthStr);
    
    const monthData = yearlyData.months.find(m => m.month === monthNumber);
    
    if (!monthData || !monthData.transactions) {
      return [];
    }

    const categoryMap = new Map<string, number>();
    
    monthData.transactions.forEach(transaction => {
      if (transaction.type === 'WITHDRAWAL') {
        const category = transaction.category || 'Outros';
        const currentAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentAmount + transaction.amount);
      }
    });

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    const categoryData = Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        color: colors[index % colors.length],
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    return categoryData;
  };

  useEffect(() => {
    fetchYearlyTransactions();
  }, [year]);

  return {
    yearlyData,
    loading,
    error,
    refetch: fetchYearlyTransactions,
    processYearlyDataForChart,
    getAllTransactions,
    processCategoryData,
    processMonthlyCategoryData,
  };
}
