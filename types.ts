export interface StockItem {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  profit: number;
  mrp: number;
  imageUrl: string;
  salesCount: number;
  quantity: number;
}

export interface BillItem {
  itemId: string;
  name: string;
  mrp: number;
  quantity: number;
  profit: number;
}

export interface Bill {
  id:string;
  items: BillItem[];
  totalAmount: number;
  totalProfit: number;
  createdAt: number; // timestamp
  paymentMethod: 'cash' | 'qr';
}

export type AppView = 'home' | 'billing' | 'stock' | 'history' | 'profile' | 'profit' | 'reports';

// New types for Profit view
export interface ProfitDetailItem {
  name: string;
  quantity: number;
  totalProfit: number;
  cashProfit: number;
  qrProfit: number;
}

export interface DailyProfit {
  date: string; // YYYY-MM-DD
  totalProfit: number;
  cashProfit: number;
  qrProfit: number;
  items: ProfitDetailItem[];
}

export interface User {
  id: string; // email or phone number
}