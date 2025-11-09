import React, { useState } from 'react';
import * as authService from '../services/authService';
import type { AuthResult } from '../types';
import { StockIcon } from '../components/icons/NavigationIcons';

interface LoginProps {
  onAuthSuccess: (authResult: AuthResult) => void;
}

type LoginMethod = 'email' | 'phone';

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (authFn: () => Promise<AuthResult>) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authFn();
      onAuthSuccess(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth(() => authService.handleEmailAuth(email, isSignUp));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
      setError('A demo OTP has been sent: 123456');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth(() => authService.handlePhoneAuth(phone, otp, isSignUp));
  };


  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
            <header className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-primary-100 dark:bg-primary-900 p-4 rounded-full mb-4">
                    <StockIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Laxs</span> Inventory</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{isSignUp ? 'Create a new account to get started.' : 'Sign in to manage your business.'}</p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button onClick={() => setLoginMethod('email')} className={`w-1/2 py-3 font-medium text-center transition-colors ${loginMethod === 'email' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}>Email</button>
                    <button onClick={() => setLoginMethod('phone')} className={`w-1/2 py-3 font-medium text-center transition-colors ${loginMethod === 'phone' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}>Phone</button>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                           {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>
                )}

                {loginMethod === 'phone' && !otpSent && (
                     <form onSubmit={handleSendOtp} className="space-y-6">
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                               <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">+91</span>
                               <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="block w-full flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-none rounded-r-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="9876543210" />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                           {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                 {loginMethod === 'phone' && otpSent && (
                     <form onSubmit={handleVerifyOtp} className="space-y-6">
                         <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                            <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                           {isLoading ? 'Verifying...' : (isSignUp ? 'Verify & Sign Up' : 'Verify & Sign In')}
                        </button>
                        <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-sm text-primary-600 hover:underline">
                            Change Number
                        </button>
                    </form>
                )}

            </div>
             <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-medium text-primary-600 hover:text-primary-500">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
             </div>
             <div className="text-center mt-6">
                <button
                    onClick={() => onAuthSuccess({ user: { id: 'guest_user_session' }, isNew: false })}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    Skip for now & browse as guest
                </button>
            </div>
        </div>
    </div>
  );
};

export default Login;
