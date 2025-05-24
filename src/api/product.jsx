import { getAuthenticatedMagentoApi } from './auth';
import { PRODUCT_CACHE_KEYS, getCachedProductData } from './productCacheUtils';

/**
 * Get products with filters
 * @param {Object} searchCriteria - Search criteria for filtering products
 * @returns {Promise} - Promise resolving to products data
 */
export const getProducts = async (searchCriteria = {}) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.ALL_PRODUCTS(searchCriteria),
    async () => {
      try {
        // Build search criteria query
        const defaultCriteria = {
          'searchCriteria[pageSize]': 20,
          'searchCriteria[currentPage]': 1,
        };
        
        const params = { ...defaultCriteria, ...searchCriteria };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get product by SKU
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to product data
 */
export const getProductBySku = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_BY_SKU(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get(`/products/${encodeURIComponent(sku)}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching product with SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_DETAIL'
  );
};

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Promise} - Promise resolving to product data
 */
export const getProductById = async (id) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_BY_ID(id),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get(`/products/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw error;
      }
    },
    'PRODUCT_DETAIL'
  );
};

/**
 * Search products by name
 * @param {string} searchTerm - Search term
 * @param {number} pageSize - Number of products per page
 * @param {number} currentPage - Current page number
 * @returns {Promise} - Promise resolving to search results
 */
export const searchProducts = async (searchTerm, pageSize = 20, currentPage = 1) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.SEARCH_PRODUCTS(searchTerm, currentPage, pageSize),
    async () => {
      try {
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[currentPage]': currentPage,
          'searchCriteria[filterGroups][0][filters][0][field]': 'name',
          'searchCriteria[filterGroups][0][filters][0][value]': `%${searchTerm}%`,
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'like',
        };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        return response.data;
      } catch (error) {
        console.error(`Error searching products for "${searchTerm}":`, error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get featured products
 * @param {number} pageSize - Number of products to fetch
 * @returns {Promise} - Promise resolving to featured products
 */
export const getFeaturedProducts = async (pageSize = 10) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.FEATURED_PRODUCTS(pageSize),
    async () => {
      try {
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[filterGroups][0][filters][0][field]': 'visibility',
          'searchCriteria[filterGroups][0][filters][0][value]': '4',
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
          'searchCriteria[filterGroups][1][filters][0][field]': 'status',
          'searchCriteria[filterGroups][1][filters][0][value]': '1',
          'searchCriteria[filterGroups][1][filters][0][conditionType]': 'eq',
          'searchCriteria[sortOrders][0][field]': 'created_at',
          'searchCriteria[sortOrders][0][direction]': 'DESC',
        };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get new products
 * @param {number} pageSize - Number of products to fetch
 * @returns {Promise} - Promise resolving to new products
 */
export const getNewProducts = async (pageSize = 10) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.NEW_PRODUCTS(pageSize),
    async () => {
      try {
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[filterGroups][0][filters][0][field]': 'visibility',
          'searchCriteria[filterGroups][0][filters][0][value]': '4',
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
          'searchCriteria[filterGroups][1][filters][0][field]': 'status',
          'searchCriteria[filterGroups][1][filters][0][value]': '1',
          'searchCriteria[filterGroups][1][filters][0][conditionType]': 'eq',
          'searchCriteria[sortOrders][0][field]': 'created_at',
          'searchCriteria[sortOrders][0][direction]': 'DESC',
        };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching new products:', error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get product by URL key
 * @param {string} urlKey - Product URL key
 * @returns {Promise} - Promise resolving to product data
 */
export const getProductByUrlKey = async (urlKey) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_BY_URL_KEY(urlKey),
    async () => {
      try {
        const params = {
          'searchCriteria[filterGroups][0][filters][0][field]': 'url_key',
          'searchCriteria[filterGroups][0][filters][0][value]': urlKey,
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
        };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        
        if (response.data.items && response.data.items.length > 0) {
          return response.data.items[0];
        }
        
        throw new Error('Product not found');
      } catch (error) {
        console.error(`Error fetching product with URL key ${urlKey}:`, error);
        throw error;
      }
    },
    'PRODUCT_DETAIL'
  );
};

/**
 * Get related products
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to related products
 */
export const getRelatedProducts = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.RELATED_PRODUCTS(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call for related products links
        const response = await magentoApi.get(`/products/${encodeURIComponent(sku)}/links/related`);
        
        // Fetch full product details for each related product
        const relatedSkus = response.data.map(item => item.linked_product_sku);
        
        if (relatedSkus.length > 0) {
          const params = {
            'searchCriteria[filterGroups][0][filters][0][field]': 'sku',
            'searchCriteria[filterGroups][0][filters][0][value]': relatedSkus.join(','),
            'searchCriteria[filterGroups][0][filters][0][conditionType]': 'in',
          };
          
          const productsResponse = await magentoApi.get('/products', { params });
          return productsResponse.data.items || [];
        }
        
        return [];
      } catch (error) {
        console.error(`Error fetching related products for SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get cross-sell products
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to cross-sell products
 */
export const getCrossSellProducts = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.CROSS_SELL(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call for cross-sell products links
        const response = await magentoApi.get(`/products/${encodeURIComponent(sku)}/links/crosssell`);
        
        // Fetch full product details for each cross-sell product
        const crossSellSkus = response.data.map(item => item.linked_product_sku);
        
        if (crossSellSkus.length > 0) {
          const params = {
            'searchCriteria[filterGroups][0][filters][0][field]': 'sku',
            'searchCriteria[filterGroups][0][filters][0][value]': crossSellSkus.join(','),
            'searchCriteria[filterGroups][0][filters][0][conditionType]': 'in',
          };
          
          const productsResponse = await magentoApi.get('/products', { params });
          return productsResponse.data.items || [];
        }
        
        return [];
      } catch (error) {
        console.error(`Error fetching cross-sell products for SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get up-sell products
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to up-sell products
 */
export const getUpSellProducts = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.UP_SELL(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call for up-sell products links
        const response = await magentoApi.get(`/products/${encodeURIComponent(sku)}/links/upsell`);
        
        // Fetch full product details for each up-sell product
        const upSellSkus = response.data.map(item => item.linked_product_sku);
        
        if (upSellSkus.length > 0) {
          const params = {
            'searchCriteria[filterGroups][0][filters][0][field]': 'sku',
            'searchCriteria[filterGroups][0][filters][0][value]': upSellSkus.join(','),
            'searchCriteria[filterGroups][0][filters][0][conditionType]': 'in',
          };
          
          const productsResponse = await magentoApi.get('/products', { params });
          return productsResponse.data.items || [];
        }
        
        return [];
      } catch (error) {
        console.error(`Error fetching up-sell products for SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get product reviews
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to product reviews
 */
export const getProductReviews = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_REVIEWS(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get(`/products/${encodeURIComponent(sku)}/reviews`);
        return response.data || [];
      } catch (error) {
        console.error(`Error fetching reviews for product SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_REVIEWS'
  );
};

/**
 * Submit product review
 * @param {string} sku - Product SKU
 * @param {Object} reviewData - Review data
 * @returns {Promise} - Promise resolving to submission result
 */
export const submitProductReview = async (sku, reviewData) => {
  try {
    // Get authenticated API instance
    const magentoApi = await getAuthenticatedMagentoApi();
    
    // Make the API call
    const response = await magentoApi.post(`/products/${encodeURIComponent(sku)}/reviews`, {
      review: reviewData
    });
    return response.data;
  } catch (error) {
    console.error(`Error submitting review for product SKU ${sku}:`, error);
    throw error;
  }
};

/**
 * Get product attributes
 * @param {string} attributeCode - Attribute code
 * @returns {Promise} - Promise resolving to attribute data
 */
export const getProductAttributes = async (attributeCode) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_ATTRIBUTES(attributeCode),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get(`/products/attributes/${attributeCode}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching product attribute ${attributeCode}:`, error);
        throw error;
      }
    },
    'PRODUCT_ATTRIBUTES'
  );
};

/**
 * Get products by category ID
 * @param {number} categoryId - Category ID
 * @param {Object} searchCriteria - Additional search criteria
 * @returns {Promise} - Promise resolving to products in category
 */
export const getProductsByCategory = async (categoryId, searchCriteria = {}) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCTS_BY_CATEGORY(categoryId, searchCriteria),
    async () => {
      try {
        console.log(`Fetching products for category ID: ${categoryId}`);
        
        const defaultCriteria = {
          'searchCriteria[pageSize]': 20,
          'searchCriteria[currentPage]': 1,
          'searchCriteria[filterGroups][0][filters][0][field]': 'category_id',
          'searchCriteria[filterGroups][0][filters][0][value]': categoryId,
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
        };
        
        const params = { ...defaultCriteria, ...searchCriteria };
        console.log("Search criteria:", params);
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        
        console.log(`Found ${response.data.total_count} products in category ${categoryId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error.response?.data || error.message);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get product filters for category
 * @param {number} categoryId - Category ID
 * @returns {Promise} - Promise resolving to available filters
 */
export const getProductFilters = async (categoryId) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_FILTERS(categoryId),
    async () => {
      try {
        // This endpoint might vary depending on your Magento setup
        // For standard Magento 2, you might need to use a custom endpoint or
        // extract filter options from layered navigation
        
        // Fallback implementation - get common filter attributes
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products/attributes', {
          params: {
            'searchCriteria[filterGroups][0][filters][0][field]': 'is_filterable',
            'searchCriteria[filterGroups][0][filters][0][value]': '1',
            'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq'
          }
        });
        
        // Transform attributes to filter format
        const filters = response.data.items.map(attribute => ({
          attribute_code: attribute.attribute_code,
          label: attribute.default_frontend_label,
          options: attribute.options || []
        }));
        
        return filters;
      } catch (error) {
        console.error(`Error fetching filters for category ${categoryId}:`, error);
        throw error;
      }
    },
    'PRODUCT_ATTRIBUTES'
  );
};

/**
 * Get best selling products
 * @param {number} pageSize - Number of products to fetch
 * @returns {Promise} - Promise resolving to best selling products
 */
export const getBestSellingProducts = async (pageSize = 10) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.BEST_SELLING(pageSize),
    async () => {
      try {
        // Note: This might need adjustment based on your Magento setup
        // Some stores use a custom attribute for best sellers
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[filterGroups][0][filters][0][field]': 'visibility',
          'searchCriteria[filterGroups][0][filters][0][value]': '4',
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
          'searchCriteria[filterGroups][1][filters][0][field]': 'status',
          'searchCriteria[filterGroups][1][filters][0][value]': '1',
          'searchCriteria[filterGroups][1][filters][0][conditionType]': 'eq',
          'searchCriteria[sortOrders][0][field]': 'ordered_qty',
          'searchCriteria[sortOrders][0][direction]': 'DESC',
        };
        
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get('/products', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching best selling products:', error);
        throw error;
      }
    },
    'PRODUCT_LIST'
  );
};

/**
 * Get product stock status
 * @param {string} sku - Product SKU
 * @returns {Promise} - Promise resolving to stock status
 */
export const getProductStockStatus = async (sku) => {
  return getCachedProductData(
    PRODUCT_CACHE_KEYS.PRODUCT_STOCK(sku),
    async () => {
      try {
        // Get authenticated API instance
        const magentoApi = await getAuthenticatedMagentoApi();
        
        // Make the API call
        const response = await magentoApi.get(`/stockItems/${encodeURIComponent(sku)}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching stock status for SKU ${sku}:`, error);
        throw error;
      }
    },
    'PRODUCT_STOCK'
  );
};

// Create the API object with all methods
const productApi = {
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
  getProductReviews,
  submitProductReview,
  getProductAttributes,
  getProductsByCategory,
  getProductFilters,
  getBestSellingProducts,
  getProductStockStatus
};

// Export the API object
export default productApi;