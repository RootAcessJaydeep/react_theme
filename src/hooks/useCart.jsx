import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../api/auth.jsx";
import { magentoApi } from "../api/auth.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  CART_KEY,
  CART_SESSION_KEY,
  GUEST_CART_ID_KEY,
} from "../constants/storageKeys";

  // Add item to cart
 import Swal from "sweetalert2";

// Create context
const CartContext = createContext(null);
// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Provider component
export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [guestCartId, setGuestCartId] = useState(
    localStorage.getItem(GUEST_CART_ID_KEY)
  );

  // Format cart items from Magento format to our application format
  const formatCartItems = (cartData) => {
    // If cartData is already an array, return it
    if (Array.isArray(cartData)) {
      return cartData;
    }

    // If cartData has an items property that is an array, format those items
    if (cartData && Array.isArray(cartData.items)) {
      return cartData.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.extension_attributes?.image_url || "",
        item_id: item.item_id,
        product_id: item.product_id,
      }));
    }

    // If we can't determine the format, return an empty array
    return [];
  };

  // Fetch cart data
  const fetchCartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isLoggedIn = authService.isAuthenticated();
      console.log("🛒 Fetching cart data...");
      console.log("👤 Is user logged in?", isLoggedIn);

      if (isLoggedIn) {
        // Use Magento API with cache busting timestamp
        const timestamp = new Date().getTime();
        const response = await magentoApi.get(`/carts/mine?_=${timestamp}`);
        console.log("✅ Cart data fetched:", response.data);

        // Format cart items
        const formattedItems = formatCartItems(response.data);
        setCart(response.data);
        setCartItems(formattedItems);

        // Save to localStorage for offline access
        localStorage.setItem(CART_SESSION_KEY, JSON.stringify(formattedItems));
      } else {
        // For guest users, load from session storage
        const sessionCart = sessionStorage.getItem(CART_SESSION_KEY);
        if (sessionCart) {
          const parsedCart = JSON.parse(sessionCart);
          console.log("📋 Session cart data:", parsedCart);
          setCartItems(parsedCart);
          setCart({ items: parsedCart });
        } else {
          console.log("📭 No session cart data found");
          setCartItems([]);
          setCart({ items: [] });
        }
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      setError("Failed to load cart data. Please try again.");

      // Fallback to localStorage if API fails
      if (authService.isAuthenticated()) {
        const localCart = localStorage.getItem(CART_SESSION_KEY);
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          console.log(
            "📦 Using cached cart data from localStorage:",
            parsedCart
          );
          setCartItems(parsedCart);
          setCart({ items: parsedCart });
        }
      }
    } finally {
      setLoading(false);
    }
  };


const navigate = useNavigate();

const addItemToCart = async (cartItem) => {
  setUpdating(true);
  setError(null);

  try {
    if (!authService.isAuthenticated()) {
      await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to your cart.",
        confirmButtonText: "Login Now",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login"); // redirect to your login route
        }
      });

      return { success: false, message: "User not authenticated" };
    }

    // Magento add to cart API call
    const itemData = {
      cartItem: {
        sku: cartItem.sku,
        qty: cartItem.qty,
      },
    };

    const response = await magentoApi.post("/carts/mine/items", itemData);
    console.log("✅ Item added to Magento cart:", response.data);

    await fetchCartData();

    return { success: true };
  } catch (err) {
    console.error("❌ Error adding item to cart:", err);
    setError("Failed to add item to cart. Please try again.");
    throw err;
  } finally {
    setUpdating(false);
  }
};


  // Remove item from cart
  const removeItem = async (itemId) => {
    setUpdating(true);
    setError(null);
    try {
      console.log("🗑️ Removing item from cart with ID:", itemId);

      if (authService.isAuthenticated()) {
        // Find the item in the cart to get its item_id
        const itemToRemove = cartItems.find(
          (item) => item.sku === itemId || item.item_id === itemId
        );

        if (!itemToRemove || !itemToRemove.item_id) {
          throw new Error("Item not found in cart or missing item_id");
        }

        // Remove from Magento cart
        await magentoApi.delete(`/carts/mine/items/${itemToRemove.item_id}`);
        console.log("✅ Item removed from Magento cart");

        // Refresh cart to get updated data
        await fetchCartData();
      } else {
        // For guest users, just update local cart
        const updatedCart = cartItems.filter(
          (item) => item.sku !== itemId && item.item_id !== itemId
        );
        setCartItems(updatedCart);
        setCart({ items: updatedCart });
        sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(updatedCart));
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Error removing item from cart:", err);
      setError("Failed to remove item from cart. Please try again.");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId, qty) => {
    setUpdating(true);
    setError(null);
    try {
      console.log(`🔄 Updating quantity for item ${itemId} to ${qty}`);

      if (qty <= 0) {
        return removeItem(itemId);
      }

      if (authService.isAuthenticated()) {
        // Find the item in the cart to get its item_id
        const itemToUpdate = cartItems.find(
          (item) => item.sku === itemId || item.item_id === itemId
        );

        if (!itemToUpdate || !itemToUpdate.item_id) {
          throw new Error("Item not found in cart or missing item_id");
        }

        // Update in Magento cart
        const itemData = {
          cartItem: {
            item_id: itemToUpdate.item_id,
            qty: qty,
          },
        };

        await magentoApi.put(
          `/carts/mine/items/${itemToUpdate.item_id}`,
          itemData
        );
        console.log("✅ Item quantity updated in Magento cart");

        // Refresh cart to get updated data
        await fetchCartData();
      } else {
        // For guest users, just update local cart
        const updatedCart = cartItems.map((item) =>
          item.sku === itemId || item.item_id === itemId
            ? { ...item, qty }
            : item
        );

        setCartItems(updatedCart);
        setCart({ items: updatedCart });
        sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(updatedCart));
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Error updating item quantity:", err);
      setError("Failed to update item quantity. Please try again.");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Calculate cart totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.qty, 0);
  };

  // Check if a product is in the cart
  const isInCart = (sku) => {
    return cartItems.find((item) => item.sku === sku) || null;
  };

  // Clear cart
  const clearCart = async () => {
    console.log("🧹 Clearing cart");
    setUpdating(true);

    try {
      setCartItems([]);
      setCart({ items: [] });
      sessionStorage.removeItem(CART_SESSION_KEY);
       sessionStorage.removeItem(CART_SESSION_KEY, []);

      return { success: true };
    } catch (err) {
      console.error("❌ Error clearing cart:", err);
      setError("Failed to clear cart. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Merge guest cart with user cart after login
  const mergeWithUserCart = async () => {
    setUpdating(true);
    try {
      console.log("🔄 Merging guest cart with user cart");

      // Get the current session cart items
      const sessionCart = sessionStorage.getItem(CART_SESSION_KEY);
      if (sessionCart && authService.isAuthenticated()) {
        const guestItems = JSON.parse(sessionCart);

        // Add each guest item to the customer cart
        for (const item of guestItems) {
          try {
            await addItemToCart({
              sku: item.sku,
              qty: item.qty,
            });
          } catch (addError) {
            console.error(
              `❌ Error adding guest item ${item.sku} to customer cart:`,
              addError
            );
          }
        }

        // Clear session storage
        sessionStorage.removeItem(CART_SESSION_KEY);
      }

      // Refresh cart data
      await fetchCartData();

      return { success: true };
    } catch (err) {
      console.error("❌ Error merging carts:", err);
      setError("Failed to merge carts. Please try again.");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    fetchCartData();

    // Set up an interval to refresh the cart periodically (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (authService.isAuthenticated()) {
        console.log("🔄 Periodic cart refresh...");
        fetchCartData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  // Value to be provided by the context
  const value = {
    cart,
    cartItems,
    loading,
    updating,
    error,
    fetchCartData,
    addItemToCart,
    removeItem,
    updateItemQuantity,
    calculateSubtotal,
    getCartItemCount,
    isInCart,
    clearCart,
    mergeWithUserCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
