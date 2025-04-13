
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  AccountBalances, 
  ExchangeRateDataPoint
} from '@/types';
import { 
  calculateProfit, 
  calculateInventoryVND,
  calculateInventoryRMB
} from '@/utils/transactionUtils';

interface TradeContextType {
  transactions: Transaction[];
  balances: AccountBalances;
  exchangeRateHistory: ExchangeRateDataPoint[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'profit'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  recordResale: (
    id: string, 
    resalePrice: number, 
    resaleDate: Date, 
    exchangeRateResale: number,
    resaleFee?: number,
    resaleFeeCurrency?: 'VND' | 'RMB'
  ) => void;
  transferRMBToVND: (amount: number, fromAccount: 'rmbYoupinPlatform' | 'rmbCash', exchangeRate: number) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

// Default initial balances
const initialBalances: AccountBalances = {
  vndCashBeforeBuying: 10000000, // 10 million VND
  inventory: 0,
  inventoryRMB: 0,
  rmbYoupinPlatform: 0,
  rmbCash: 0,
  vndCashAfterResale: 0
};

export const TradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<AccountBalances>(initialBalances);
  const [exchangeRateHistory, setExchangeRateHistory] = useState<ExchangeRateDataPoint[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('cs2Transactions');
    const savedBalances = localStorage.getItem('cs2Balances');
    const savedExchangeRateHistory = localStorage.getItem('cs2ExchangeRateHistory');

    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      // Convert string dates back to Date objects
      parsedTransactions.forEach((t: any) => {
        t.purchaseDate = new Date(t.purchaseDate);
        if (t.resaleDate) t.resaleDate = new Date(t.resaleDate);
      });
      setTransactions(parsedTransactions);
    }

    if (savedBalances) {
      setBalances(JSON.parse(savedBalances));
    }

    if (savedExchangeRateHistory) {
      const parsedHistory = JSON.parse(savedExchangeRateHistory);
      // Convert string dates back to Date objects
      parsedHistory.forEach((h: any) => {
        h.date = new Date(h.date);
      });
      setExchangeRateHistory(parsedHistory);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cs2Transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cs2Balances', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('cs2ExchangeRateHistory', JSON.stringify(exchangeRateHistory));
  }, [exchangeRateHistory]);

  // Recalculate inventory values when transactions change
  useEffect(() => {
    setBalances(prev => ({
      ...prev,
      inventory: calculateInventoryVND(transactions),
      inventoryRMB: calculateInventoryRMB(transactions)
    }));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'status' | 'profit'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      status: 'Resale Pending',
      profit: 0
    };

    setTransactions(prev => [...prev, newTransaction]);
    
    // Update balances
    setBalances(prev => ({
      ...prev,
      vndCashBeforeBuying: prev.vndCashBeforeBuying - transaction.purchasePrice - 
        (transaction.purchaseFeeCurrency === 'VND' ? transaction.purchaseFee : 0)
    }));

    // Add exchange rate to history
    setExchangeRateHistory(prev => [
      ...prev,
      {
        date: transaction.purchaseDate,
        rate: transaction.exchangeRatePurchase,
        source: 'purchase'
      }
    ]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Revert balance changes
    if (transaction.status === 'Resale Pending') {
      setBalances(prev => ({
        ...prev,
        vndCashBeforeBuying: prev.vndCashBeforeBuying + transaction.purchasePrice +
          (transaction.purchaseFeeCurrency === 'VND' ? transaction.purchaseFee : 0)
      }));
    } else if (transaction.status === 'Completed' && transaction.resalePrice && transaction.exchangeRateResale) {
      // Complex balance reversion for completed transactions
      // This is simplified and should be expanded based on your exact business logic
      setBalances(prev => ({
        ...prev,
        rmbYoupinPlatform: prev.rmbYoupinPlatform - transaction.resalePrice,
        vndCashBeforeBuying: prev.vndCashBeforeBuying + transaction.purchasePrice
      }));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const recordResale = (
    id: string, 
    resalePrice: number, 
    resaleDate: Date, 
    exchangeRateResale: number,
    resaleFee?: number,
    resaleFeeCurrency?: 'VND' | 'RMB'
  ) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === id) {
        const updatedTransaction: Transaction = {
          ...t,
          resalePrice,
          resaleDate,
          exchangeRateResale,
          resaleFee: resaleFee || 0,
          resaleFeeCurrency,
          status: 'Completed'
        };
        
        // Calculate profit
        updatedTransaction.profit = calculateProfit(updatedTransaction);
        return updatedTransaction;
      }
      return t;
    });

    setTransactions(updatedTransactions);

    // Find the updated transaction
    const updatedTransaction = updatedTransactions.find(t => t.id === id);
    if (!updatedTransaction) return;

    // Add to RMB balance and adjust for RMB fees
    const rmbNet = resalePrice - (resaleFeeCurrency === 'RMB' && resaleFee ? resaleFee : 0);
    
    // Update balances
    setBalances(prev => ({
      ...prev,
      rmbYoupinPlatform: prev.rmbYoupinPlatform + rmbNet,
      // Subtract VND fees if any
      vndCashAfterResale: prev.vndCashAfterResale - 
        (resaleFeeCurrency === 'VND' && resaleFee ? resaleFee : 0)
    }));

    // Add exchange rate to history
    setExchangeRateHistory(prev => [
      ...prev,
      {
        date: resaleDate,
        rate: exchangeRateResale,
        source: 'resale'
      }
    ]);
  };

  const transferRMBToVND = (amount: number, fromAccount: 'rmbYoupinPlatform' | 'rmbCash', exchangeRate: number) => {
    // Calculate VND amount
    const vndAmount = amount * exchangeRate;
    
    // Update balances
    setBalances(prev => ({
      ...prev,
      [fromAccount]: prev[fromAccount] - amount,
      vndCashAfterResale: prev.vndCashAfterResale + vndAmount
    }));

    // Add to exchange rate history
    setExchangeRateHistory(prev => [
      ...prev, 
      {
        date: new Date(),
        rate: exchangeRate,
        source: 'resale' // Using 'resale' as the source for transfers as well
      }
    ]);
  };

  return (
    <TradeContext.Provider value={{
      transactions,
      balances,
      exchangeRateHistory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      recordResale,
      transferRMBToVND
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = (): TradeContextType => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
