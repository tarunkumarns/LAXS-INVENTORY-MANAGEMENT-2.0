import React, { useState, useRef, useEffect } from 'react';
import { generateImageForItem } from '../services/geminiService';
import { CameraIcon, UploadIcon } from './icons/ActionIcons';
import type { StockItem } from '../types';
import * as authService from '../services/authService';

interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: Omit<StockItem, 'id' | 'salesCount'>) => void;
  onUpdateItem: (item: StockItem) => void;
  itemToEdit?: StockItem | null;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem, onUpdateItem, itemToEdit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [profit, setProfit] = useState('');
  const [mrp, setMrp] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!itemToEdit;
  const isGuest = authService.getCurrentUser()?.id === 'guest_user_session';

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category || '');
      setBuyingPrice(String(itemToEdit.buyingPrice));
      setProfit(String(itemToEdit.profit));
      setMrp(String(itemToEdit.mrp));
      setQuantity(String(itemToEdit.quantity));
      setImageUrl(itemToEdit.imageUrl);
    }
  }, [itemToEdit]);

  const handleBuyingPriceChange = (value: string) => {
    setBuyingPrice(value);
    const bp = parseFloat(value);
    const p = parseFloat(profit);
    if (!isNaN(bp) && !isNaN(p)) {
      setMrp((bp + p).toFixed(2));
    }
  };

  const handleProfitChange = (value: string) => {
    setProfit(value);
    const p = parseFloat(value);
    const bp = parseFloat(buyingPrice);
    if (!isNaN(p) && !isNaN(bp)) {
      setMrp((bp + p).toFixed(2));
    }
  };

  const handleMrpChange = (value: string) => {
    setMrp(value);
    const m = parseFloat(value);
    const bp = parseFloat(buyingPrice);
    if (!isNaN(m) && !isNaN(bp)) {
      setProfit((m - bp).toFixed(2));
    }
  };

  const handleGenerateImage = async () => {
    if (!name) {
      alert('Please enter an item name first.');
      return;
    }
    
    // Double check if user is a guest
    if (isGuest) {
      alert('Please sign up to generate images with AI. This feature is for signed-in users only.');
      return;
    }

    setIsGenerating(true);
    try {
      // API Key Check for AI Studio environment
      if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const generatedUrl = await generateImageForItem(name);
      setImageUrl(generatedUrl);
    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      let errorMessage = "Failed to generate image. A placeholder has been used.";
      if (error instanceof Error) {
        if (error.message.includes("PERMISSION_DENIED") || error.message.includes("API key not valid")) {
          errorMessage = "API key permission denied. Please select a valid key and try again. A placeholder has been used in the meantime.";
        } else if (error.message) {
           errorMessage = `Error generating image: ${error.message}. A placeholder image has been used.`;
        }
      }
      alert(errorMessage);
      setImageUrl(`https://picsum.photos/seed/${name}/200`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !buyingPrice || !profit || !mrp || !imageUrl || !quantity) {
      alert('Please fill all fields and provide an image.');
      return;
    }

    const itemData = {
      name,
      category,
      buyingPrice: parseFloat(buyingPrice),
      profit: parseFloat(profit),
      mrp: parseFloat(mrp),
      quantity: parseInt(quantity, 10),
      imageUrl,
    };

    if (isEditMode && itemToEdit) {
      onUpdateItem({
        ...itemToEdit,
        ...itemData,
      });
    } else {
      onAddItem(itemData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-full overflow-y-auto">
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{isEditMode ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                    <img src={imageUrl} alt="Item" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-gray-400 text-xs text-center">No Image</span>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <button type="button" onClick={handleGenerateImage} disabled={isGenerating || isGuest} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed">
                        <CameraIcon className="w-5 h-5 mr-2" />
                        {isGenerating ? 'Generating...' : 'AI Generate'}
                    </button>
                    {isGuest && <p className="text-xs text-center text-gray-500 dark:text-gray-400">Sign up to use AI</p>}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Upload
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="buyingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buying Price (₹)</label>
                    <input type="number" step="0.01" id="buyingPrice" value={buyingPrice} onChange={(e) => handleBuyingPriceChange(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="profit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profit (₹)</label>
                    <input type="number" step="0.01" id="profit" value={profit} onChange={(e) => handleProfitChange(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="mrp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">MRP (₹)</label>
                    <input type="number" step="0.01" id="mrp" value={mrp} onChange={(e) => handleMrpChange(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                    <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">{isEditMode ? 'Update Item' : 'Save Item'}</button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
