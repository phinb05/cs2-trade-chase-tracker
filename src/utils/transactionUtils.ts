
import { Transaction, Currency } from '@/types';

// Format currency values
export const formatCurrency = (value: number, currency: Currency): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  } else {
    return new Intl.NumberFormat('zh-CN', { 
      style: 'currency', 
      currency: 'CNY',
      maximumFractionDigits: 2 
    }).format(value);
  }
};

// Calculate profit from a transaction
export const calculateProfit = (transaction: Transaction): number => {
  if (
    !transaction.resalePrice || 
    !transaction.exchangeRateResale
  ) {
    return 0;
  }

  // Calculate resale value in VND
  let resaleValueVND = transaction.resalePrice * transaction.exchangeRateResale;
  
  // Subtract RMB fees before conversion if any
  if (transaction.resaleFee && transaction.resaleFeeCurrency === 'RMB') {
    resaleValueVND = (transaction.resalePrice - transaction.resaleFee) * transaction.exchangeRateResale;
  }
  
  // Subtract VND fees from purchase
  let purchaseCost = transaction.purchasePrice;
  if (transaction.purchaseFee && transaction.purchaseFeeCurrency === 'VND') {
    purchaseCost += transaction.purchaseFee;
  }
  
  // Subtract VND fees from resale if any
  if (transaction.resaleFee && transaction.resaleFeeCurrency === 'VND') {
    resaleValueVND -= transaction.resaleFee;
  }
  
  // Calculate profit
  return resaleValueVND - purchaseCost;
};

// Calculate days remaining until item can be resold (7-day lock period)
export const calculateDaysRemaining = (purchaseDate: Date): number => {
  const now = new Date();
  const purchaseTime = new Date(purchaseDate).getTime();
  const unlockTime = purchaseTime + (7 * 24 * 60 * 60 * 1000); // 7 days in ms
  const remaining = Math.ceil((unlockTime - now.getTime()) / (24 * 60 * 60 * 1000));
  return remaining > 0 ? remaining : 0;
};

// Check if an item is unlocked for resale
export const isItemUnlocked = (purchaseDate: Date): boolean => {
  return calculateDaysRemaining(purchaseDate) === 0;
};

// Calculate inventory value in VND
export const calculateInventoryVND = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.status === 'Resale Pending')
    .reduce((sum, t) => sum + t.purchasePrice, 0);
};

// Calculate inventory value in RMB
export const calculateInventoryRMB = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.status === 'Resale Pending')
    .reduce((sum, t) => sum + (t.purchasePrice / t.exchangeRatePurchase), 0);
};
