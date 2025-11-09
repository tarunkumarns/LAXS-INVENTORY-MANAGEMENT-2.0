import React, { useState, useEffect } from 'react';
import Home from './views/Home';
import Billing from './views/Billing';
import Stock from './views/Stock';
import History from './views/History';
import Profile from './views/Profile';
import Profit from './views/Profit';
import Reports from './views/Reports';
import Login from './views/Login';
import OnboardingModal from './components/OnboardingModal';
import { HomeIcon, BillingIcon, StockIcon, HistoryIcon, ProfitIcon } from './components/icons/NavigationIcons';
import * as storageService from './services/storageService';
import * as authService from './services/authService';
import type { AppView, User, AuthResult } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<AppView>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check for logged in user
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      storageService.initializeData(false); // Ensure data is initialized for the logged-in user
    }
    setIsLoading(false);

    // Theme setup
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleDataUpdate = () => {
    const currentView = view;
    setView('home'); 
    setTimeout(() => setView(currentView), 0);
  };
  
  const handleAuthSuccess = (authResult: AuthResult) => {
    setCurrentUser(authResult.user);
    storageService.initializeData(authResult.isNew);
    if (authResult.isNew) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('home'); // Reset to home view on logout
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home navigateTo={setView} currentUser={currentUser} onLogout={handleLogout}/>;
      case 'billing':
        return <Billing onBillingSuccess={handleDataUpdate} navigateTo={setView}/>;
      case 'stock':
        return <Stock onStockUpdate={handleDataUpdate} />;
      case 'history':
        return <History />;
      case 'profit':
          return <Profit />;
      case 'reports':
          return <Reports />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      default:
        return <Home navigateTo={setView} currentUser={currentUser} onLogout={handleLogout}/>;
    }
  };

  const NavItem: React.FC<{
    label: AppView;
    icon: React.ElementType;
  }> = ({ label, icon: Icon }) => {
    const isActive = view === label;
    return (
      <button
        onClick={() => setView(label)}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
          isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-6 h-6 mb-1" />
        <span className={`text-xs font-medium`}>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
      </button>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <main>
        {renderView()}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-t-lg flex justify-around z-20">
        <NavItem label="home" icon={HomeIcon} />
        <NavItem label="billing" icon={BillingIcon} />
        <NavItem label="stock" icon={StockIcon} />
        <NavItem label="history" icon={HistoryIcon} />
        <NavItem label="profit" icon={ProfitIcon} />
      </nav>
    </div>
  );
};

export default App;
