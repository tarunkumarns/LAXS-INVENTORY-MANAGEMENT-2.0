import React, { useState, useRef } from 'react';
import * as storageService from '../services/storageService';
import { UploadIcon, CameraIcon } from '../components/icons/ActionIcons';
import CameraModal from '../components/CameraModal';

interface ProfileProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ isDarkMode, setIsDarkMode }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(storageService.getUpiQrCode() || '');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewQrCode = (base64String: string) => {
    storageService.saveUpiQrCode(base64String);
    setQrCodeUrl(base64String);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleNewQrCode(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCapture = (imageDataUrl: string) => {
    handleNewQrCode(imageDataUrl);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account & Settings</h1>
      </header>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Settings</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">Dark Mode</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                isDarkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm opacity-50 cursor-not-allowed">
          <div className="flex justify-between items-center">
            <span className="font-medium">Theme Color</span>
            <span className="text-sm text-gray-500">Coming Soon</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm opacity-50 cursor-not-allowed">
          <div className="flex justify-between items-center">
            <span className="font-medium">Text Size</span>
            <span className="text-sm text-gray-500">Coming Soon</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Settings</h2>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <p className="font-medium mb-3">Your UPI QR Code</p>
            <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Your UPI QR Code" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 text-xs text-center">No QR Code</span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setIsCameraOpen(true)} className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <CameraIcon className="w-5 h-5 mr-2" />
                            Scan QR
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <UploadIcon className="w-5 h-5 mr-2" />
                            Upload
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This will be shown to customers for payment.</p>
                </div>
            </div>
         </div>
      </div>

      {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
    </div>
  );
};

export default Profile;