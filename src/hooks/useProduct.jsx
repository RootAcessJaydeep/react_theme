import { useState, useCallback } from 'react';
import productApi from '../api/product';

/**
 * Custom hook for product operations
 * @returns {Object} Product methods and state
 */
export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState([]);

  // Clear any error messages
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle API errors
  const handleApiError = useCallback((error) => {
    console.error("API Error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { data, status } = error.response;
      
      // Format the error message
      let message = data.message || 'An error occurred';
      
      if (data.parameters) {
        // Replace parameters in the message
        Object.keys(data.parameters).forEach((key) => {
          message = message.replace(`%${key}`, data.parameters[key]);
        });
      }
      
      setError({
        message,
        status,
        data: data.errors || data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      setError({
        message: 'No response from server. Please check your internet connection.',
        status: 0,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      setError({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }, []);

  /**
   * Get products with filters
   * @param {Object} searchCriteria - Search criteria for filtering products
   * @param {number} pageSize - Number of products per page
   * @param {number} currentPage - Current page number
   */
  const getProducts = useCallback(async (searchCriteria = {}, pageSize = 20, currentPage = 1) => {
    setLoading(true);
    clearError();
    
    try {
      // Add pagination to search criteria
      const criteria = {
        ...searchCriteria,
        'searchCriteria[pageSize]': pageSize,
        'searchCriteria[currentPage]': currentPage,
      };
      
      const response = await productApi.getProducts(criteria);
      
      setProducts(response.items || []);
      setTotalCount(response.total_count || 0);
      
      return {
        items: response.items || [],
        total_count: response.total_count || 0
      };
    } catch (err) {
      handleApiError(err);
      return { items: [], total_count: 0 };
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   */
  const getProductBySku = useCallback(async (sku) => {
    setLoading(true);
    clearError();
    
    try {
      const productData = await productApi.getProductBySku(sku);
      setProduct(productData);
      return productData;
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product by ID
   * @param {number} id - Product ID
   */
  const getProductById = useCallback(async (id) => {
    setLoading(true);
    clearError();
    
    try {
      const productData = await productApi.getProductById(id);
      setProduct(productData);
      return productData;
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product by URL key
   * @param {string} urlKey - Product URL key
   */
  const getProductByUrlKey = useCallback(async (urlKey) => {
    setLoading(true);
    clearError();
    
    try {
      const productData = await productApi.getProductByUrlKey(urlKey);
      setProduct(productData);
      
      // Get related products if we have a product with SKU
      if (productData && productData.sku) {
        const related = await productApi.getRelatedProducts(productData.sku);
        setRelatedProducts(related || []);
      }
      
      return productData;
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @param {number} pageSize - Number of products per page
   * @param {number} currentPage - Current page number
   */
  const searchProducts = useCallback(async (searchTerm, pageSize = 20, currentPage = 1) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await productApi.searchProducts(searchTerm, pageSize, currentPage);
      
      setProducts(response.items || []);
      setTotalCount(response.total_count || 0);
      
      return {
        items: response.items || [],
        total_count: response.total_count || 0
      };
    } catch (err) {
      handleApiError(err);
      return { items: [], total_count: 0 };
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get featured products
   * @param {number} pageSize - Number of products to fetch
   */
  const getFeaturedProducts = useCallback(async (pageSize = 10) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await productApi.getFeaturedProducts(pageSize);
      return response.items || [];
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get new products
   * @param {number} pageSize - Number of products to fetch
   */
  const getNewProducts = useCallback(async (pageSize = 10) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await productApi.getNewProducts(pageSize);
      return response.items || [];
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get related products
   * @param {string} sku - Product SKU
   */
  const getRelatedProducts = useCallback(async (sku) => {
    setLoading(true);
    clearError();
    
    try {
      const relatedProductsData = await productApi.getRelatedProducts(sku);
      setRelatedProducts(relatedProductsData);
      return relatedProductsData;
    } catch (err) {
      handleApiError(err);
      setRelatedProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get cross-sell products
   * @param {string} sku - Product SKU
   */
  const getCrossSellProducts = useCallback(async (sku) => {
    setLoading(true);
    clearError();
    
    try {
      return await productApi.getCrossSellProducts(sku);
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get up-sell products
   * @param {string} sku - Product SKU
   */
  const getUpSellProducts = useCallback(async (sku) => {
    setLoading(true);
    clearError();
    
    try {
      return await productApi.getUpSellProducts(sku);
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product attributes
   * @param {string} attributeCode - Attribute code
   */
  const getProductAttributes = useCallback(async (attributeCode) => {
    setLoading(true);
    clearError();
    
    try {
      return await productApi.getProductAttributes(attributeCode);
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product filters for category
   * @param {number} categoryId - Category ID
   */
  const getProductFilters = useCallback(async (categoryId) => {
    setLoading(true);
    clearError();
    
    try {
      const filters = await productApi.getProductFilters(categoryId);
      setFilters(filters || []);
      return filters || [];
    } catch (err) {
      handleApiError(err);
      setFilters([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get product reviews
   * @param {string} sku - Product SKU
   */
  const getProductReviews = useCallback(async (sku) => {
    setLoading(true);
    clearError();
    
    try {
      return await productApi.getProductReviews(sku);
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Submit product review
   * @param {string} sku - Product SKU
   * @param {Object} reviewData - Review data
   */
  const submitProductReview = useCallback(async (sku, reviewData) => {
    setLoading(true);
    clearError();
    
    try {
      return await productApi.submitProductReview(sku, reviewData);
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @param {Object} searchCriteria - Additional search criteria
   */
  const getProductsByCategory = useCallback(async (categoryId, searchCriteria = {}) => {
    setLoading(true);
    clearError();
    
    try {
      console.log("category id", categoryId);
      // Make sure we're calling the method correctly from the imported API
      const response = await productApi.getProductsByCategory(categoryId, searchCriteria);
      
      if (response && response.items) {
        setProducts(response.items);
        setTotalCount(response.total_count || 0);
        
        return {
          items: response.items,
          total_count: response.total_count || 0
        };
      } else {
        console.error("Invalid product response:", response);
        setProducts([]);
        setTotalCount(0);
        return { items: [], total_count: 0 };
      }
    } catch (err) {
      console.error("Error in getProductsByCategory:", err);
      handleApiError(err);
      setProducts([]);
      setTotalCount(0);
      return { items: [], total_count: 0 };
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get best selling products
   * @param {number} pageSize - Number of products to fetch
   */
  const getBestSellingProducts = useCallback(async (pageSize = 10) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await productApi.getBestSellingProducts(pageSize);
      return response.items || [];
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleApiError]);

  /**
   * Get a custom attribute value from the product
   * @param {string} code - The attribute code
   * @returns {string|null} The attribute value or null if not found
   */
  const getCustomAttribute = useCallback((code) => {
    if (!product || !product.custom_attributes) return null;
    
    const attribute = product.custom_attributes.find(
      attr => attr.attribute_code === code
    );
    
    return attribute ? attribute.value : null;
  }, [product]);

  /**
   * Get all product images
   * @returns {Array} Array of image paths
   */
const getProductImages = useCallback(() => {
  if (!product || !product.custom_attributes) {
    console.log('No product or custom attributes found');
    return [];
  }

  const mainImage = getCustomAttribute('image');
  console.log('Main image:', mainImage);

  const additionalImages = product.media_gallery_entries || [];
  console.log('Additional images:', additionalImages);

  // Return an array of objects with 'url' and 'isMain' properties
  const images = [
    { url: mainImage, isMain: true },
    ...additionalImages
      .map(entry => ({ url: entry.file, isMain: false }))
      .filter(image => image.url)
  ];

  console.log('Final images array with main flag:', images);
  return images;
}, [product, getCustomAttribute]);



  /**
   * Get the product price
   * @returns {number} The product price
   */
  const getPrice = useCallback(() => {
    if (!product) return 0;
    
    if (typeof product.price === 'object' && product.price.regularPrice) {
      return product.price.regularPrice.amount.value;
    }
    return product.price;
  }, [product]);

  /**
   * Check if the product is on sale
   * @returns {boolean} True if the product is on sale
   */
  const isOnSale = useCallback(() => {
    const specialPrice = getCustomAttribute('special_price');
    return specialPrice && parseFloat(specialPrice) < getPrice();
  }, [getCustomAttribute, getPrice]);

  /**
   * Get the special price if available
   * @returns {string|null} The special price or null
   */
  const getSpecialPrice = useCallback(() => {
    return getCustomAttribute('special_price');
  }, [getCustomAttribute]);

  /**
   * Clear the current product data
   */
  const clearProduct = useCallback(() => {
    setProduct(null);
    setRelatedProducts([]);
    setError(null);
  }, []);

  return {
    // State
    products,
    product,
    relatedProducts,
    loading,
    error,
    totalCount,
    filters,
    
    // Methods
    getProducts,
    getProductById,
    getProductBySku,
    getProductByUrlKey,
    searchProducts,
    getFeaturedProducts,
    getNewProducts,
    getRelatedProducts,
    getCrossSellProducts,
    getUpSellProducts,
    getProductAttributes,
    getProductFilters,
    getProductReviews,
    submitProductReview,
    getProductsByCategory,
    getBestSellingProducts,
    
    // Product data utilities
    getCustomAttribute,
    getProductImages,
    getPrice,
    isOnSale,
    getSpecialPrice,
    clearProduct,
    
    // Utilities
    clearError
  };
};

// Export as both default and named export for flexibility
export default useProduct;
