import { useEffect } from 'react';
import { getCart } from '../api/cart';
import authService from '../api/auth.jsx';

/**
 * Component that initializes the cart when the application loads
 * This should be included near the top of your application component tree
 */
const CartInitializer = () => {
  useEffect(() => {
    const initializeCart = async () => {
      try {
        console.log("🚀 Initializing cart on application load...");
        
        // For guest users, get cart ID from localStorage
        const guestCartId = localStorage.getItem('magento_guest_cart_id');
        
        if (authService.isAuthenticated()) {
          console.log("🔐 User is authenticated, fetching customer cart");
          await getCart();
        } else if (guestCartId) {
          console.log("👻 User is a guest with existing cart ID:", guestCartId);
          await getCart(guestCartId);
        } else {
          console.log("🆕 New guest user, no cart exists yet");
        }
        
        console.log("✅ Cart initialization complete");
      } catch (error) {
        console.error("❌ Error initializing cart:", error);
      }
    };
    
    initializeCart();
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default CartInitializer;