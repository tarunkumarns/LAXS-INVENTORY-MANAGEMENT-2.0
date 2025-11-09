import React, { useState, useEffect, useRef } from 'react';
import * as storageService from '../services/storageService';
import { getBusinessSuggestion } from '../services/geminiService';
import { XIcon, SparklesIcon } from './icons/ActionIcons';

interface AICompanionModalProps {
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AICompanionModal: React.FC<AICompanionModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your Laxs AI assistant. How can I help you improve your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionPrompts = [
    "How can I increase my sales?",
    "Which items should I promote?",
    "Give me ideas for a new product category.",
    "Analyze my worst-selling items.",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const generateBusinessContext = (): string => {
    const stock = storageService.getStockItems();
    const bills = storageService.getBills();

    const topSelling = [...stock].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
    const lowStock = stock.filter(item => item.quantity > 0 && item.quantity <= 5);
    const outOfStock = stock.filter(item => item.quantity === 0);
    
    let context = "Here is a summary of the business data:\n";
    context += `Total Items in Stock: ${stock.length}\n`;
    context += `Top 5 Selling Items: ${topSelling.map(i => `${i.name} (${i.salesCount} sold)`).join(', ')}\n`;
    context += `Low Stock Items (<= 5 left): ${lowStock.map(i => `${i.name} (${i.quantity} left)`).join(', ')}\n`;
    context += `Out of Stock Items: ${outOfStock.map(i => i.name).join(', ')}\n`;
    
    // Recent sales summary
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentBills = bills.filter(b => b.createdAt > oneWeekAgo);
    const recentSales = recentBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const recentProfit = recentBills.reduce((sum, b) => sum + b.totalProfit, 0);
    context += `Total sales in the last 7 days: ₹${recentSales.toFixed(2)}\n`;
    context += `Total profit in the last 7 days: ₹${recentProfit.toFixed(2)}\n`;

    return context;
  };

  const handleSend = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: prompt }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        const context = generateBusinessContext();
        const aiResponse = await getBusinessSuggestion(prompt, context);
        setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        let errorMessage = "Sorry, I encountered an error. Please try again.";
        if (error instanceof Error && (error.message.includes("PERMISSION_DENIED") || error.message.includes("API key not valid"))) {
          errorMessage = "API key permission denied. Please select a valid key and try again.";
        }
        setMessages([...newMessages, { sender: 'ai', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Laxs AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>}
              <div
                className={`max-w-md p-3 rounded-2xl text-sm ${msg.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                 <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t dark:border-gray-700">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestionPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for business advice..."
              disabled={isLoading}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 disabled:bg-primary-300"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default AICompanionModal;
