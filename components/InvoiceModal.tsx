import React from 'react';
import type { Bill } from '../types';
import { DownloadIcon, XIcon } from './icons/ActionIcons';

interface InvoiceModalProps {
  bill: Bill;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, onClose }) => {
  const handleDownload = () => {
    let billText = `
*******************************
      LAXS INVENTORY MANAGER
*******************************

Bill ID: ${bill.id}
Date: ${new Date(bill.createdAt).toLocaleString()}

-------------------------------
| Qty | Item          | Price   | Total   |
-------------------------------
`;

    bill.items.forEach(item => {
      const itemTotal = (item.mrp * item.quantity).toFixed(2);
      const name = item.name.padEnd(15, ' ').substring(0, 15);
      const mrp = `₹${item.mrp.toFixed(2)}`.padStart(7, ' ');
      const total = `₹${itemTotal}`.padStart(7, ' ');
      const qty = `${item.quantity}`.padStart(3, ' ');

      billText += `| ${qty} | ${name} | ${mrp} | ${total} |\n`;
    });

    billText += `-------------------------------
| TOTAL: ${`₹${bill.totalAmount.toFixed(2)}`.padStart(24, ' ')} |
-------------------------------

Thank you for your purchase!
`;

    const blob = new Blob([billText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${bill.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700 font-sans">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close invoice">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div id="invoice-content" className="p-4 sm:p-6 overflow-y-auto text-sm text-gray-800 dark:text-gray-200">
            <div className="text-center mb-6">
                <h3 className="font-bold text-lg font-sans"><span className="text-blue-600 dark:text-blue-400">LAXS</span> INVENTORY MANAGER</h3>
                <p className="text-xs text-gray-500 font-sans">Your Friendly Neighborhood Store</p>
            </div>
            <div className="flex justify-between mb-2 text-xs">
                <span>Bill ID: {bill.id}</span>
                <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-xs">
                <span></span>
                <span>{new Date(bill.createdAt).toLocaleTimeString()}</span>
            </div>

            <div className="border-t border-b border-dashed dark:border-gray-600 py-2 space-y-2">
                {bill.items.map(item => (
                    <div key={item.itemId} className="flex">
                        <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{item.quantity} x ₹{item.mrp.toFixed(2)}</p>
                        </div>
                        <div className="font-semibold">
                            ₹{(item.mrp * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t dark:border-gray-600">
                <span>TOTAL</span>
                <span>₹{bill.totalAmount.toFixed(2)}</span>
            </div>

            <div className="text-center mt-6 text-xs text-gray-500 font-sans">
                <p>Thank you for your purchase!</p>
            </div>
        </div>
        
        <footer className="p-4 border-t dark:border-gray-700 mt-auto grid grid-cols-2 gap-3 font-sans">
            <button 
              onClick={handleDownload} 
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download
            </button>
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

export default InvoiceModal;