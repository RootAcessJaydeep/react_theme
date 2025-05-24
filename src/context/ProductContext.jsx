import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import productApi from '../api/product';

// Create the context
const ProductContext = createContext();

/**
 * Custom hook to use the product context
 * @returns {Object} Product context value
 */
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

/**
 * Product Provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const ProductProvider = ({ children }) => {
  // State for storing product data
  const [featuredProducts, setFeaturedProducts] = useState(null);
  const [newProducts, setNewProducts] = useState(null);
  const [bestSellingProducts, setBestSellingProducts] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [productAttributes, setProductAttributes] = useState({});
  const [productFilters, setProductFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} Featured products
   */
  const loadFeaturedProducts = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      
      // Check if we already have featured products
      if (featuredProducts) {
        setLoading(false);
        return featuredProducts;
      }
      
      const data = await productApi.getFeaturedProducts(limit);
      setFeaturedProducts(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError(err.message || 'Failed to load featured products');
      setLoading(false);
      throw err;
    }
  }, [featuredProducts]);

  /**
   * Load new products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} New products
   */
  const loadNewProducts = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      
      // Check if we already have new products
      if (newProducts) {
        setLoading(false);
        return newProducts;
      }
      
      const data = await productApi.getNewProducts(limit);
      setNewProducts(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error loading new products:', err);
      setError(err.message || 'Failed to load new products');
      setLoading(false);
      throw err;
    }
  }, [newProducts]);

  /**
   * Load best selling products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} Best selling products
   */
  const loadBestSellingProducts = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      
      // Check if we already have best selling products
      if (bestSellingProducts) {
        setLoading(false);
        return bestSellingProducts;
      }
      
      const data = await productApi.getBestSellingProducts(limit);
      setBestSellingProducts(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error loading best selling products:', err);
      setError(err.message || 'Failed to load best selling products');
      setLoading(false);
      throw err;
    }
  }, [bestSellingProducts]);

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @param {Object} options - Search criteria options
   * @returns {Promise<Object>} Products in the category
   */
  const getProductsByCategory = useCallback(async (categoryId, options = {}) => {
    try {
      setLoading(true);
      
      // Create a cache key for this specific category and options
      const cacheKey = `${categoryId}-${JSON.stringify(options)}`;
      
      // Check if we already have products for this category with these options
      if (productsByCategory[cacheKey]) {
        setLoading(false);
        return productsByCategory[cacheKey];
      }
      
      const data = await productApi.getProductsByCategory(categoryId, options);
      
      // Update the productsByCategory state
      setProductsByCategory(prev => ({
        ...prev,
        [cacheKey]: data
      }));
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error(`Error loading products for category ${categoryId}:`, err);
      setError(err.message || `Failed to load products for category ${categoryId}`);
      setLoading(false);
      throw err;
    }
  }, [productsByCategory]);

  /**
   * Get product details by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Object>} Product details
   */
  const getProductBySku = useCallback(async (sku) => {
    try {
      // Check if we already have this product in our context
      if (productDetails[sku]) {
        return productDetails[sku];
      }
      
      const product = await productApi.getProductBySku(sku);
      
      // Update the productDetails state
      setProductDetails(prev => ({
        ...prev,
        [sku]: product
      }));
      
      return product;
    } catch (err) {
      console.error(`Error fetching product with SKU ${sku}:`, err);
      throw err;
    }
  }, [productDetails]);

  /**
   * Get product details by URL key
   * @param {string} urlKey - Product URL key
   * @returns {Promise<Object>} Product details
   */
  const getProductByUrlKey = useCallback(async (urlKey) => {
    try {
      // Check if we already have this product in our context by URL key
      const existingProduct = Object.values(productDetails).find(
        product => product.url_key === urlKey
      );
      
      if (existingProduct) {
        return existingProduct;
      }
      
      const product = await productApi.getProductByUrlKey(urlKey);
      
      // Update the productDetails state
      setProductDetails(prev => ({
        ...prev,
        [product.sku]: product
      }));
      
      return product;
    } catch (err) {
      console.error(`Error fetching product with URL key ${urlKey}:`, err);
      throw err;
    }
  }, [productDetails]);

  /**
   * Get product attributes
   * @param {string} attributeCode - Attribute code
   * @returns {Promise<Object>} Attribute data
   */
  const getProductAttributes = useCallback(async (attributeCode) => {
    try {
      // Check if we already have this attribute in our context
      if (productAttributes[attributeCode]) {
        return productAttributes[attributeCode];
      }
      
      const attribute = await productApi.getProductAttributes(attributeCode);
      
      // Update the productAttributes state
      setProductAttributes(prev => ({
        ...prev,
        [attributeCode]: attribute
      }));
      
      return attribute;
    } catch (err) {
      console.error(`Error fetching product attribute ${attributeCode}:`, err);
      throw err;
    }
  }, [productAttributes]);

  /**
   * Get product filters for category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Array>} Available filters
   */
  const getProductFilters = useCallback(async (categoryId) => {
    try {
      // Check if we already have filters for this category
      if (productFilters[categoryId]) {
        return productFilters[categoryId];
      }
      
      const filters = await productApi.getProductFilters(categoryId);
      
      // Update the productFilters state
      setProductFilters(prev => ({
        ...prev,
        [categoryId]: filters
      }));
      
      return filters;
    } catch (err) {
      console.error(`Error fetching filters for category ${categoryId}:`, err);
      throw err;
    }
  }, [productFilters]);

  /**
   * Get related products
   * @param {string} sku - Product SKU
   * @returns {Promise<Array>} Related products
   */
  const getRelatedProducts = useCallback(async (sku) => {
    try {
      const relatedProducts = await productApi.getRelatedProducts(sku);
      
      // Add related products to our product details cache
      const updatedDetails = { ...productDetails };
      relatedProducts.forEach(product => {
        updatedDetails[product.sku] = product;
      });
      
      setProductDetails(updatedDetails);
      
      return relatedProducts;
    } catch (err) {
      console.error(`Error fetching related products for SKU ${sku}:`, err);
      throw err;
    }
  }, [productDetails]);

  /**
   * Search products by name
   * @param {string} searchTerm - Search term
   * @param {number} pageSize - Number of products per page
   * @param {number} currentPage - Current page number
   * @returns {Promise<Object>} Search results
   */
  const searchProducts = useCallback(async (searchTerm, pageSize = 20, currentPage = 1) => {
    try {
      return await productApi.searchProducts(searchTerm, pageSize, currentPage);
    } catch (err) {
      console.error(`Error searching products for "${searchTerm}":`, err);
      throw err;
    }
  }, []);

  /**
   * Clear product cache for a specific category
   * @param {number} categoryId - Category ID to clear from cache
   */
  const clearCategoryCache = useCallback((categoryId) => {
    setProductsByCategory(prev => {
      const updated = { ...prev };
      // Remove all entries for this category (with any options)
      Object.keys(updated).forEach(key => {
        if (key.startsWith(`${categoryId}-`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  }, []);

  /**
   * Clear all product caches
   */
  const clearAllCaches = useCallback(() => {
    setFeaturedProducts(null);
    setNewProducts(null);
    setBestSellingProducts(null);
    setProductsByCategory({});
    setProductDetails({});
    setProductAttributes({});
    setProductFilters({});
  }, []);

  // Context value
  const value = {
    // Data
    featuredProducts,
    newProducts,
    bestSellingProducts,
    productDetails,
    productAttributes,
    
    // Loading state
    loading,
    error,
    
    // Methods
    loadFeaturedProducts,
    loadNewProducts,
    loadBestSellingProducts,
    getProductsByCategory,
    getProductBySku,
    getProductByUrlKey,
    getProductAttributes,
    getProductFilters,
    getRelatedProducts,
    searchProducts,
    clearCategoryCache,
    clearAllCaches
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;