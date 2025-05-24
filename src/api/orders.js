import axios from 'axios';

// Magento site base URL
const baseUrl = import.meta.env.VITE_MAGENTO_API_URL;

// Admin credentials (ideally from .env or secure storage)
const adminUsername = import.meta.env.VITE_MAGENTO_ADMIN_USERNAME;
const adminPassword = import.meta.env.VITE_MAGENTO_ADMIN_PASSWORD;

/**
 * Generate new admin token and store it in localStorage
 */
const generateAdminToken = async () => {
  try {
    const response = await axios.post(
      `${baseUrl}/integration/admin/token`,
      {
        username: adminUsername,
        password: adminPassword
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const token = response.data;
    localStorage.setItem("magentoAdminToken", token);
    return token;
  } catch (error) {
    console.error('Error generating admin token:', error);
    console.error('Error fetching all orders:', error);
    return includePagination ? { orders: [], totalCount: 0, pageSize, currentPage } : [];
  }
};

/**
 * Fetch all orders for a specific customer ID from Magento
 * @param {number} customerId 
 */
export const getOrdersByCustomerId = async (customerId) => {
  try {
    const adminToken = await generateAdminToken();
    const response = await axios.get(
      `${baseUrl}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          'searchCriteria[filterGroups][0][filters][0][field]': 'customer_id',
          'searchCriteria[filterGroups][0][filters][0][value]': customerId,
          'searchCriteria[filterGroups][0][filters][0][condition_type]': 'eq',
        },
      }
    );
    return response.data.items;
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        const newToken = await generateAdminToken();
        const retryResponse = await axios.get(
          `${baseUrl}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              'searchCriteria[filterGroups][0][filters][0][field]': 'customer_id',
              'searchCriteria[filterGroups][0][filters][0][value]': customerId,
              'searchCriteria[filterGroups][0][filters][0][condition_type]': 'eq',
            },
          }
        );
        return retryResponse.data.items;
      } catch (retryError) {
        console.error('Failed to fetch orders after regenerating token:', retryError);
        return [];
      }
    }
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Fetch all orders from Magento with pagination
 * @param {Object} options - Optional parameters
 * @param {number} options.pageSize - Number of orders per page (default: 20)
 * @param {number} options.currentPage - Page number (default: 1)
 * @param {string} options.sortField - Field to sort by (default: 'created_at')
 * @param {string} options.sortDirection - Sort direction ('asc' or 'desc', default: 'desc')
 * @param {boolean} options.includePagination - Whether to include pagination metadata (default: false)
 * @returns {Promise<Array|Object>} Array of orders or object with orders and pagination info
 */
export const getAllOrders = async (currentPage = 1, pageSize = 20, status = null) => {
  try {
    const adminToken = await generateAdminToken();
    
    // Build search criteria
    const params = {
      'searchCriteria[pageSize]': pageSize,
      'searchCriteria[currentPage]': currentPage,
      'searchCriteria[sortOrders][0][field]': 'created_at',
      'searchCriteria[sortOrders][0][direction]': 'desc'
    };
    
    // Add status filter if provided
    if (status) {
      params['searchCriteria[filterGroups][0][filters][0][field]'] = 'status';
      params['searchCriteria[filterGroups][0][filters][0][value]'] = status;
      params['searchCriteria[filterGroups][0][filters][0][condition_type]'] = 'eq';
    }

    // Make order request
    const response = await axios.get(
      `${baseUrl}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        params
      }
    );

    // Return in the format expected by the component
    return {
      items: response.data.items || [],
      total_count: response.data.total_count || 0
    };

  } catch (error) {
    console.error('Error fetching all orders:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        // Build search criteria
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[currentPage]': currentPage,
          'searchCriteria[sortOrders][0][field]': 'created_at',
          'searchCriteria[sortOrders][0][direction]': 'desc'
        };
        
        // Add status filter if provided
        if (status) {
          params['searchCriteria[filterGroups][0][filters][0][field]'] = 'status';
          params['searchCriteria[filterGroups][0][filters][0][value]'] = status;
          params['searchCriteria[filterGroups][0][filters][0][condition_type]'] = 'eq';
        }

        const retryResponse = await axios.get(
          `${baseUrl}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            params
          }
        );

        // Return in the format expected by the component
        return {
          items: retryResponse.data.items || [],
          total_count: retryResponse.data.total_count || 0
        };
      } catch (retryError) {
        console.error('Failed to fetch orders after regenerating token:', retryError);
        return { 
          error: 'Failed to authenticate with the server. Please try again later.',
          items: [],
          total_count: 0
        };
      }
    }
    
    // Return error information in a format the component can handle
    return { 
      error: error.response?.data?.message || error.message || 'An error occurred while fetching orders',
      items: [],
      total_count: 0
    };
  }
};

/**
 * Fetch recent orders from Magento
 * @param {Object} options - Optional parameters
 * @param {number} options.days - Number of days to look back (default: 7)
 * @param {number} options.limit - Maximum number of orders to return (default: 10)
 * @param {string} options.customerId - Optional customer ID to filter by
 * @returns {Promise<Array>} Array of recent order objects
 */
export const getRecentOrders = async (options = {}) => {
  const {
    days = 7,
    limit = 10,
    customerId = null
  } = options;
  try {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const adminToken = await generateAdminToken();
    const params = {
      'searchCriteria[filterGroups][0][filters][0][field]': 'created_at',
      'searchCriteria[filterGroups][0][filters][0][value]': startDate,
      'searchCriteria[filterGroups][0][filters][0][condition_type]': 'gt',
      'searchCriteria[filterGroups][1][filters][0][field]': 'created_at',
      'searchCriteria[filterGroups][1][filters][0][value]': endDate,
      'searchCriteria[filterGroups][1][filters][0][condition_type]': 'lt',
      'searchCriteria[sortOrders][0][field]': 'created_at',
      'searchCriteria[sortOrders][0][direction]': 'desc',
      'searchCriteria[pageSize]': limit,
      'searchCriteria[currentPage]': 1
    };
    if (customerId) {
      params['searchCriteria[filterGroups][2][filters][0][field]'] = 'customer_id';
      params['searchCriteria[filterGroups][2][filters][0][value]'] = customerId;
      params['searchCriteria[filterGroups][2][filters][0][condition_type]'] = 'eq';
    }
    const response = await axios.get(
      `${baseUrl}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        params
      }
    );
    return response.data.items || [];
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        const newToken = await generateAdminToken();
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const params = {
          'searchCriteria[filterGroups][0][filters][0][field]': 'created_at',
          'searchCriteria[filterGroups][0][filters][0][value]': startDate,
          'searchCriteria[filterGroups][0][filters][0][condition_type]': 'gt',
          'searchCriteria[filterGroups][1][filters][0][field]': 'created_at',
          'searchCriteria[filterGroups][1][filters][0][value]': endDate,
          'searchCriteria[filterGroups][1][filters][0][condition_type]': 'lt',
          'searchCriteria[sortOrders][0][field]': 'created_at',
          'searchCriteria[sortOrders][0][direction]': 'desc',
          'searchCriteria[pageSize]': limit,
          'searchCriteria[currentPage]': 1
        };
        if (customerId) {
          params['searchCriteria[filterGroups][2][filters][0][field]'] = 'customer_id';
          params['searchCriteria[filterGroups][2][filters][0][value]'] = customerId;
          params['searchCriteria[filterGroups][2][filters][0][condition_type]'] = 'eq';
        }
        const retryResponse = await axios.get(
          `${baseUrl}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            params
          }
        );
        return retryResponse.data.items || [];
      } catch (retryError) {
        console.error('Failed to fetch recent orders after regenerating token:', retryError);
        return [];
      }
    }
    return [];
  }
};

/**
 * Fetch a specific order by ID from Magento
 * @param {string|number} orderId - The order ID to fetch
 * @param {boolean} useIncrementId - Whether the provided ID is an increment ID (default: false)
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export const getOrderById = async (orderId, useIncrementId = false) => {
  try {
    const adminToken = await generateAdminToken();
    const searchField = useIncrementId ? 'increment_id' : 'entity_id';
    const params = {
      [`searchCriteria[filterGroups][0][filters][0][field]`]: searchField,
      [`searchCriteria[filterGroups][0][filters][0][value]`]: orderId,
      [`searchCriteria[filterGroups][0][filters][0][condition_type]`]: 'eq'
    };
    const response = await axios.get(
      `${baseUrl}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        params
      }
    );
    const orders = response.data.items || [];
    return orders.length ? orders[0] : null;
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        const newToken = await generateAdminToken();
        const searchField = useIncrementId ? 'increment_id' : 'entity_id';
        const params = {
          [`searchCriteria[filterGroups][0][filters][0][field]`]: searchField,
          [`searchCriteria[filterGroups][0][filters][0][value]`]: orderId,
          [`searchCriteria[filterGroups][0][filters][0][condition_type]`]: 'eq'
        };
        const retryResponse = await axios.get(
          `${baseUrl}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            params
          }
        );
        const orders = retryResponse.data.items || [];
        return orders.length ? orders[0] : null;
      } catch (retryError) {
        console.error('Failed to fetch order after regenerating token:', retryError);
        return null;
      }
    }
    return null;
  }
};

// You can implement reorderItems and other functions as needed, following similar patterns.
