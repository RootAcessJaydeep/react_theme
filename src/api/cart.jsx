import { magentoApi } from './auth';
 const api = await magentoApi();
// Global cart data storage
let globalCartData = null;

/**
 * Creates a new cart based on user authentication status
 * @returns {Promise<string>} Cart ID
 */
export const createCart = async () => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    
    if (isLoggedIn) {
      // For logged-in users, Magento automatically associates the cart with the user
      const response = await api.post('/carts/mine');
      return response.data;
    } else {
      // For guests, create a guest cart
      const response = await api.post('/guest-carts');
      return response.data;
    }
  } catch (error) {
    console.error('Error creating cart:', error);
    throw new Error('Failed to create cart');
  }
};

/**
 * Gets the current cart contents
 * @param {string} cartId - Required for guest users
 * @returns {Promise<Object>} Cart data
 */
export const getCart = async (cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log("🛒 Fetching cart data from Magento API...");
    console.log("👤 Is user logged in?", isLoggedIn);
    console.log("🔑 Guest cart ID:", cartId);

    let response;

    if (isLoggedIn) {
      console.log("🔐 Fetching customer cart...");
      // Cache busting handled by request interceptor
      response = await api.get('/carts/mine');
      console.log("✅ Customer cart fetched successfully!");
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      console.log("👻 Fetching guest cart with ID:", cartId);
      response = await api.get(`/guest-carts/${cartId}`);
      console.log("✅ Guest cart fetched successfully!");
    }

    // Store cart data globally
    globalCartData = response.data;
    
    // Log the cart data
    console.log("🛍️ Cart data:", globalCartData);
    
    // Save to localStorage for persistence
    if (isLoggedIn) {
      localStorage.setItem('customer_cart_data', JSON.stringify(globalCartData));
      console.log("💾 Cart data saved to localStorage");
    } else {
      // For guest users, save to sessionStorage (cleared when browser closes)
      sessionStorage.setItem('guest_cart_data', JSON.stringify(globalCartData));
      console.log("💾 Guest cart data saved to sessionStorage");
    }

    return globalCartData;

  } catch (error) {
    console.error('❌ Error fetching cart:', error.response?.data || error.message);
    
    // Try to load from storage if API fails
    if (!!localStorage.getItem('customer_token')) {
      const storedCart = localStorage.getItem('customer_cart_data');
      if (storedCart) {
        console.log("🔄 Using cached cart data from localStorage");
        return JSON.parse(storedCart);
      }
    } else {
      const storedGuestCart = sessionStorage.getItem('guest_cart_data');
      if (storedGuestCart) {
        console.log("🔄 Using cached guest cart data from sessionStorage");
        return JSON.parse(storedGuestCart);
      }
    }
    
    throw new Error('Failed to fetch cart');
  }
};

/**
 * Get the globally stored cart data without making an API call
 * @returns {Object|null} - The globally stored cart data or null if not available
 */
export const getGlobalCartData = () => {
  return globalCartData;
};


/**
 * Adds an item to the cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 * @param {string} cartId - Required for guest users
 * @returns {Promise<Object>} Updated cart data
 */
export const addToCart = async (product, quantity = 1, cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log("🛒 Adding item to cart:", product);
    console.log("👤 Is user logged in?", isLoggedIn);
    
    const cartItem = {
      cartItem: {
        sku: product.sku,
        qty: quantity,
        quote_id: isLoggedIn ? undefined : cartId,
      }
    };
    
    let response;
    
    if (isLoggedIn) {
      response = await api.post('/carts/mine/items', cartItem);
      console.log("✅ Item added to customer cart:", response.data);
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      response = await api.post(`/guest-carts/${cartId}/items`, cartItem);
      console.log("✅ Item added to guest cart:", response.data);
    }
    
    // Refresh cart data after adding item
    await getCart(cartId);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error adding item to cart:', error);
    throw new Error(`Failed to add ${product.name} to cart`);
  }
};

/**
 * Updates the quantity of an item in the cart
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @param {string} cartId - Required for guest users
 * @returns {Promise<Object>} Updated cart item
 */
export const updateCartItem = async (itemId, quantity, cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log(`🛒 Updating cart item ${itemId} to quantity ${quantity}`);
    console.log("👤 Is user logged in?", isLoggedIn);
    
    const cartItem = {
      cartItem: {
        item_id: itemId,
        qty: quantity,
      }
    };
    
    let response;
    
    if (isLoggedIn) {
      response = await api.put(`/carts/mine/items/${itemId}`, cartItem);
      console.log("✅ Item updated in customer cart:", response.data);
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      response = await api.put(`/guest-carts/${cartId}/items/${itemId}`, cartItem);
      console.log("✅ Item updated in guest cart:", response.data);
    }
    
    // Refresh cart data after updating item
    await getCart(cartId);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    throw new Error('Failed to update item quantity');
  }
};

/**
 * Removes an item from the cart
 * @param {string} itemId - Cart item ID
 * @param {string} cartId - Required for guest users
 * @returns {Promise<boolean>} Success status
 */
export const removeFromCart = async (itemId, cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log(`🛒 Removing item ${itemId} from cart`);
    console.log("👤 Is user logged in?", isLoggedIn);
    
    if (isLoggedIn) {
      await api.delete(`/carts/mine/items/${itemId}`);
      console.log("✅ Item removed from customer cart");
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      await api.delete(`/guest-carts/${cartId}/items/${itemId}`);
      console.log("✅ Item removed from guest cart");
    }
    
    // Refresh cart data after removing item
    await getCart(cartId);
    
    return true;
  } catch (error) {
    console.error('❌ Error removing item from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
};

/**
 * Gets current customer information
 * @returns {Promise<Object>} Customer data
 */
export const getCustomerInfo = async () => {
  try {
    const response = await api.get('/customers/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    throw new Error('Failed to fetch customer information');
  }
};

/**
 * Merges guest cart with customer cart after login
 * @param {string} guestCartId - Guest cart ID to merge
 * @returns {Promise<string>} New cart ID
 */
export const mergeGuestCart = async (guestCartId) => {
  try {
    console.log(`🔄 Merging guest cart ${guestCartId} with customer cart`);
    const response = await api.put(`/carts/mine/merge-with-guest-cart/${guestCartId}`);
    console.log("✅ Carts merged successfully");
    
    // Refresh cart data after merging
    await getCart();
    
    return response.data;
  } catch (error) {
    console.error('❌ Error merging carts:', error);
    throw new Error('Failed to merge guest cart with customer cart');
  }
};

/**
 * Apply coupon to cart
 * @param {string} couponCode - Coupon code
 * @param {string|null} cartId - Guest cart ID (optional, only needed for guest users)
 * @returns {Promise<boolean>} - Success status
 */
export const applyCoupon = async (couponCode, cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log(`🎟️ Applying coupon ${couponCode} to cart`);
    console.log("👤 Is user logged in?", isLoggedIn);
    
    if (isLoggedIn) {
      await api.put(`/carts/mine/coupons/${couponCode}`);
      console.log("✅ Coupon applied to customer cart");
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      
      await api.put(`/guest-carts/${cartId}/coupons/${couponCode}`);
      console.log("✅ Coupon applied to guest cart");
    }
    
    // Refresh cart data after applying coupon
    await getCart(cartId);
    
    return true;
  } catch (error) {
    console.error('❌ Error applying coupon:', error.response?.data || error.message);
    throw new Error('Failed to apply coupon');
  }
};

/**
 * Remove coupon from cart
 * @param {string|null} cartId - Guest cart ID (optional, only needed for guest users)
 * @returns {Promise<boolean>} - Success status
 */
export const removeCoupon = async (cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log("🎟️ Removing coupon from cart");
    console.log("👤 Is user logged in?", isLoggedIn);
    
    if (isLoggedIn) {
      await api.delete('/carts/mine/coupons');
      console.log("✅ Coupon removed from customer cart");
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      
      await api.delete(`/guest-carts/${cartId}/coupons`);
      console.log("✅ Coupon removed from guest cart");
    }
    
    // Refresh cart data after removing coupon
    await getCart(cartId);
    
    return true;
  } catch (error) {
    console.error('❌ Error removing coupon:', error.response?.data || error.message);
    throw new Error('Failed to remove coupon');
  }
};

/**
 * Get cart totals
 * @param {string|null} cartId - Guest cart ID (optional, only needed for guest users)
 * @returns {Promise<Object>} - Cart totals
 */
export const getCartTotals = async (cartId = null) => {
  try {
    const isLoggedIn = !!localStorage.getItem('customer_token');
    console.log("💰 Fetching cart totals");
    console.log("👤 Is user logged in?", isLoggedIn);
    
    let response;
    
    if (isLoggedIn) {
      response = await api.get('/carts/mine/totals');
      console.log("✅ Customer cart totals:", response.data);
    } else {
      if (!cartId) {
        console.error("❌ No Cart ID provided for guest user.");
        throw new Error('Cart ID is required for guest users');
      }
      
      response = await api.get(`/guest-carts/${cartId}/totals`);
      console.log("✅ Guest cart totals:", response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching cart totals:', error.response?.data || error.message);
    throw new Error('Failed to fetch cart totals');
  }
};

// Export default object with all cart functions
export default {
  getCart,
  getGlobalCartData,
  createCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  getCartTotals,
  mergeGuestCart,
  getCustomerInfo
};
