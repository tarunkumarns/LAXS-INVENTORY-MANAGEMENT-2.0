import type { StockItem, Bill } from '../types';
import * as authService from './authService';

const STOCK_KEY = 'inventory_stock';
const BILLS_KEY = 'inventory_bills';
const UPI_QR_CODE_KEY = 'user_upi_qr_code';


const sampleStock: StockItem[] = [
  { id: '1', name: 'Organic Apples', category: 'Fruits', buyingPrice: 80, profit: 20, mrp: 100, imageUrl: 'https://picsum.photos/seed/apples/200', salesCount: 15, quantity: 50 },
  { id: '2', name: 'Whole Wheat Bread', category: 'Bakery', buyingPrice: 30, profit: 10, mrp: 40, imageUrl: 'https://picsum.photos/seed/bread/200', salesCount: 25, quantity: 30 },
  { id: '3', name: 'Almond Milk', category: 'Dairy', buyingPrice: 150, profit: 50, mrp: 200, imageUrl: 'https://picsum.photos/seed/milk/200', salesCount: 10, quantity: 20 },
  { id: '4', name: 'Avocado', category: 'Vegetables', buyingPrice: 40, profit: 15, mrp: 55, imageUrl: 'https://picsum.photos/seed/avocado/200', salesCount: 30, quantity: 1 },
  { id: '5', name: 'Quinoa', category: 'Grains', buyingPrice: 200, profit: 70, mrp: 270, imageUrl: 'https://picsum.photos/seed/quinoa/200', salesCount: 8, quantity: 15 },
  { id: '6', name: 'Dark Chocolate', category: 'Snacks', buyingPrice: 120, profit: 40, mrp: 160, imageUrl: 'https://picsum.photos/seed/chocolate/200', salesCount: 18, quantity: 0 },
];

const sampleBills: Bill[] = Array.from({ length: 50 }, (_, i) => {
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const items = Array.from({ length: itemsCount }, () => {
        const item = sampleStock[Math.floor(Math.random() * sampleStock.length)];
        return { itemId: item.id, name: item.name, mrp: item.mrp, quantity: 1, profit: item.profit };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const totalProfit = items.reduce((sum, item) => sum + item.profit * item.quantity, 0);
    const createdAt = Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000 * 5); // last 5 days
    const paymentMethod = Math.random() > 0.5 ? 'cash' : 'qr';
    return { id: `bill-${i}`, items, totalAmount, totalProfit, createdAt, paymentMethod };
});

const getUserKey = (baseKey: string): string | null => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    return `${user.id}_${baseKey}`;
};

export const initializeData = (isNewUser: boolean = false): void => {
  const stockKey = getUserKey(STOCK_KEY);
  const billsKey = getUserKey(BILLS_KEY);

  if (!stockKey || !billsKey) return;

  // For new users, always start with an empty slate.
  if (isNewUser) {
    localStorage.setItem(stockKey, JSON.stringify([]));
    localStorage.setItem(billsKey, JSON.stringify([]));
    return;
  }
  
  // For existing users or guests, populate with sample data only if their storage is completely empty.
  if (!localStorage.getItem(stockKey)) {
    localStorage.setItem(stockKey, JSON.stringify(sampleStock));
  }
  if (!localStorage.getItem(billsKey)) {
    localStorage.setItem(billsKey, JSON.stringify(sampleBills));
  }
};

export const getStockItems = (): StockItem[] => {
  const key = getUserKey(STOCK_KEY);
  if (!key) return [];
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

export const saveStockItems = (items: StockItem[]): void => {
  const key = getUserKey(STOCK_KEY);
  if (key) {
    localStorage.setItem(key, JSON.stringify(items));
  }
};

export const addStockItem = (item: Omit<StockItem, 'id' | 'salesCount'>): StockItem => {
  const items = getStockItems();
  const newItem: StockItem = {
    ...item,
    id: new Date().toISOString(),
    salesCount: 0,
  };
  items.push(newItem);
  saveStockItems(items);
  return newItem;
};

export const addMultipleStockItems = (newItemsData: Omit<StockItem, 'id' | 'salesCount'>[]): StockItem[] => {
  const items = getStockItems();
  const createdItems: StockItem[] = newItemsData.map((item, index) => ({
    ...item,
    id: `${new Date().toISOString()}-${index}`, // Ensure unique ID for batch
    salesCount: 0,
  }));
  const updatedItems = [...items, ...createdItems];
  saveStockItems(updatedItems);
  return createdItems;
};


export const updateStockItem = (updatedItem: StockItem): void => {
  const items = getStockItems();
  const itemIndex = items.findIndex(item => item.id === updatedItem.id);
  if (itemIndex > -1) {
    items[itemIndex] = updatedItem;
    saveStockItems(items);
  }
};

export const deleteStockItem = (itemId: string): void => {
  let items = getStockItems();
  items = items.filter(item => item.id !== itemId);
  saveStockItems(items);
};


export const getBills = (): Bill[] => {
  const key = getUserKey(BILLS_KEY);
  if (!key) return [];
  const bills = localStorage.getItem(key);
  return bills ? JSON.parse(bills) : [];
};

export const saveBill = (bill: Omit<Bill, 'id'>): Bill => {
  const bills = getBills();
  const newBill: Bill = {
    ...bill,
    id: `bill-${new Date().toISOString()}`,
  };
  bills.push(newBill);
  const key = getUserKey(BILLS_KEY);
  if (key) {
    localStorage.setItem(key, JSON.stringify(bills));
  }

  // Update sales count and quantity for stock items
  const stockItems = getStockItems();
  let stockUpdated = false;
  bill.items.forEach(billItem => {
    const stockItemIndex = stockItems.findIndex(si => si.id === billItem.itemId);
    if (stockItemIndex > -1) {
      stockItems[stockItemIndex].salesCount += billItem.quantity;
      stockItems[stockItemIndex].quantity -= billItem.quantity;
      if (stockItems[stockItemIndex].quantity < 0) {
        stockItems[stockItemIndex].quantity = 0; // Ensure quantity doesn't go negative
      }
      stockUpdated = true;
    }
  });
  
  if (stockUpdated) {
    saveStockItems(stockItems);
  }

  return newBill;
};

export const getUpiQrCode = (): string | null => {
  const key = getUserKey(UPI_QR_CODE_KEY);
  if (!key) return null;
  return localStorage.getItem(key);
};

export const saveUpiQrCode = (imageBase64: string): void => {
  const key = getUserKey(UPI_QR_CODE_KEY);
  if (key) {
    localStorage.setItem(key, imageBase64);
  }
};

export const exportData = (): void => {
  const stock = getStockItems();
  const bills = getBills();
  const user = authService.getCurrentUser();
  const data = {
    user: user?.id,
    stock,
    bills,
    exportedAt: new Date().toISOString(),
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
