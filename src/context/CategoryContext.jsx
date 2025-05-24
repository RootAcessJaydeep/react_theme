import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as categoryApi from '../api/category';

// Create the context
const CategoryContext = createContext(null);

// Provider component
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({ items: [], total_count: 0 });
  const [productFilters, setProductFilters] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Cache expiration time (in milliseconds) - 5 minutes
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  // Check if cache is expired
  const isCacheExpired = useCallback(() => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_EXPIRATION;
  }, [lastFetchTime]);

  /**
   * Load all categories with caching
   */
  const loadCategories = useCallback(async (forceRefresh = false) => {
    // If data is already loaded and cache is not expired, return cached data
    if (categories.length > 0 && !forceRefresh && !isCacheExpired()) {
      return categories;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getAllCategories();
      const items = data.items || [];
      setCategories(items);
      setLastFetchTime(Date.now());
      return items;
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      return [];
    } finally {
      setLoading(false);
    }
  }, [categories, isCacheExpired]);

  /**
   * Load category tree with caching
   */
  const loadCategoryTree = useCallback(async (rootCategoryId = 2, forceRefresh = false) => {
    // If data is already loaded and cache is not expired, return cached data
    if (categoryTree && !forceRefresh && !isCacheExpired()) {
      return categoryTree;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getCategoryTree(rootCategoryId);
      setCategoryTree(data);
      setLastFetchTime(Date.now());
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load category tree');
      return null;
    } finally {
      setLoading(false);
    }
  }, [categoryTree, isCacheExpired]);

  /**
   * Load category by ID
   */
  const loadCategoryById = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getCategoryById(categoryId);
      setCurrentCategory(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load category ${categoryId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load category by URL key/slug
   */
  const loadCategoryByUrlKey = useCallback(async (urlKey) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getCategoryByUrlKey(urlKey);
      setCurrentCategory(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load category ${urlKey}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load products for a category
   */
  const loadCategoryProducts = useCallback(async (categoryIdentifier, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (typeof categoryIdentifier === 'number') {
        data = await categoryApi.getProductsByCategory(categoryIdentifier, options);
      } else {
        data = await categoryApi.getProductsByCategoryUrlKey(categoryIdentifier, options);
      }
      
      setCategoryProducts(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load products for category ${categoryIdentifier}`);
      return { items: [], total_count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load child categories
   */
  const loadChildCategories = useCallback(async (parentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getChildCategories(parentId);
      return data.items || [];
    } catch (err) {
      setError(err.message || `Failed to load child categories for ${parentId}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load category filters
   */
  const loadCategoryFilters = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getCategoryFilters(categoryId);
      setProductFilters(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load filters for category ${categoryId}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load featured categories
   */
  const loadFeaturedCategories = useCallback(async (limit = 10, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.getFeaturedCategories(limit);
      setLastFetchTime(Date.now());
      return data.items || [];
    } catch (err) {
      setError(err.message || 'Failed to load featured categories');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search categories
   */
  const searchCategoriesByName = useCallback(async (searchTerm, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryApi.searchCategories(searchTerm, limit);
      return data.items || [];
    } catch (err) {
      setError(err.message || `Failed to search categories for "${searchTerm}"`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get breadcrumbs for a category
   */
  const getCategoryBreadcrumbs = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const pathCategories = await categoryApi.getCategoryPath(categoryId);
      return pathCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        url: `/category/${cat.url_key || cat.id}`
      }));
    } catch (err) {
      setError(err.message || `Failed to get breadcrumbs for category ${categoryId}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error utility function
  const clearError = useCallback(() => setError(null), []);

  // Force refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadCategories(true),
      loadCategoryTree(2, true)
    ]);
  }, [loadCategories, loadCategoryTree]);

  // Initialize data on first mount
  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        await Promise.all([
          loadCategories(),
          loadCategoryTree()
        ]);
        setInitialized(true);
      };
      
      initializeData();
    }
  }, [initialized, loadCategories, loadCategoryTree]);

  // Context value
  const value = {
    // State
    categories,
    categoryTree,
    loading,
    error,
    currentCategory,
    categoryProducts,
    productFilters,
    initialized,
    
    // Methods
    loadCategories,
    loadCategoryTree,
    loadCategoryById,
    loadCategoryByUrlKey,
    loadCategoryProducts,
    loadChildCategories,
    loadCategoryFilters,
    loadFeaturedCategories,
    searchCategoriesByName,
    getCategoryBreadcrumbs,
    refreshAllData,
    
    // Utilities
    clearError
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook to use the category context
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};