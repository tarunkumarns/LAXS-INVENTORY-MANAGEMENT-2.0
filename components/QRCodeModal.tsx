import React, { useState, useEffect } from 'react';
import { qrCodeImage as defaultQrCodeImage } from '../assets/qrCodeImage';
import * as storageService from '../services/storageService';

interface QRCodeModalProps {
  totalAmount: number;
  onConfirm: () => void;
  onBack: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ totalAmount, onConfirm, onBack }) => {
  const [qrCode, setQrCode] = useState(defaultQrCodeImage);

  useEffect(() => {
    const userQr = storageService.getUpiQrCode();
    if (userQr) {
      setQrCode(userQr);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <header className="p-4 border-b dark:border-gray-700 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan to Pay</h2>
        </header>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Total Amount:</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">₹{totalAmount.toFixed(2)}</p>
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-64 h-64 rounded-lg bg-white p-2" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scan the QR code with any UPI app.</p>
        </div>
        <footer className="p-4 border-t dark:border-gray-700 mt-auto grid grid-cols-2 gap-3">
            <button 
              onClick={onBack} 
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                Back
            </button>
            <button 
              onClick={onConfirm} 
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
                Confirm Payment
            </button>
        </footer>
      </div>
    </div>
  );
};

export default QRCodeModal;