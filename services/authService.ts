import type { User } from '../types';

const CURRENT_USER_KEY = 'current_user';

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

export const loginWithEmail = async (email: string): Promise<User> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email address.');
  }
  const user: User = { id: email.toLowerCase() };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const sendOtp = async (phone: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));
  if (!phone || !/^\d{10}$/.test(phone)) {
    throw new Error('Invalid phone number. Must be 10 digits.');
  }
  // In a real app, you would call an OTP service here.
  console.log(`Simulating OTP sent to ${phone}. OTP is 123456`);
  return true;
};

export const verifyOtp = async (phone: string, otp: string): Promise<User> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  // In a real app, you would verify the OTP with your backend service.
  if (otp === '123456') {
    const user: User = { id: phone };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid OTP.');
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
