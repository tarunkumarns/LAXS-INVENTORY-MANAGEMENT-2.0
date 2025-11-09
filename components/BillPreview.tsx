import React, { useState, useRef } from 'react';
import type { BillItem, StockItem } from '../types';
import { TrashIcon } from './icons/ActionIcons';

interface BillPreviewProps {
  cart: BillItem[];
  stock: StockItem[];
  onGenerateBill: () => void;
  onUpdateCart: (updatedCart: BillItem[]) => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ cart, stock, onGenerateBill, onUpdateCart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef(0);

  const totalAmount = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalProfit = cart.reduce((sum, item) => sum + item.profit * item.quantity, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const stockItem = stock.find(s => s.id === itemId);
    if (stockItem && newQuantity > stockItem.quantity) {
        alert(`Cannot add more. Only ${stockItem.quantity} in stock.`);
        return;
    }

    if (newQuantity <= 0) {
      onUpdateCart(cart.filter(item => item.itemId !== itemId));
    } else {
      onUpdateCart(cart.map(item => item.itemId === itemId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const removeItem = (itemId: string) => {
    onUpdateCart(cart.filter(item => item.itemId !== itemId));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY.current;

    if (swipeDistance > 50) { // Threshold for downward swipe
      setIsExpanded(false);
    }
  };

  if (cart.length === 0) return null;

  if (!isExpanded) {
    return (
        <div className="fixed bottom-16 left-0 right-0 z-10 p-2">
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full max-w-md mx-auto bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-2xl px-4 py-2 flex justify-between items-center transition-transform hover:scale-105 active:scale-100"
                aria-label={`View bill with ${cart.length} items. Total: ${totalAmount.toFixed(2)}`}
            >
                <span className="font-medium text-sm bg-primary-600 h-6 w-6 flex items-center justify-center rounded-full">{cart.length}</span>
                <span className="font-bold text-lg">Total: ₹{totalAmount.toFixed(2)}</span>
            </button>
        </div>
    );
  }

  return (
    <div 
        className="fixed bottom-16 left-0 right-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl border-t border-x border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="w-full p-2 text-center bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing" aria-label="Collapse bill details">
            <div className="w-8 h-1.5 bg-gray-400 rounded-full mx-auto"></div>
        </div>

        <div className="p-4 space-y-2">
            <h3 className="font-bold text-lg">Current Bill</h3>
            <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
            {cart.map(item => (
              <div key={item.itemId} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">₹{item.mrp.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold">+</button>
                </div>
                 <button onClick={() => removeItem(item.itemId)} className="ml-3 text-red-500 hover:text-red-700" aria-label={`Remove ${item.name}`}>
                    <TrashIcon className="w-5 h-5" />
                 </button>
              </div>
            ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 space-y-1">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Profit:</span>
                <span>₹{totalProfit.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onGenerateBill}
              className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>
  );
};

export default BillPreview;