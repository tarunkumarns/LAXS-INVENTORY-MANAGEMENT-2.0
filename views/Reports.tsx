import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as storageService from '../services/storageService';
import type { Bill } from '../types';

type DateFilter = 'today' | 'week' | 'month';
type PaymentFilter = 'all' | 'cash' | 'qr';

const Reports: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [dateFilter, setDateFilter] = useState<DateFilter>('week');
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

    useEffect(() => {
        setBills(storageService.getBills());
    }, []);

    const filteredBills = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (dateFilter === 'today') {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'week') {
            const firstDayOfWeek = now.getDate() - now.getDay();
            startDate = new Date(now.setDate(firstDayOfWeek));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        return bills.filter(bill => {
            const billDate = new Date(bill.createdAt);
            const isDateInRange = billDate >= startDate && billDate <= endDate;
            const isPaymentMatch = paymentFilter === 'all' || bill.paymentMethod === paymentFilter;
            return isDateInRange && isPaymentMatch;
        });
    }, [bills, dateFilter, paymentFilter]);
    
    const reportData = useMemo(() => {
        const totalSales = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalProfit = filteredBills.reduce((sum, bill) => sum + bill.totalProfit, 0);
        const totalBills = filteredBills.length;
        const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;
        
        // Sales over time data
        const salesOverTime = {} as { [key: string]: number };
        if (dateFilter === 'today') {
             for (let i = 0; i < 24; i++) { salesOverTime[i.toString().padStart(2, '0') + ':00'] = 0; }
             filteredBills.forEach(bill => {
                 const hour = new Date(bill.createdAt).getHours().toString().padStart(2, '0') + ':00';
                 salesOverTime[hour] = (salesOverTime[hour] || 0) + bill.totalAmount;
             });
        } else {
             const dayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' });
             filteredBills.forEach(bill => {
                 const day = dayFormat.format(new Date(bill.createdAt));
                 salesOverTime[day] = (salesOverTime[day] || 0) + bill.totalAmount;
             });
        }
        const salesOverTimeChartData = Object.entries(salesOverTime).map(([name, sales]) => ({ name, sales }));

        // Payment method data
        const paymentData = { cash: 0, qr: 0 };
        filteredBills.forEach(bill => {
            paymentData[bill.paymentMethod] += bill.totalAmount;
        });
        const paymentChartData = [
            { name: 'Cash', value: paymentData.cash },
            { name: 'QR', value: paymentData.qr }
        ].filter(d => d.value > 0);

        // Top selling items data
        const itemSales: { [key: string]: { name: string, revenue: number } } = {};
        filteredBills.forEach(bill => {
            bill.items.forEach(item => {
                if (!itemSales[item.itemId]) {
                    itemSales[item.itemId] = { name: item.name, revenue: 0 };
                }
                itemSales[item.itemId].revenue += item.mrp * item.quantity;
            });
        });
        const topItemsChartData = Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            metrics: { totalSales, totalProfit, totalBills, avgBillValue },
            salesOverTimeChartData,
            paymentChartData,
            topItemsChartData
        };
    }, [filteredBills, dateFilter]);
    
    const PIE_COLORS = ['#34d399', '#a78bfa'];

    const FilterButton: React.FC<{ label: string; value: any; current: any; setter: (val: any) => void;}> = ({ label, value, current, setter }) => (
        <button
          onClick={() => setter(value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            current === value 
            ? 'bg-primary-600 text-white shadow' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {label}
        </button>
      );

    const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    );
    
    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="text-center py-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Reports</h1>
            </header>

            <div className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Date Range</h2>
                    <div className="flex space-x-2">
                        <FilterButton label="Today" value="today" current={dateFilter} setter={setDateFilter} />
                        <FilterButton label="This Week" value="week" current={dateFilter} setter={setDateFilter} />
                        <FilterButton label="This Month" value="month" current={dateFilter} setter={setDateFilter} />
                    </div>
                </div>
                 <div>
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Payment Method</h2>
                    <div className="flex space-x-2">
                        <FilterButton label="All" value="all" current={paymentFilter} setter={setPaymentFilter} />
                        <FilterButton label="Cash" value="cash" current={paymentFilter} setter={setPaymentFilter} />
                        <FilterButton label="QR Code" value="qr" current={paymentFilter} setter={setPaymentFilter} />
                    </div>
                </div>
            </div>

            {filteredBills.length > 0 ? (
                <>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Total Sales" value={`₹${reportData.metrics.totalSales.toFixed(2)}`} />
                    <StatCard title="Total Profit" value={`₹${reportData.metrics.totalProfit.toFixed(2)}`} />
                    <StatCard title="Total Bills" value={reportData.metrics.totalBills.toString()} />
                    <StatCard title="Avg. Bill Value" value={`₹${reportData.metrics.avgBillValue.toFixed(2)}`} />
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sales Over Time</h2>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.salesOverTimeChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} fontSize={12} />
                                <YAxis tick={{ fill: 'rgb(107 114 128)' }} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(55, 65, 81, 1)', borderRadius: '0.5rem' }} labelStyle={{ color: '#e5e7eb' }} />
                                <Line type="monotone" dataKey="sales" stroke="#d946ef" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Payment Methods</h2>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md h-80 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie data={reportData.paymentChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {reportData.paymentChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(55, 65, 81, 1)', borderRadius: '0.5rem' }} />
                                    <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                         <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Top Selling Items</h2>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.topItemsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'rgb(107 114 128)' }} fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(55, 65, 81, 1)', borderRadius: '0.5rem' }} />
                                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400">No sales data found for the selected filters.</p>
                </div>
            )}
        </div>
    );
};

export default Reports;
