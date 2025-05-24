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
    console.log('Generating new admin token...');
    console.log(`Using base URL: ${baseUrl}`);
    console.log(`Admin Username: ${adminUsername}`);
    console.log(`Admin Password: ${adminPassword ? adminPassword : 'Not set'}`); // Don't log password in production
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
    console.log('New admin token generated successfully.');
    return token;

  } catch (error) {
    console.error('Error generating admin token:', error);
    throw error;
  }
};

/**
 * Fetch all orders for a specific customer ID from Magento
 * @param {number} customerId 
 */
export const getOrdersByCustomerId = async (customerId) => {
  try {
  console.log(`Fetching orders for Customer ID: ${customerId}`);
  
    const adminToken = await generateAdminToken();
    console.log(`Using admin token: ${adminToken}`);

    // Make order request
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

    const orders = response.data.items;

    if (orders.length === 0) {
      console.log(`No orders found for Customer ID ${customerId}`);
    } else {
      console.log(`Orders for Customer ID ${customerId}:`);
      orders.forEach(order => {
        console.log(`Order ID: ${order.entity_id}`);
        console.log(`Increment ID: ${order.increment_id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Grand Total: ${order.grand_total}`);
        console.log('---------------------------');
      });
    }

    return orders;

  } catch (error) {
    // If token is invalid or expired, regenerate and retry
    console.error('Error fetching orders:', error.response ? error.response.data : error.message);
    console.error('Status code:', error.response ? error.response.status : 'N/A');
    console.error('Headers:', error.response ? error.response.headers : 'N/A');
    console.error('Config:', error.config);
 
      console.warn('Token expired or invalid. Regenerating token...');

      try {
        const newToken = await generateAdminToken();
        console.log(`Using new admin token: ${newToken}`);
        console.log(`Retrying order fetch for Customer ID: ${customerId}`);


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

        const orders = retryResponse.data.items;

        if (orders.length === 0) {
          console.log(`No orders found for Customer ID ${customerId}`);
        } else {
          console.log(`Orders for Customer ID ${customerId}:`);
          orders.forEach(order => {
            console.log(`Order ID: ${order.entity_id}`);
            console.log(`Increment ID: ${order.increment_id}`);
            console.log(`Status: ${order.status}`);
            console.log(`Grand Total: ${order.grand_total}`);
            console.log('---------------------------');
          });
        }

        return orders;

      } catch (retryError) {
        console.error('Failed to fetch orders after regenerating token:', retryError);
        return [];
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
 * @returns {Promise<Object>} Object containing orders array and pagination info
 */
export const getAllOrders = async (options = {}) => {
  const {
    pageSize = 20,
    currentPage = 1,
    sortField = 'created_at',
    sortDirection = 'desc'
  } = options;
  
  let adminToken;
  
  try {
    console.log('Fetching all orders...');
    
    // Get admin token
    adminToken = await generateAdminToken();
    console.log('Admin token obtained successfully');

    // Build search criteria
    const params = {
      'searchCriteria[pageSize]': pageSize,
      'searchCriteria[currentPage]': currentPage,
      'searchCriteria[sortOrders][0][field]': sortField,
      'searchCriteria[sortOrders][0][direction]': sortDirection
    };

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

    const orders = response.data.items || [];
    const totalCount = response.data.total_count || 0;

    console.log(`Retrieved ${orders.length} orders (total: ${totalCount})`);
    
    return {
      orders,
      totalCount,
      pageSize,
      currentPage
    };

  } catch (error) {
    console.error('Error fetching all orders:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        const params = {
          'searchCriteria[pageSize]': pageSize,
          'searchCriteria[currentPage]': currentPage,
          'searchCriteria[sortOrders][0][field]': sortField,
          'searchCriteria[sortOrders][0][direction]': sortDirection
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
        const totalCount = retryResponse.data.total_count || 0;

        console.log(`Retrieved ${orders.length} orders (total: ${totalCount})`);
        
        return {
          orders,
          totalCount,
          pageSize,
          currentPage
        };
      } catch (retryError) {
        console.error('Failed to fetch orders after regenerating token:', retryError);
        throw retryError;
      }
    }
    
    throw error;
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
  
  let adminToken;
  
  try {
    console.log(`Fetching orders from the last ${days} days...`);
    
    // Calculate date range (now - specified days)
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // Get admin token
    adminToken = await generateAdminToken();
    
    // Build search criteria
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
    
    // Add customer filter if provided
    if (customerId) {
      params['searchCriteria[filterGroups][2][filters][0][field]'] = 'customer_id';
      params['searchCriteria[filterGroups][2][filters][0][value]'] = customerId;
      params['searchCriteria[filterGroups][2][filters][0][condition_type]'] = 'eq';
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

    const orders = response.data.items || [];
    console.log(`Retrieved ${orders.length} recent orders`);
    
    return orders;

  } catch (error) {
    console.error('Error fetching recent orders:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        // Calculate date range (now - specified days)
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        
        // Build search criteria
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
        
        // Add customer filter if provided
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

        const orders = retryResponse.data.items || [];
        console.log(`Retrieved ${orders.length} recent orders`);
        
        return orders;
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
  let adminToken;
  
  try {
    console.log(`Fetching order with ${useIncrementId ? 'increment' : 'entity'} ID: ${orderId}`);
    
    // Get admin token
    adminToken = await generateAdminToken();
    
    // Determine which field to search by
    const searchField = useIncrementId ? 'increment_id' : 'entity_id';
    
    // Build search criteria
    const params = {
      [`searchCriteria[filterGroups][0][filters][0][field]`]: searchField,
      [`searchCriteria[filterGroups][0][filters][0][value]`]: orderId,
      [`searchCriteria[filterGroups][0][filters][0][condition_type]`]: 'eq'
    };

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

    const orders = response.data.items || [];
    
    if (orders.length === 0) {
      console.log(`No order found with ${searchField} ${orderId}`);
      return null;
    }
    
    const order = orders[0];
    console.log(`Found order: #${order.increment_id} (ID: ${order.entity_id})`);
    
    return order;

  } catch (error) {
    console.error('Error fetching order by ID:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        // Determine which field to search by
        const searchField = useIncrementId ? 'increment_id' : 'entity_id';
        
        // Build search criteria
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
        
        if (orders.length === 0) {
          console.log(`No order found with ${searchField} ${orderId}`);
          return null;
        }
        
        const order = orders[0];
        console.log(`Found order: #${order.increment_id} (ID: ${order.entity_id})`);
        
        return order;
      } catch (retryError) {
        console.error('Failed to fetch order after regenerating token:', retryError);
        return null;
      }
    }
    
    return null;
  }
};

/**
 * Reorder items from a previous order
 * @param {string|number} orderId - The order ID to reorder
 * @param {number} customerId - The customer ID
 * @returns {Promise<Object>} New order data or error information
 */
export const reorderItems = async (orderId, customerId) => {
  let adminToken;
  
  try {
    console.log(`Reordering items from order ID: ${orderId} for customer ID: ${customerId}`);
    
    // Get admin token
    adminToken = await generateAdminToken();
    
    // Make reorder request
    const response = await axios.post(
      `${baseUrl}/orders/${orderId}/reorder`,
      { customerId },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Reorder successful:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error reordering items:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        const retryResponse = await axios.post(
          `${baseUrl}/orders/${orderId}/reorder`,
          { customerId },
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            }
          }
        );

        console.log('Reorder successful:', retryResponse.data);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Failed to reorder items after regenerating token:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
};

/**
 * Get tracking information for an order
 * @param {string|number} orderId - The order ID
 * @returns {Promise<Array>} Array of tracking information
 */
export const getOrderTracking = async (orderId) => {
  let adminToken;
  
  try {
    console.log(`Fetching tracking information for order ID: ${orderId}`);
    
    // Get admin token
    adminToken = await generateAdminToken();
    
    // Make tracking request
    const response = await axios.get(
      `${baseUrl}/orders/${orderId}/tracking`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const trackingInfo = response.data || [];
    console.log(`Retrieved ${trackingInfo.length} tracking records for order ${orderId}`);
    
    return trackingInfo;

  } catch (error) {
    console.error('Error fetching order tracking:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        const retryResponse = await axios.get(
          `${baseUrl}/orders/${orderId}/tracking`,
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            }
          }
        );

        const trackingInfo = retryResponse.data || [];
        console.log(`Retrieved ${trackingInfo.length} tracking records for order ${orderId}`);
        
        return trackingInfo;
      } catch (retryError) {
        console.error('Failed to fetch tracking info after regenerating token:', retryError);
        return [];
      }
    }
    
    return [];
  }
};

/**
 * Cancel an order
 * @param {string|number} orderId - The order ID to cancel
 * @returns {Promise<boolean>} True if cancellation was successful
 */
export const cancelOrder = async (orderId) => {
  let adminToken;
  
  try {
    console.log(`Cancelling order ID: ${orderId}`);
    
    // Get admin token
    adminToken = await generateAdminToken();
    
    // Make cancel request
    const response = await axios.post(
      `${baseUrl}/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log(`Order ${orderId} cancelled successfully`);
    return true;

  } catch (error) {
    console.error('Error cancelling order:', error.response ? error.response.data : error.message);
    
    // If token is invalid, try to regenerate and retry once
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.warn('Token expired or invalid. Regenerating token and retrying...');
        const newToken = await generateAdminToken();
        
        const retryResponse = await axios.post(
          `${baseUrl}/orders/${orderId}/cancel`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            }
          }
        );

        console.log(`Order ${orderId} cancelled successfully`);
        return true;
      } catch (retryError) {
        console.error('Failed to cancel order after regenerating token:', retryError);
        return false;
      }
    }
    
    return false;
  }
};
