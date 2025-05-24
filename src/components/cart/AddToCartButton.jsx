import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { isAuthenticated } from "../../api/auth";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";

const AddToCartButton = ({
  product,
  quantity = 1,
  className = "",
  showQuantity = false,
  buttonText = "Add to Cart",
  onSuccess = () => {},
  onError = () => {},
}) => {
  const { addItemToCart, loading } = useCart();
  const [itemQuantity, setItemQuantity] = useState(quantity);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setItemQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.sku) return;

    // ✅ Check if customer is logged in
    if (!isAuthenticated()) {
      Swal.fire({
        icon: "warning",
        title: "Please login first",
        text: "You need to be logged in to add products to your cart.",
        confirmButtonText: "Login Now",
      });
      return;
    }else
  {    
    console.log("dsjdhsjhdjs");
    console.log(isAuthenticated());
  }

    try {
      setAddingToCart(true);
      console.log(product);

      const cartItem = {
        sku: product.sku,
        name: product.name || "Product",
        price: product.price || 0,
        image: product.image || "",
        qty: itemQuantity,
      };

      const response = await addItemToCart(cartItem);
      if (response) {
        toast.success(`${product.name} added to cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        onSuccess(product, itemQuantity);
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error(`Failed to add ${product.name} to cart. Please try again.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onError(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const isLoading = loading || addingToCart;
  const buttonClasses = `${className} ${
    isLoading ? "opacity-70 cursor-not-allowed" : ""
  }`;

  return (
    <div className="flex flex-col">
      {showQuantity && (
        <div className="mb-2">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={itemQuantity}
            onChange={handleQuantityChange}
            className="w-20 border border-gray-300 rounded-md px-3 py-2"
            disabled={isLoading}
          />
        </div>
      )}

      <button
        type="button"
        className={buttonClasses}
        onClick={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding...
          </span>
        ) : (
          buttonText
        )}
      </button>

      <ToastContainer />
    </div>
  );
};

export default AddToCartButton;
