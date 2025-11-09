import React from 'react';
import { CashIcon, QRIcon } from './icons/PaymentIcons';
import { XIcon } from './icons/ActionIcons';

interface PaymentModalProps {
  totalAmount: number;
  onSelect: (method: 'cash' | 'qr') => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ totalAmount, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose Payment Method</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Total Amount Due:</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">₹{totalAmount.toFixed(2)}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onSelect('cash')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/50 rounded-lg border-2 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            >
              <CashIcon className="w-12 h-12 text-green-500 dark:text-green-400 mb-2" />
              <span className="font-semibold text-lg text-green-800 dark:text-green-200">Cash</span>
            </button>
            <button
              onClick={() => onSelect('qr')}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/50 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            >
              <QRIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-2" />
              <span className="font-semibold text-lg text-purple-800 dark:text-purple-200">QR Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
