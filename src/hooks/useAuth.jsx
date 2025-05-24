import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as authApi from '../api/auth';
import axios from "axios";
import {
  AUTH_TOKEN_KEY,
  USER_INFO_KEY,
  CART_KEY,
  ADMIN_TOKEN_KEY,
  MAGENTO_GUEST_CART_ID,
} from "../constants/storageKeys";

/**
 * Create the auth context
 */
const AuthContext = createContext();

/**
 * Auth provider component
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const userData = await authApi.getCurrentCustomer();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        // If token is invalid, clear it
        if (err.response?.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    console.log("hooks tested",email)
    setLoading(true);
    setError(null);
    
    try {
      await authApi.login(email, password);
      const userData = await authApi.getCurrentCustomer();
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.register(userData);
      // After registration, log the user in
      await authApi.login(userData.email, userData.password);
      const customerData = await authApi.getCurrentCustomer();
      setCurrentUser(customerData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
     localStorage.removeItem(AUTH_TOKEN_KEY);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, clear local data
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.requestPasswordReset(email);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (email, resetToken, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.resetPassword(email, resetToken, newPassword);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authApi.updateCustomerInfo(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth context value
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Export the useAuth hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
