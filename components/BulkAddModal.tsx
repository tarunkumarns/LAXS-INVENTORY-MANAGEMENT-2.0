import React, { useState, useEffect } from 'react';
import { generateImageForItem } from '../services/geminiService';
import { PlusIcon, TrashIcon, XIcon, CameraIcon } from './icons/ActionIcons';
import type { StockItem } from '../types';
import * as authService from '../services/authService';

interface BulkAddModalProps {
  onClose: () => void;
  onAddItems: (items: Omit<StockItem, 'id' | 'salesCount'>[]) => void;
}

type BulkItem = {
  key: number;
  name: string;
  category: string;
  buyingPrice: string;
  profit: string;
  mrp: string;
  quantity: string;
};

const BulkAddModal: React.FC<BulkAddModalProps> = ({ onClose, onAddItems }) => {
  const [items, setItems] = useState<BulkItem[]>([
    { key: Date.now(), name: '', category: '', buyingPrice: '', profit: '', mrp: '', quantity: '' },
  ]);
  const [generateWithAI, setGenerateWithAI] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isGuest = authService.getCurrentUser()?.id === 'guest_user_session';

  useEffect(() => {
    if (isGuest) {
      setGenerateWithAI(false);
    }
  }, [isGuest]);


  const handleInputChange = (index: number, field: keyof Omit<BulkItem, 'key'>, value: string) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-calculation logic
    const bp = parseFloat(currentItem.buyingPrice);
    const p = parseFloat(currentItem.profit);
    const m = parseFloat(currentItem.mrp);

    if (field === 'buyingPrice' || field === 'profit') {
      if (!isNaN(bp) && !isNaN(p)) currentItem.mrp = (bp + p).toFixed(2);
    } else if (field === 'mrp') {
      if (!isNaN(m) && !isNaN(bp)) currentItem.profit = (m - bp).toFixed(2);
    }
    
    newItems[index] = currentItem;
    setItems(newItems);
  };

  const addRow = () => {
    if (items.length >= 150) {
        alert("You can add a maximum of 150 items at a time.");
        return;
    }
    setItems([
      ...items,
      { key: Date.now(), name: '', category: '', buyingPrice: '', profit: '', mrp: '', quantity: '' },
    ]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validItems: Omit<StockItem, 'id' | 'salesCount'>[] = [];
    
    // Filter out empty rows and validate
    const filledRows = items.filter(item => item.name && item.category && item.buyingPrice && item.mrp && item.quantity);
    if(filledRows.length === 0) {
      alert("Please fill in at least one item's details completely.");
      setIsLoading(false);
      return;
    }

    try {
        // API Key Check if needed for AI Generation
        if (generateWithAI && (window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        
        const imageGenerationPromises = filledRows.map(item => {
            if (generateWithAI) {
                return generateImageForItem(item.name).catch(err => {
                    console.error(`Failed to generate image for ${item.name}:`, err);
                    return `https://picsum.photos/seed/${encodeURIComponent(item.name)}/200`; // Fallback
                });
            }
            return Promise.resolve(`https://picsum.photos/seed/${encodeURIComponent(item.name)}/200`);
        });

        const imageUrls = await Promise.all(imageGenerationPromises);

        for (let i = 0; i < filledRows.length; i++) {
            const item = filledRows[i];
            validItems.push({
                name: item.name,
                category: item.category,
                buyingPrice: parseFloat(item.buyingPrice),
                profit: parseFloat(item.profit),
                mrp: parseFloat(item.mrp),
                quantity: parseInt(item.quantity, 10),
                imageUrl: imageUrls[i],
            });
        }

        onAddItems(validItems);
        onClose();

    } catch (error) {
        console.error("Error processing bulk add:", error);
        alert("An error occurred while adding items. Please check the console for details.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-full flex flex-col">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bulk Add Items</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4">
          <div className={`bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg flex items-center justify-between ${isGuest ? 'opacity-60' : ''}`}>
            <label htmlFor="generate-ai" className={`flex items-center ${isGuest ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <CameraIcon className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-primary-800 dark:text-primary-200">Generate product images with AI</span>
              {isGuest && <span className="ml-2 text-xs font-bold text-yellow-600 dark:text-yellow-400">(Sign-up required)</span>}
            </label>
            <input 
              type="checkbox" 
              id="generate-ai"
              checked={generateWithAI}
              onChange={(e) => setGenerateWithAI(e.target.checked)}
              disabled={isGuest}
              className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
            />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 px-2 pb-2 border-b dark:border-gray-700">
                  <div className="col-span-2">Category</div>
                  <div className="col-span-3">Product Name</div>
                  <div className="col-span-2">Buying Price</div>
                  <div className="col-span-1">Profit</div>
                  <div className="col-span-2">Selling Price</div>
                  <div className="col-span-1">Quantity</div>
                  <div className="col-span-1"></div>
              </div>
              {/* Item Rows */}
              <div className="space-y-2 pt-2">
                {items.map((item, index) => (
                  <div key={item.key} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" placeholder="e.g. Fruits" value={item.category} onChange={e => handleInputChange(index, 'category', e.target.value)} required className="form-input col-span-2" />
                    <input type="text" placeholder="e.g. Apple" value={item.name} onChange={e => handleInputChange(index, 'name', e.target.value)} required className="form-input col-span-3" />
                    <input type="number" placeholder="e.g. 80" value={item.buyingPrice} onChange={e => handleInputChange(index, 'buyingPrice', e.target.value)} required className="form-input col-span-2" />
                    <input type="number" placeholder="Auto" value={item.profit} onChange={e => handleInputChange(index, 'profit', e.target.value)} required className="form-input col-span-1" />
                    <input type="number" placeholder="e.g. 100" value={item.mrp} onChange={e => handleInputChange(index, 'mrp', e.target.value)} required className="form-input col-span-2" />
                    <input type="number" placeholder="e.g. 50" value={item.quantity} onChange={e => handleInputChange(index, 'quantity', e.target.value)} required className="form-input col-span-1" />
                    <button type="button" onClick={() => removeRow(index)} disabled={items.length <= 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 col-span-1">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <style>{`
                  .form-input {
                    display: block; width: 100%; font-size: 0.875rem; padding: 0.5rem;
                    background-color: white; border: 1px solid #d1d5db; border-radius: 0.375rem;
                  }
                  .dark .form-input {
                    background-color: #374151; border-color: #4b5563;
                  }
                `}</style>
              </div>
            </div>
          </div>

          <button type="button" onClick={addRow} className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            <PlusIcon className="w-4 h-4 mr-1" /> Add Another Item
          </button>
        </form>

        <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0 flex justify-end space-x-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:bg-primary-300">
            {isLoading ? 'Saving...' : `Save All ${items.filter(i=>i.name).length} Items`}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BulkAddModal;