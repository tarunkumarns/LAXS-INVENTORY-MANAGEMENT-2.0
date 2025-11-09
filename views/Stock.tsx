import React, { useState, useEffect, useMemo } from 'react';
import * as storageService from '../services/storageService';
import AddItemModal from '../components/AddItemModal';
import BulkAddModal from '../components/BulkAddModal';
import FilterModal, { type StockFilters } from '../components/FilterModal';
import { PlusIcon, PencilIcon, TrashIcon, DocumentAddIcon, FilterIcon } from '../components/icons/ActionIcons';
import type { StockItem } from '../types';

interface StockProps {
  onStockUpdate: () => void;
}

const Stock: React.FC<StockProps> = ({ onStockUpdate }) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StockFilters>({
    status: 'all',
    priceType: 'mrp',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    setStock(storageService.getStockItems());
  }, []);

  const handleAddItem = (item: Omit<StockItem, 'id' | 'salesCount'>) => {
    const newItem = storageService.addStockItem(item);
    setStock(prevStock => [...prevStock, newItem].sort((a,b) => a.name.localeCompare(b.name)));
    onStockUpdate();
  };
  
  const handleBulkAddItems = (items: Omit<StockItem, 'id' | 'salesCount'>[]) => {
    const newItems = storageService.addMultipleStockItems(items);
    setStock(prevStock => [...prevStock, ...newItems].sort((a, b) => a.name.localeCompare(b.name)));
    onStockUpdate();
  };

  const handleUpdateItem = (updatedItem: StockItem) => {
    storageService.updateStockItem(updatedItem);
    setStock(prevStock => prevStock.map(item => item.id === updatedItem.id ? updatedItem : item));
    onStockUpdate();
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      storageService.deleteStockItem(itemId);
      setStock(prevStock => prevStock.filter(item => item.id !== itemId));
      onStockUpdate();
    }
  };
  
  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleApplyFilters = (newFilters: StockFilters) => {
    setFilters(newFilters);
  };

  const filteredStock = useMemo(() => {
    return stock
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item => {
        // Status filter
        if (filters.status === 'inStock') return item.quantity > 1;
        if (filters.status === 'lowStock') return item.quantity > 0 && item.quantity <= 1;
        if (filters.status === 'outOfStock') return item.quantity === 0;
        return true; // 'all'
      })
      .filter(item => {
        // Price filter
        const price = filters.priceType === 'mrp' ? item.mrp : item.buyingPrice;
        const minPrice = parseFloat(filters.minPrice);
        const maxPrice = parseFloat(filters.maxPrice);

        if (!isNaN(minPrice) && price < minPrice) return false;
        if (!isNaN(maxPrice) && price > maxPrice) return false;
        
        return true;
      });
  }, [stock, searchTerm, filters]);
  
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="text-center py-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Stock</h1>
      </header>
      
      <div className="sticky top-4 z-10 flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="flex-shrink-0 flex items-center justify-center px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Bulk add items"
        >
          <DocumentAddIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="relative flex-shrink-0 flex items-center justify-center px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Filter stock items"
        >
          <FilterIcon className="w-6 h-6" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {filteredStock.length > 0 ? (
          filteredStock.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center space-x-4">
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/50 inline-block px-2 py-0.5 rounded-full mt-1">{item.category}</p>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>BP: ₹{item.buyingPrice.toFixed(2)}</span>
                  <span>Profit: ₹{item.profit.toFixed(2)}</span>
                  <span className="font-medium text-gray-600 dark:text-gray-300">MRP: ₹{item.mrp.toFixed(2)}</span>
                </div>
                 <div className={`text-sm font-bold ${item.quantity <= 1 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  Qty: {item.quantity}
                </div>
              </div>
              <div className="flex items-center space-x-0">
                  <button onClick={() => openEditModal(item)} className="p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Edit ${item.name}`}>
                      <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Delete ${item.name}`}>
                      <TrashIcon className="w-5 h-5" />
                  </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">
              {stock.length > 0 ? 'No items found matching your filters.' : 'Your stock is empty. Add an item to get started!'}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label="Add new stock item"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {isModalOpen && <AddItemModal 
        onClose={closeModal} 
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        itemToEdit={editingItem}
      />}
      
      {isBulkModalOpen && <BulkAddModal
        onClose={() => setIsBulkModalOpen(false)}
        onAddItems={handleBulkAddItems}
      />}
      
      {isFilterModalOpen && (
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
        />
      )}
    </div>
  );
};

export default Stock;