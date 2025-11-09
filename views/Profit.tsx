import React, { useState, useEffect } from 'react';
import * as storageService from '../services/storageService';
import ProfitDetailModal from '../components/ProfitDetailModal';
import { ChevronRightIcon } from '../components/icons/ActionIcons';
import type { DailyProfit, ProfitDetailItem } from '../types';

// Helper function to format date as YYYY-MM-DD string
const toDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Profit: React.FC = () => {
    const [dailyProfits, setDailyProfits] = useState<DailyProfit[]>([]);
    const [todayProfitData, setTodayProfitData] = useState({ total: 0, cash: 0, qr: 0 });
    const [yesterdayProfitData, setYesterdayProfitData] = useState({ total: 0, cash: 0, qr: 0 });
    const [selectedDay, setSelectedDay] = useState<DailyProfit | null>(null);

    useEffect(() => {
        const bills = storageService.getBills();
        const profitMap = new Map<string, {
            date: string,
            totalProfit: number,
            cashProfit: number,
            qrProfit: number,
            items: Map<string, ProfitDetailItem>
        }>();

        bills.forEach(bill => {
            const dateStr = toDateString(new Date(bill.createdAt));
            let dayData = profitMap.get(dateStr);
            if (!dayData) {
                dayData = { date: dateStr, totalProfit: 0, cashProfit: 0, qrProfit: 0, items: new Map() };
                profitMap.set(dateStr, dayData);
            }

            dayData.totalProfit += bill.totalProfit;
            if (bill.paymentMethod === 'cash') {
                dayData.cashProfit += bill.totalProfit;
            } else {
                dayData.qrProfit += bill.totalProfit;
            }

            bill.items.forEach(item => {
                let itemData = dayData.items.get(item.itemId);
                if (!itemData) {
                    itemData = { name: item.name, quantity: 0, totalProfit: 0, cashProfit: 0, qrProfit: 0 };
                    dayData.items.set(item.itemId, itemData);
                }
                const itemProfit = item.profit * item.quantity;
                itemData.quantity += item.quantity;
                itemData.totalProfit += itemProfit;
                if (bill.paymentMethod === 'cash') {
                    itemData.cashProfit += itemProfit;
                } else {
                    itemData.qrProfit += itemProfit;
                }
            });
        });

        const allDays: DailyProfit[] = Array.from(profitMap.values()).map(day => ({
            ...day,
            items: Array.from(day.items.values()),
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setDailyProfits(allDays);
        
        const todayStr = toDateString(new Date());
        const yesterdayStr = toDateString(new Date(Date.now() - 86400000));
        
        const todayData = profitMap.get(todayStr);
        setTodayProfitData({
            total: todayData?.totalProfit || 0,
            cash: todayData?.cashProfit || 0,
            qr: todayData?.qrProfit || 0
        });
        const yesterdayData = profitMap.get(yesterdayStr);
        setYesterdayProfitData({
            total: yesterdayData?.totalProfit || 0,
            cash: yesterdayData?.cashProfit || 0,
            qr: yesterdayData?.qrProfit || 0
        });

    }, []);

    const handleDaySelect = (dateStr: string) => {
        const dayData = dailyProfits.find(d => d.date === dateStr);
        if (dayData) {
            setSelectedDay(dayData);
        }
    };

    const StatCard: React.FC<{ title: string; data: { total: number, cash: number, qr: number }; onClick: () => void }> = ({ title, data, onClick }) => (
        <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-left w-full transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 space-y-1">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{data.total.toFixed(2)}</p>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                <span>Cash: <span className="font-medium text-green-600 dark:text-green-400">₹{data.cash.toFixed(2)}</span></span>
                <span>QR: <span className="font-medium text-purple-600 dark:text-purple-400">₹{data.qr.toFixed(2)}</span></span>
            </div>
        </button>
    );

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="text-center py-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Profit</h1>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Today's Profit" data={todayProfitData} onClick={() => handleDaySelect(toDateString(new Date()))} />
                <StatCard title="Yesterday's Profit" data={yesterdayProfitData} onClick={() => handleDaySelect(toDateString(new Date(Date.now() - 86400000)))} />
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Daily Profit History</h2>
                <div className="space-y-3">
                    {dailyProfits.map(day => (
                        <button 
                            key={day.date} 
                            onClick={() => setSelectedDay(day)}
                            className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Cash: <span className="font-medium text-green-600 dark:text-green-400">₹{day.cashProfit.toFixed(2)}</span></span>
                                    <span>QR: <span className="font-medium text-purple-600 dark:text-purple-400">₹{day.qrProfit.toFixed(2)}</span></span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">₹{day.totalProfit.toFixed(2)}</p>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </button>
                    ))}
                     {dailyProfits.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No profit data available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedDay && <ProfitDetailModal data={selectedDay} onClose={() => setSelectedDay(null)} />}
        </div>
    );
};

export default Profit;