import type { User, AuthResult } from '../types';

const CURRENT_USER_KEY = 'current_user';
const ALL_USERS_KEY = 'inventory_users';

// Helper to manage the list of all registered users
const getAllUsers = (): string[] => {
    const usersJson = localStorage.getItem(ALL_USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const addUser = (userId: string): void => {
    const users = getAllUsers();
    if (!users.includes(userId)) {
        users.push(userId);
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

const loginUser = (user: User): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const handleEmailAuth = async (email: string, isSignUp: boolean): Promise<AuthResult> => {
    await new Promise(res => setTimeout(res, 500));
    if (!email || !email.includes('@')) {
        throw new Error('Invalid email address.');
    }
    const lowerCaseEmail = email.toLowerCase();
    const allUsers = getAllUsers();
    const userExists = allUsers.includes(lowerCaseEmail);

    if (isSignUp) {
        if (userExists) {
            throw new Error('An account with this email already exists. Please sign in.');
        }
        addUser(lowerCaseEmail);
        const user: User = { id: lowerCaseEmail };
        loginUser(user);
        return { user, isNew: true };
    } else { // Sign In
        if (!userExists) {
            // As a fallback for previously created users before the user list existed
            const oldUser = localStorage.getItem(`${lowerCaseEmail}_inventory_stock`);
            if (!oldUser) {
                throw new Error('No account found with this email. Please sign up.');
            }
        }
        const user: User = { id: lowerCaseEmail };
        loginUser(user);
        return { user, isNew: false };
    }
};

export const sendOtp = async (phone: string): Promise<boolean> => {
  await new Promise(res => setTimeout(res, 1000));
  if (!phone || !/^\d{10}$/.test(phone)) {
    throw new Error('Invalid phone number. Must be 10 digits.');
  }
  console.log(`Simulating OTP sent to ${phone}. OTP is 123456`);
  return true;
};

export const handlePhoneAuth = async (phone: string, otp: string, isSignUp: boolean): Promise<AuthResult> => {
    await new Promise(res => setTimeout(res, 500));
    if (otp !== '123456') {
        throw new Error('Invalid OTP.');
    }
    
    const allUsers = getAllUsers();
    const userExists = allUsers.includes(phone);
    
    if (isSignUp) {
        if (userExists) {
            throw new Error('An account with this phone number already exists. Please sign in.');
        }
        addUser(phone);
        const user: User = { id: phone };
        loginUser(user);
        return { user, isNew: true };
    } else { // Sign In
        // As a fallback for previously created users before the user list existed
        const oldUser = localStorage.getItem(`${phone}_inventory_stock`);
        if (!userExists && !oldUser) {
           throw new Error('No account found with this phone number. Please sign up.');
        }
        const user: User = { id: phone };
        loginUser(user);
        return { user, isNew: false };
    }
};


export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
