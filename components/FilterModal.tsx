import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/ActionIcons';

// Define the filter types here to be shared
export type StockStatusFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';
export type PriceTypeFilter = 'mrp' | 'buyingPrice';
export interface StockFilters {
  status: StockStatusFilter;
  priceType: PriceTypeFilter;
  minPrice: string;
  maxPrice: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: StockFilters) => void;
  currentFilters: StockFilters;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters, currentFilters }) => {
  const [filters, setFilters] = useState<StockFilters>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, isOpen]);
  
  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };
  
  const handleClear = () => {
    const clearedFilters: StockFilters = {
        status: 'all',
        priceType: 'mrp',
        minPrice: '',
        maxPrice: '',
    };
    onApplyFilters(clearedFilters);
    onClose();
  };

  const statusOptions: { label: string, value: StockStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'In Stock', value: 'inStock' },
    { label: 'Low Stock', value: 'lowStock' },
    { label: 'Out of Stock', value: 'outOfStock' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filter Stock</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 space-y-6">
          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, status: option.value })}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    filters.status === option.value
                      ? 'bg-primary-600 text-white shadow'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
            <div className="flex items-center space-x-2 mb-2">
              <select
                value={filters.priceType}
                onChange={e => setFilters({ ...filters, priceType: e.target.value as PriceTypeFilter })}
                className="block w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="mrp">MRP</option>
                <option value="buyingPrice">Buying Price</option>
              </select>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="p-4 border-t dark:border-gray-700 grid grid-cols-2 gap-3">
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
            <button
              onClick={handleApply}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Apply Filters
            </button>
        </footer>
      </div>
    </div>
  );
};

export default FilterModal;