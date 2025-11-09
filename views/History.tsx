import React, { useState, useEffect } from 'react';
import * as storageService from '../services/storageService';
import type { Bill } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import { CashIcon, QRIcon } from '../components/icons/PaymentIcons';

const History: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    const allBills = storageService.getBills();
    // Sort bills by creation date, newest first
    const sortedBills = allBills.sort((a, b) => b.createdAt - a.createdAt);
    setBills(sortedBills);
  }, []);

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const handleCloseInvoice = () => {
    setSelectedBill(null);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="text-center py-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> History</h1>
      </header>

      {bills.length > 0 ? (
        <div className="space-y-3">
          {bills.map(bill => (
            <button 
              key={bill.id} 
              onClick={() => handleViewBill(bill)}
              className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Bill #{bill.id.slice(-6)}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center flex-wrap">
                  <span>{new Date(bill.createdAt).toLocaleString()}</span>
                  {bill.paymentMethod === 'cash' ? (
                    <span className="ml-2 mt-1 sm:mt-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CashIcon className="w-3 h-3 mr-1" /> Cash
                    </span>
                  ) : (
                     <span className="ml-2 mt-1 sm:mt-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <QRIcon className="w-3 h-3 mr-1" /> QR
                    </span>
                  )}
                </div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {bill.items.length} item{bill.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{bill.totalAmount.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No bills have been generated yet.</p>
        </div>
      )}
      
      {selectedBill && <InvoiceModal bill={selectedBill} onClose={handleCloseInvoice} />}
    </div>
  );
};

export default History;