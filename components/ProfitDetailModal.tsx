import React from 'react';
import { XIcon } from './icons/ActionIcons';
import type { DailyProfit } from '../types';

interface ProfitDetailModalProps {
  data: DailyProfit | null;
  onClose: () => void;
}

const ProfitDetailModal: React.FC<ProfitDetailModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const sortedItems = [...data.items].sort((a, b) => b.totalProfit - a.totalProfit);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profit Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 flex-grow overflow-y-auto">
          <div className="space-y-3">
            {sortedItems.length > 0 ? sortedItems.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">₹{item.totalProfit.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{item.quantity} unit{item.quantity > 1 ? 's' : ''} sold</span>
                    <div className="flex space-x-3">
                        <span>Cash: <span className="font-medium text-green-600 dark:text-green-400">₹{item.cashProfit.toFixed(2)}</span></span>
                        <span>QR: <span className="font-medium text-purple-600 dark:text-purple-400">₹{item.qrProfit.toFixed(2)}</span></span>
                    </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No items sold on this day.</p>
            )}
          </div>
        </div>
        
        <footer className="p-4 border-t dark:border-gray-700 mt-auto space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Cash Profit:</span>
                <span className="font-medium text-green-600 dark:text-green-400">₹{data.cashProfit.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">QR Profit:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">₹{data.qrProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t dark:border-gray-600">
                <span className="text-gray-800 dark:text-gray-200">Total Profit:</span>
                <span className="text-gray-900 dark:text-white">₹{data.totalProfit.toFixed(2)}</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
                Done
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfitDetailModal;