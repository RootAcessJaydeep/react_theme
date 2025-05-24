import axios from 'axios';
import magentoApi, { getAdminToken , getAuthenticatedMagentoApi} from './auth';
import { getCachedData, invalidateCache } from './cacheUtils';
import { ADMIN_TOKEN_KEY } from "../constants/storageKeys";

// Base URL for Magento API
const BASE_URL = import.meta.env.VITE_MAGENTO_API_URL;
const CACHE_KEYS = {
  ALL_CATEGORIES: 'all-categories',
  CATEGORY_TREE: (rootId) => `category-tree-${rootId}`,
  CATEGORY_BY_ID: (id) => `category-${id}`,
  CATEGORY_CHILDREN: (parentId) => `category-children-${parentId}`,
  CATEGORY_ATTRIBUTES: 'category-attributes',
  FEATURED_CATEGORIES: (limit) => `featured-categories-${limit}`,
  CATEGORY_FILTERS: (id) => `category-filters-${id}`,
  PRODUCTS_BY_CATEGORY: (id, options) => `products-category-${id}-${JSON.stringify(options)}`,
};

/**
 * Get all categories with URL keys
 * @returns {Promise} - Returns all categories with URL keys
 */
export const getAllCategories = async () => {
  return getCachedData(
    CACHE_KEYS.ALL_CATEGORIES,
    async () => {
      try {       
       
        const api = await getAuthenticatedMagentoApi();
        
        // Get the category tree
        const response = await api.get('/categories');
        
        // Process the category tree to extract and structure data
        const processedCategories = [];
        
        // Recursive function to process categories
        const processCategories = async (categoryList, parentPath = '') => {
          const result = [];
          
          for (const category of categoryList) {
            try {
              // Skip root categories (usually ID 1 and 2)
              if (category.id <= 2) {
                if (category.children_data && category.children_data.length > 0) {
                  const children = await processCategories(category.children_data);
                  processedCategories.push(...children);
                }
                continue;
              }
              
              // Get detailed category info to get URL key
              const detailResponse = await api.get(`/categories/${category.id}`);
              const categoryDetail = detailResponse.data;
              
              // Extract URL key from custom attributes
              let urlKey = '';
              if (categoryDetail.custom_attributes) {
                const urlKeyAttr = categoryDetail.custom_attributes.find(
                  attr => attr.attribute_code === 'url_key'
                );
                urlKey = urlKeyAttr ? urlKeyAttr.value : '';
              }
              
              // Create a structured category object
              const categoryObj = {
                category_id: category.id,
                name: category.name,
                url_key: urlKey,
                level: category.level,
                parent_id: category.parent_id,
                path: parentPath ? `${parentPath}/${urlKey || category.id}` : (urlKey || String(category.id)),
                children: []
              };
              
              // Process children if any
              if (category.children_data && category.children_data.length > 0) {
                categoryObj.children = await processCategories(
                  category.children_data, 
                  categoryObj.path
                );
              }          
              // Add to result array
              result.push(categoryObj);
              processedCategories.push(categoryObj);
              
            } catch (err) {
              console.error(`Error processing category ${category.id}:`, err);
              // Continue with other categories even if one fails
            }
          }     
          return result;
        };
        
        // Start processing from the root children
        if (response.data.children_data && response.data.children_data.length > 0) {
          await processCategories(response.data.children_data);
        }
        
        // Return both the original response and the processed categories
        return {
          original: response.data,
          items: processedCategories
        };
        
      } catch (error) {
        console.error('Error fetching categories:', error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.ALL_CATEGORIES);
            return getAllCategories(); // Retry with new token
          } catch (retryError) {
            console.error('Error retrying category fetch:', retryError.response?.data || retryError.message);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

const getCustomAttribute = (category, attributeCode) => {
  const attr = category.custom_attributes?.find(attr => attr.attribute_code === attributeCode);
  return attr ? attr.value : null;
};

/**
 * Get category tree (hierarchical structure)
 * @param {number} rootCategoryId - Root category ID (default is 2 for most Magento stores)
 * @returns {Promise} - Returns category tree
 */
export const getCategoryTree = async (rootCategoryId = 2) => {
  return getCachedData(
    CACHE_KEYS.CATEGORY_TREE(rootCategoryId),
    async () => {
      try {
        // Try to get the admin token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no admin token, try to get a new one
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance with token
        const api = axios.create({
          baseURL: BASE_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Get the basic category tree
        const response = await api.get(`/categories?rootCategoryId=${rootCategoryId}`);
        const categoryTree = response.data;
        
        // Function to recursively add URL keys to the category tree
        const addUrlKeysToTree = async (category) => {
          try {
            // Get detailed category info to get URL key
            const detailResponse = await api.get(`/categories/${category.id}`);
            const categoryDetail = detailResponse.data;
            
            // Extract URL key from custom attributes
            let urlKey = '';
            if (categoryDetail.custom_attributes) {
              const urlKeyAttr = categoryDetail.custom_attributes.find(
                attr => attr.attribute_code === 'url_key'
              );
              urlKey = urlKeyAttr ? urlKeyAttr.value : '';
            }
            
            // Add URL key to the category
            category.url_key = urlKey;
            
            // Rename id to category_id
            category.category_id = category.id;
            
            // Process children recursively
            if (category.children_data && category.children_data.length > 0) {
              for (const child of category.children_data) {
                await addUrlKeysToTree(child);
              }
            }
          } catch (err) {
            console.error(`Error adding URL key to category ${category.id}:`, err);
            // Continue with other categories even if one fails
            category.url_key = '';
          }
        };
        
        // Start adding URL keys from the root category
        await addUrlKeysToTree(categoryTree);
        
        return categoryTree;
      } catch (error) {
        console.error('Error fetching category tree:', error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.CATEGORY_TREE(rootCategoryId));
            return getCategoryTree(rootCategoryId); // Retry with new token
          } catch (retryError) {
            console.error('Error retrying category tree fetch:', retryError.response?.data || retryError.message);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

/**
 * Get category by ID
 * @param {number} categoryId - Category ID
 * @returns {Promise} - Returns category details
 */
export const getCategoryById = async (categoryId) => {
  return getCachedData(
    CACHE_KEYS.CATEGORY_BY_ID(categoryId),
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = await getAuthenticatedMagentoApi(token);
        
        const response = await api.get(`/categories/${categoryId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching category ${categoryId}:`, error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.CATEGORY_BY_ID(categoryId));
            return getCategoryById(categoryId); // Retry with new token
          } catch (retryError) {
            console.error(`Error retrying category fetch for ID ${categoryId}:`, retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

/**
 * Get category by URL key/slug
 * @param {string} urlKey - Category URL key or slug
 * @returns {Promise} - Returns category details
 */
export const getCategoryByUrlKey = async (urlKey) => {
  try {
    // First get all categories (this call is already cached)
    const categories = await getAllCategories();
    
    // Find the category with matching URL key
    const category = categories.items.find(cat => cat.url_key === urlKey);
    
    if (!category) {
      throw new Error(`Category with URL key "${urlKey}" not found`);
    }
    
    return category;
  } catch (error) {
    console.error(`Error fetching category by URL key ${urlKey}:`, error.message);
    throw error;
  }
};

/**
 * Get products by category ID
 * @param {number} categoryId - Category ID
 * @param {Object} options - Search criteria options
 * @param {number} options.pageSize - Number of products per page
 * @param {number} options.currentPage - Current page number
 * @param {string} options.sortField - Field to sort by
 * @param {string} options.sortDirection - Sort direction (ASC or DESC)
 * @returns {Promise} - Returns products in the category
 */
export const getProductsByCategory = async (categoryId, options = {}) => {
  return getCachedData(
    CACHE_KEYS.PRODUCTS_BY_CATEGORY(categoryId, options),
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = await getAuthenticatedMagentoApi(token);
        
        const {
          pageSize = 20,
          currentPage = 1,
          sortField = 'position',
          sortDirection = 'ASC'
        } = options;
        
        const searchCriteria = {
          'searchCriteria[filterGroups][0][filters][0][field]': 'category_id',
          'searchCriteria[filterGroups][0][filters][0][value]': categoryId,
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[currentPage]': currentPage,
          'searchCriteria[sortOrders][0][field]': sortField,
          'searchCriteria[sortOrders][0][direction]': sortDirection
        };
        
        // Convert search criteria to query string
        const queryString = Object.entries(searchCriteria)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        const response = await api.get(`/products?${queryString}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.PRODUCTS_BY_CATEGORY(categoryId, options));
            return getProductsByCategory(categoryId, options); // Retry with new token
          } catch (retryError) {
            console.error(`Error retrying products fetch for category ${categoryId}:`, retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 5 * 60 * 1000 } // 5 minutes cache for products (shorter than categories)
  );
};

/**
 * Get products by category URL key/slug
 * @param {string} urlKey - Category URL key or slug
 * @param {Object} options - Search criteria options
 * @returns {Promise} - Returns products in the category
 */
export const getProductsByCategoryUrlKey = async (urlKey, options = {}) => {
  try {
    const category = await getCategoryByUrlKey(urlKey);
    return getProductsByCategory(category.category_id, options);
  } catch (error) {
    console.error(`Error fetching products for category URL key ${urlKey}:`, error.message);
    throw error;
  }
};

/**
 * Get category attributes
 * @returns {Promise} - Returns category attributes
 */
export const getCategoryAttributes = async () => {
  return getCachedData(
    CACHE_KEYS.CATEGORY_ATTRIBUTES,
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = await getAuthenticatedMagentoApi(token);
        
        const response = await api.get('/categories/attributes');
        return response.data;
      } catch (error) {
        console.error('Error fetching category attributes:', error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.CATEGORY_ATTRIBUTES);
            return getCategoryAttributes(); // Retry with new token
          } catch (retryError) {
            console.error('Error retrying category attributes fetch:', retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 30 * 60 * 1000 } // 30 minutes cache for attributes (they rarely change)
  );
};

/**
 * Get child categories of a parent category
 * @param {number} parentId - Parent category ID
 * @returns {Promise} - Returns child categories
 */
export const getChildCategories = async (parentId) => {
  return getCachedData(
    CACHE_KEYS.CATEGORY_CHILDREN(parentId),
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = await getAuthenticatedMagentoApi(token);
        
        const searchCriteria = {
          'searchCriteria[filterGroups][0][filters][0][field]': 'parent_id',
          'searchCriteria[filterGroups][0][filters][0][value]': parentId,
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq'
        };
        
        // Convert search criteria to query string
        const queryString = Object.entries(searchCriteria)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        const response = await api.get(`/categories/list?${queryString}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching child categories for parent ${parentId}:`, error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.CATEGORY_CHILDREN(parentId));
            return getChildCategories(parentId); // Retry with new token
          } catch (retryError) {
            console.error(`Error retrying child categories fetch for parent ${parentId}:`, retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

/**
 * Get category path (breadcrumbs)
 * @param {number} categoryId - Category ID
 * @returns {Promise} - Returns category path
 */
export const getCategoryPath = async (categoryId) => {
  try {
    const category = await getCategoryById(categoryId);
    
    if (!category.path) {
      return [category];
    }
    
    // Category path is usually in format "1/2/3/4" where numbers are category IDs
    const pathIds = category.path.split('/').filter(id => id !== '1'); // Filter out root category
    
    // Fetch all categories in the path
    const pathPromises = pathIds.map(id => getCategoryById(parseInt(id)));
    const pathCategories = await Promise.all(pathPromises);
    
    return pathCategories;
  } catch (error) {
    console.error(`Error fetching category path for ${categoryId}:`, error.message);
    throw error;
  }
};

/**
 * Get featured categories (categories with is_anchor=true)
 * @param {number} limit - Maximum number of categories to return
 * @returns {Promise} - Returns featured categories
 */
export const getFeaturedCategories = async (limit = 10) => {
  return getCachedData(
    CACHE_KEYS.FEATURED_CATEGORIES(limit),
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = createAuthenticatedApi(token);
        
        const searchCriteria = {
          'searchCriteria[filterGroups][0][filters][0][field]': 'is_anchor',
          'searchCriteria[filterGroups][0][filters][0][value]': '1',
          'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
          'searchCriteria[pageSize]': limit
        };
        
        // Convert search criteria to query string
        const queryString = Object.entries(searchCriteria)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        const response = await api.get(`/categories/list?${queryString}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching featured categories:', error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.FEATURED_CATEGORIES(limit));
            return getFeaturedCategories(limit); // Retry with new token
          } catch (retryError) {
            console.error('Error retrying featured categories fetch:', retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

/**
 * Get category filters (available filters for products in a category)
 * @param {number} categoryId - Category ID
 * @returns {Promise} - Returns available filters
 */
export const getCategoryFilters = async (categoryId) => {
  return getCachedData(
    CACHE_KEYS.CATEGORY_FILTERS(categoryId),
    async () => {
      try {
        // Try to get the customer token first
        let token = localStorage.getItem(ADMIN_TOKEN_KEY);
        
        // If no customer token, try to get admin token
        if (!token) {
          token = await getAdminToken();
        }
        
        // Create authenticated API instance
        const api = await getAuthenticatedMagentoApi(token);
        
        const response = await api.get(`/categories/${categoryId}/filters`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching filters for category ${categoryId}:`, error.response?.data || error.message);
        
        // If token is expired or invalid, try to get a new one and retry
        if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            await getAdminToken();
            invalidateCache(CACHE_KEYS.CATEGORY_FILTERS(categoryId));
            return getCategoryFilters(categoryId); // Retry with new token
          } catch (retryError) {
            console.error(`Error retrying category filters fetch for ${categoryId}:`, retryError);
            throw retryError;
          }
        }
        
        throw error;
      }
    },
    { cacheTime: 10 * 60 * 1000 } // 10 minutes cache
  );
};

/**
 * Search categories by name
 * @param {string} searchTerm - Search term
 * @param {number} limit - Maximum number of results
 * @returns {Promise} - Returns matching categories
 */
export const searchCategories = async (searchTerm, limit = 20) => {
  // Don't cache search results as they're typically one-time operations
  try {
    // Try to get the customer token first
    let token = localStorage.getItem(ADMIN_TOKEN_KEY);
    
    // If no customer token, try to get admin token
    if (!token) {
      token = await getAdminToken();
    }
    
    // Create authenticated API instance
    const api = await getAuthenticatedMagentoApi(token);
    
    const searchCriteria = {
      'searchCriteria[filterGroups][0][filters][0][field]': 'name',
      'searchCriteria[filterGroups][0][filters][0][value]': `%${searchTerm}%`,
      'searchCriteria[filterGroups][0][filters][0][conditionType]': 'like',
      'searchCriteria[pageSize]': limit
    };
    
    // Convert search criteria to query string
    const queryString = Object.entries(searchCriteria)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const response = await api.get(`/categories/list?${queryString}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching categories for "${searchTerm}":`, error.response?.data || error.message);
    
    // If token is expired or invalid, try to get a new one and retry
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        await getAdminToken();
        return searchCategories(searchTerm, limit); // Retry with new token
      } catch (retryError) {
        console.error(`Error retrying category search for "${searchTerm}":`, retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
};

const categoryService = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryByUrlKey,
  getProductsByCategory,
  getProductsByCategoryUrlKey,
  getCategoryAttributes,
  getChildCategories,
  getCategoryPath,
  getFeaturedCategories,
  getCategoryFilters,
  searchCategories
};

export default categoryService;
