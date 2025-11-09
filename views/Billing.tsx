import React, { useState, useEffect } from 'react';
import * as storageService from '../services/storageService';
import BillPreview from '../components/BillPreview';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import QRCodeModal from '../components/QRCodeModal';
import type { StockItem, BillItem, Bill, AppView } from '../types';

// New icons for view switcher
const ViewLargeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const ViewMediumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ViewSmallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM8 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3zM14 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V3zM2 8a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V8zM8 8a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V8zM14 8a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V8zM2 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zM8 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2zM14 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
    </svg>
);


interface BillingProps {
  onBillingSuccess: () => void;
  navigateTo: (view: AppView) => void;
}

type ItemSize = 'small' | 'medium' | 'large';

const Billing: React.FC<BillingProps> = ({ onBillingSuccess, navigateTo }) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemSize, setItemSize] = useState<ItemSize>('medium');
  
  const [modalStep, setModalStep] = useState<'payment' | 'qr' | 'invoice' | null>(null);
  const [processingBill, setProcessingBill] = useState<Omit<Bill, 'id' | 'paymentMethod'> | null>(null);
  const [finalBill, setFinalBill] = useState<Bill | null>(null);

  useEffect(() => {
    setStock(storageService.getStockItems());
  }, []);

  const addToCart = (item: StockItem) => {
    const existingCartItem = cart.find(ci => ci.itemId === item.id);
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (item.quantity <= currentQuantityInCart) {
        alert(`No more "${item.name}" in stock.`);
        return;
    }

    setCart(prevCart => {
      if (existingCartItem) {
        return prevCart.map(ci =>
          ci.itemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { itemId: item.id, name: item.name, mrp: item.mrp, quantity: 1, profit: item.profit }];
    });
  };
  
  const handleGenerateBill = () => {
    const totalAmount = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const totalProfit = cart.reduce((sum, item) => sum + item.profit * item.quantity, 0);
    
    setProcessingBill({
      items: cart,
      totalAmount,
      totalProfit,
      createdAt: Date.now(),
    });
    setModalStep('payment');
  };

  const handlePaymentSelect = (method: 'cash' | 'qr') => {
    if (!processingBill) return;

    if (method === 'cash') {
      const billToSave: Omit<Bill, 'id'> = { ...processingBill, paymentMethod: 'cash' };
      const newBill = storageService.saveBill(billToSave);
      setFinalBill(newBill);
      setModalStep('invoice');
    } else {
      setModalStep('qr');
    }
  };

  const handleQRConfirm = () => {
    if (!processingBill) return;
    const billToSave: Omit<Bill, 'id'> = { ...processingBill, paymentMethod: 'qr' };
    const newBill = storageService.saveBill(billToSave);
    setFinalBill(newBill);
    setModalStep('invoice');
  };

  const resetBillingProcess = () => {
    setCart([]);
    setProcessingBill(null);
    setFinalBill(null);
    setModalStep(null);
    // Refresh stock data after a bill is completed
    setStock(storageService.getStockItems());
    onBillingSuccess();
  };

  const handleCloseInvoice = () => {
      resetBillingProcess();
      navigateTo('history');
  };

  const filteredStock = stock.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sizeConfig = {
    small: {
        grid: 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2',
        image: 'h-16',
        padding: 'p-2',
        font: 'text-xs',
        priceFont: 'text-sm font-bold',
        button: 'relative bg-white dark:bg-gray-800 rounded-lg shadow-md text-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
    },
    medium: {
        grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
        image: 'h-24',
        padding: 'p-3',
        font: 'text-sm',
        priceFont: 'font-bold',
        button: 'relative bg-white dark:bg-gray-800 rounded-xl shadow-md text-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
    },
    large: {
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3',
        image: 'h-16 w-16',
        padding: 'p-3',
        font: 'text-base',
        priceFont: 'text-lg font-bold',
        button: 'relative bg-white dark:bg-gray-800 rounded-xl shadow-md text-left flex items-center space-x-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
    }
  };
  const currentSize = sizeConfig[itemSize];

  return (
    <div className="p-4 space-y-4 pb-40">
      <header className="text-center py-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Bills</h1>
      </header>
      
      <div className="sticky top-4 z-10 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        </div>
        <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-xl">
          {(['large', 'medium', 'small'] as const).map(size => (
              <button
                  key={size}
                  onClick={() => setItemSize(size)}
                  className={`p-2 rounded-lg transition-colors ${itemSize === size ? 'bg-white dark:bg-gray-900 text-primary-600' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                  aria-label={`Set item size to ${size}`}
              >
                  {size === 'large' && <ViewLargeIcon className="w-5 h-5" />}
                  {size === 'medium' && <ViewMediumIcon className="w-5 h-5" />}
                  {size === 'small' && <ViewSmallIcon className="w-5 h-5" />}
              </button>
          ))}
        </div>
      </div>

      <div className={currentSize.grid}>
        {filteredStock.map(item => {
            const buttonContent = itemSize === 'large' ? (
                <>
                    <img src={item.imageUrl} alt={item.name} className={`${currentSize.image} object-cover rounded-lg flex-shrink-0`} />
                    <div className="flex-1">
                        <p className={`font-semibold text-gray-800 dark:text-gray-200 ${currentSize.font}`}>{item.name}</p>
                        <p className={`text-primary-600 dark:text-primary-400 ${currentSize.priceFont}`}>₹{item.mrp.toFixed(2)}</p>
                    </div>
                </>
            ) : (
                <>
                    <img src={item.imageUrl} alt={item.name} className={`w-full ${currentSize.image} object-cover rounded-lg mb-2`} />
                    <p className={`font-semibold text-gray-800 dark:text-gray-200 truncate ${currentSize.font}`}>{item.name}</p>
                    <p className={`text-primary-600 dark:text-primary-400 ${currentSize.priceFont}`}>₹{item.mrp.toFixed(2)}</p>
                </>
            );

            return (
                <button 
                  key={item.id} 
                  onClick={() => addToCart(item)} 
                  disabled={item.quantity <= 0}
                  className={`${currentSize.button} ${currentSize.padding}`}
                >
                    {buttonContent}
                    {item.quantity <= 0 ? (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl">
                            <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                    ) : (
                         <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${item.quantity <= 5 ? 'bg-red-500' : 'bg-gray-900 bg-opacity-70'}`}>
                            Qty: {item.quantity}
                        </div>
                    )}
                </button>
            );
        })}
      </div>
      
      <BillPreview cart={cart} stock={stock} onGenerateBill={handleGenerateBill} onUpdateCart={setCart} />

      {modalStep === 'payment' && processingBill && (
        <PaymentModal 
          totalAmount={processingBill.totalAmount}
          onSelect={handlePaymentSelect}
          onClose={resetBillingProcess}
        />
      )}
      {modalStep === 'qr' && processingBill && (
        <QRCodeModal 
          totalAmount={processingBill.totalAmount}
          onConfirm={handleQRConfirm}
          onBack={() => setModalStep('payment')}
        />
      )}
      {modalStep === 'invoice' && finalBill && (
        <InvoiceModal bill={finalBill} onClose={handleCloseInvoice} />
      )}
    </div>
  );
};

export default Billing;
