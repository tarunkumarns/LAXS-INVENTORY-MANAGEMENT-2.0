import React from 'react';
import { XIcon, DownloadIcon, ChartBarIcon, CogIcon, QuestionMarkCircleIcon, LogoutIcon } from './icons/ActionIcons';
import { StockIcon } from './icons/NavigationIcons';
import * as storageService from '../services/storageService';
import type { AppView, User } from '../types';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  navigateTo: (view: AppView) => void;
  currentUser: User;
  onLogout: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, navigateTo, currentUser, onLogout }) => {
  const handleNavigation = (view: AppView) => {
    navigateTo(view);
    onClose();
  };

  const handleLogout = () => {
      onLogout();
      onClose();
  };
  
  const menuItems = [
    { label: 'Account & Settings', icon: CogIcon, action: () => handleNavigation('profile') },
    { label: 'Export Data', icon: DownloadIcon, action: () => { storageService.exportData(); onClose(); } },
    { label: 'View Reports', icon: ChartBarIcon, action: () => handleNavigation('reports') },
    { label: 'Help & Support', icon: QuestionMarkCircleIcon, action: () => { alert('Opening help...'); onClose(); } },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                        <StockIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 id="panel-title" className="text-lg font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Inventory</h2>
                 </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  aria-label="Close panel"
                >
                  <XIcon className="w-6 h-6" />
                </button>
             </div>
             <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 break-all">{currentUser.id}</p>
             </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-grow p-4 space-y-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href="#"
                onClick={(e) => { e.preventDefault(); item.action(); }}
                className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="w-6 h-6 mr-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
             <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                className="flex items-center px-3 py-2 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
              >
                <LogoutIcon className="w-6 h-6 mr-4" />
                <span className="font-medium">Logout</span>
              </a>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidePanel;
