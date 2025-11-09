import React, { useState, useEffect, useRef } from 'react';
import SalesChart from '../components/SalesChart';
import * as storageService from '../services/storageService';
import type { Bill, StockItem, AppView, User } from '../types';
import SidePanel from '../components/SidePanel';
import AICompanionModal from '../components/AICompanionModal';
import { MenuIcon, SparklesIcon } from '../components/icons/ActionIcons';

interface HomeProps {
  navigateTo: (view: AppView) => void;
  currentUser: User;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ navigateTo, currentUser, onLogout }) => {
  const [chartData, setChartData] = useState<{ hour: string; sales: number }[]>([]);
  const [topItems, setTopItems] = useState<StockItem[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const bills = storageService.getBills();
    const stockItems = storageService.getStockItems();
    
    // Process today's sales for chart
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysBills = bills.filter(b => b.createdAt >= today.getTime());

    const salesByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}`,
      sales: 0,
    }));
    
    let currentTotalSales = 0;
    todaysBills.forEach(bill => {
      const hour = new Date(bill.createdAt).getHours();
      salesByHour[hour].sales += bill.totalAmount;
      currentTotalSales += bill.totalAmount;
    });

    setChartData(salesByHour);
    setTotalSales(currentTotalSales);

    // Process top selling items
    const sortedItems = [...stockItems].sort((a, b) => b.salesCount - a.salesCount);
    setTopItems(sortedItems.slice(0, 5));
    
    // Process low stock items
    const lowItems = stockItems.filter(item => item.quantity <= 1);
    setLowStockItems(lowItems);

  }, [currentUser]); // Re-run when user changes

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Reset on new touch
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    // Check if swipe is from left edge and long enough
    if (touchStartX.current < 50 && touchEndX.current - touchStartX.current > 75) {
      setIsPanelOpen(true);
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="pb-24">
      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        navigateTo={navigateTo} 
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      {isAiModalOpen && <AICompanionModal onClose={() => setIsAiModalOpen(false)} />}

      <div className="p-4 space-y-6">
        <header className="relative flex justify-center items-center py-2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute left-0 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Dashboard</h1>
        </header>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Today's Sales</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">₹{totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">Your Business Co-pilot</h2>
              <p className="text-sm opacity-90 mt-1 max-w-xs">Get AI-powered tips to boost your sales and improve inventory management.</p>
            </div>
            <SparklesIcon className="w-8 h-8 text-white opacity-50 flex-shrink-0"/>
          </div>
          <button onClick={() => setIsAiModalOpen(true)} className="mt-4 bg-white text-primary-600 font-bold py-2 px-5 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
            Ask for Suggestions
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sales Activity</h2>
          <SalesChart data={chartData} />
        </div>

        {lowStockItems.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-3">Low Stock Alerts</h2>
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-r-lg flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 dark:text-red-200">{item.name} is running low!</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {item.quantity > 0 ? `Only ${item.quantity} left in stock.` : 'Out of stock.'}
                    </p>
                  </div>
                  <button onClick={() => navigateTo('stock')} className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md">
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Moving Items</h2>
          <div className="space-y-3">
            {topItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center space-x-4">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.mrp.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-gray-200">{item.salesCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">sold</p>
                </div>
              </div>
            ))}
             {topItems.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No items sold yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;