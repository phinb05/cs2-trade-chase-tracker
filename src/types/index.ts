
// Item condition types
export type ItemCondition = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

// Transaction status types
export type TransactionStatus = 'Purchased' | 'Resale Pending' | 'Completed';

// Currency types
export type Currency = 'VND' | 'RMB';

// Transaction interface
export interface Transaction {
  id: string;
  itemName: string;
  condition: ItemCondition;
  purchasePrice: number; // In VND
  resalePrice?: number; // In RMB
  purchaseFee: number;
  resaleFee?: number;
  purchaseFeeCurrency: Currency;
  resaleFeeCurrency?: Currency;
  exchangeRatePurchase: number; // VND per 1 RMB
  exchangeRateResale?: number; // VND per 1 RMB
  purchaseDate: Date;
  resaleDate?: Date;
  status: TransactionStatus;
  profit?: number; // Calculated profit in VND
}

// Account balance interface
export interface AccountBalances {
  vndCashBeforeBuying: number;
  inventory: number;
  inventoryRMB: number;
  rmbYoupinPlatform: number;
  rmbCash: number;
  vndCashAfterResale: number;
}

// Exchange rate data point
export interface ExchangeRateDataPoint {
  date: Date;
  rate: number; // VND per 1 RMB
  source: 'purchase' | 'resale';
}
