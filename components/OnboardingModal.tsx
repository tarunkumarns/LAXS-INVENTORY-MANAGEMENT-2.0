import React from 'react';
import { StockIcon, BillingIcon, HistoryIcon, ProfitIcon } from './icons/NavigationIcons';
import { XIcon } from './icons/ActionIcons';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {

  const GuideStep: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
  }> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Laxs!</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close Onboarding">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              You're all set up! Here’s a quick guide to help you get started with managing your inventory.
            </p>
            <div className="space-y-6">
              <GuideStep 
                icon={StockIcon}
                title="1. Add Your Products"
                description="Navigate to the 'Stock' tab to add your first item. You can add items one-by-one or in bulk."
              />
               <GuideStep 
                icon={BillingIcon}
                title="2. Create Bills Easily"
                description="Go to the 'Billing' tab. Simply tap on your products to add them to the cart and generate a bill for your customer."
              />
               <GuideStep 
                icon={HistoryIcon}
                title="3. Track Your Sales"
                description="The 'History' tab keeps a record of all your past bills, so you can review them anytime."
              />
               <GuideStep 
                icon={ProfitIcon}
                title="4. Monitor Your Profits"
                description="Visit the 'Profit' tab for a detailed breakdown of your daily earnings and see which products are most profitable."
              />
            </div>
        </div>
        
        <footer className="p-6">
            <button 
              onClick={onClose} 
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
                Let's Get Started!
            </button>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingModal;
