import authService ,{ magentoApi } from './auth';
/**
 * Get available shipping methods for the cart
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Array>} - Available shipping methods
 */
export const getShippingMethods = async (cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("🚚 Fetching available shipping methods...");
    
    // For guest users, we need the cart ID and address information
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    let response;
    if (isLoggedIn) {
      response = await magentoApi.get('/carts/mine/shipping-methods');
    } else {
      response = await magentoApi.get(`/guest-carts/${cartId}/shipping-methods`);
    }
    
    console.log("✅ Shipping methods fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching shipping methods:', error.response?.data || error.message);
    throw new Error('Failed to fetch shipping methods');
  }
};

/**
 * Get available payment methods for the cart
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Array>} - Available payment methods
 */
export const getPaymentMethods = async (cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("💳 Fetching available payment methods...");
    
    // For guest users, we need the cart ID
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    let response;
    if (isLoggedIn) {
      response = await magentoApi.get('/carts/mine/payment-methods');
    } else {
      response = await magentoApi.get(`/guest-carts/${cartId}/payment-methods`);
    }
    
    console.log("✅ Payment methods fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error.response?.data || error.message);
    throw new Error('Failed to fetch payment methods');
  }
};

/**
 * Set shipping information for the cart
 * @param {Object} addressInfo - Shipping address information
 * @param {string} shippingMethod - Selected shipping method code
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Object>} - Response data
 */
export const setShippingInformation = async (addressInfo, shippingMethod, cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("🚚 Setting shipping information...");
    console.log("📦 Address info:", addressInfo);
    console.log("🚚 Shipping method:", shippingMethod);
    
    // For guest users, we need the cart ID
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    // Create a clean shipping address object without any extra properties
    const shippingAddress = {
      firstname: addressInfo.firstname,
      lastname: addressInfo.lastname,
      street: addressInfo.street,
      city: addressInfo.city,
      region: addressInfo.region,
      region_id: addressInfo.region_id,
      postcode: addressInfo.postcode,
      country_id: addressInfo.country_id,
      telephone: addressInfo.telephone,
      email: addressInfo.email
    };
    
    // Create billing address based on same_as_billing flag
    let billingAddress;
    if (addressInfo.same_as_billing) {
      billingAddress = { ...shippingAddress };
    } else {
      // If billing address is different, use the provided billing address
      billingAddress = {
        firstname: addressInfo.billing_address.firstname,
        lastname: addressInfo.billing_address.lastname,
        street: addressInfo.billing_address.street,
        city: addressInfo.billing_address.city,
        region: addressInfo.billing_address.region,
        region_id: addressInfo.billing_address.region_id,
        postcode: addressInfo.billing_address.postcode,
        country_id: addressInfo.billing_address.country_id,
        telephone: addressInfo.billing_address.telephone,
        email: addressInfo.billing_address.email
      };
    }
    
    // Construct the payload according to Magento API requirements
    const shippingInfo = {
      addressInformation: {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method_code: shippingMethod.method_code,
        shipping_carrier_code: shippingMethod.carrier_code
      }
    };
    
    console.log("📦 Shipping info payload:", JSON.stringify(shippingInfo, null, 2));
    
    let response;
    if (isLoggedIn) {
      response = await magentoApi.post('/carts/mine/shipping-information', shippingInfo);
    } else {
      response = await magentoApi.post(`/guest-carts/${cartId}/shipping-information`, shippingInfo);
    }
    
    console.log("✅ Shipping information set:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error setting shipping information:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to set shipping information');
    }
  }
};

/**
 * Place order
 * @param {Object} paymentInfo - Payment information
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Object>} - Order information
 */
export const placeOrder = async (paymentInfo, cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("🛒 Placing order...");
    console.log("💳 Payment info:", paymentInfo);
    
    // For guest users, we need the cart ID
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    // Prepare the payment information payload
    const payload = {
      paymentMethod: {
        method: paymentInfo.method
      }
    };
    
    // Add additional payment details if needed
    if (paymentInfo.additional_data) {
      payload.paymentMethod.additional_data = paymentInfo.additional_data;
    }
    
    console.log("📦 Order payload:", JSON.stringify(payload, null, 2));
    
    let response;
    
    if (isLoggedIn) {
      // For logged-in customers, use the correct endpoint
      try {
        // First try with the standard endpoint
        response = await magentoApi.post('/carts/mine/payment-information', payload);
      } catch (err) {
        console.log("⚠️ Standard endpoint failed, trying alternative endpoint...");
        // If that fails, try the alternative endpoint
        response = await magentoApi.post('/carts/mine/order', payload);
      }
    } else {
      // For guest users
      // Include email in the payload for guest checkout
      const guestPayload = {
        ...payload,
        email: paymentInfo.email
      };
      
      try {
        // First try with the standard endpoint
        response = await magentoApi.post(`/guest-carts/${cartId}/payment-information`, guestPayload);
      } catch (err) {
        console.log("⚠️ Standard endpoint failed, trying alternative endpoint...");
        // If that fails, try the alternative endpoint
        response = await magentoApi.post(`/guest-carts/${cartId}/order`, guestPayload);
      }
    }
    
    console.log("✅ Order placed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error placing order:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to place order. Please try again or contact customer support.');
    }
  }
};

/**
 * Get countries list
 * @returns {Promise<Array>} - List of countries
 */
export const getCountries = async () => {
  try {
    console.log("🌎 Fetching countries list...");
    
    const response = await magentoApi.get('/directory/countries');
    
    console.log("✅ Countries fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching countries:', error.response?.data || error.message);
    throw new Error('Failed to fetch countries list');
  }
};

/**
 * Estimate shipping methods by address
 * @param {Object} address - Address information
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Array>} - Available shipping methods
 */
export const estimateShippingMethods = async (address, cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("🚚 Estimating shipping methods for address...");
    console.log("📦 Address:", address);
    
    // For guest users, we need the cart ID
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    // Create a clean address object with only the required fields
    const cleanAddress = {
      country_id: address.country_id,
      postcode: address.postcode,
      region: address.region,
      region_id: address.region_id
    };
    
    // Add city if available
    if (address.city) {
      cleanAddress.city = address.city;
    }
    
    let response;
    if (isLoggedIn) {
      response = await magentoApi.post('/carts/mine/estimate-shipping-methods', {
        address: cleanAddress
      });
    } else {
      response = await magentoApi.post(`/guest-carts/${cartId}/estimate-shipping-methods`, {
        address: cleanAddress
      });
    }
    
    console.log("✅ Shipping methods estimated:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error estimating shipping methods:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to estimate shipping methods');
    }
  }
};

/**
 * Get cart totals
 * @param {string} cartId - Guest cart ID (required for guest checkout)
 * @returns {Promise<Object>} - Cart totals
 */
export const getCartTotals = async (cartId = null) => {
  try {
    const isLoggedIn = authService.isAuthenticated();
    console.log("💰 Fetching cart totals...");
    
    // For guest users, we need the cart ID
    if (!isLoggedIn && !cartId) {
      throw new Error('Cart ID is required for guest checkout');
    }
    
    let response;
    if (isLoggedIn) {
      response = await magentoApi.get('/carts/mine/totals');
    } else {
      response = await magentoApi.get(`/guest-carts/${cartId}/totals`);
    }
    
    console.log("✅ Cart totals fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching cart totals:', error.response?.data || error.message);
    throw new Error('Failed to fetch cart totals');
  }
};

export default {
  getShippingMethods,
  getPaymentMethods,
  setShippingInformation,
  placeOrder,
  getCountries,
  estimateShippingMethods,
  getCartTotals
};
