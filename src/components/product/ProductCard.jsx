import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useConfig } from "../../hooks/useConfig";
import { useCart } from "../../hooks/useCart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function ProductCard({ productsdata }) {
  const { baseMediaUrl } = useConfig();
  const { addItemToCart, loading: cartLoading } = useCart();
  const [addingToCartIds, setAddingToCartIds] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Helper function to extract custom attribute value
  const getCustomAttribute = (product, attributeCode) => {
    if (!product || !product.custom_attributes) return null;

    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === attributeCode
    );

    return attribute ? attribute.value : null;
  };

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price not available";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Handle adding product to cart
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCartIds.includes(product.id) || cartLoading) return;

    setAddingToCartIds((prev) => [...prev, product.id]);

    try {
      // Prepare cart item data
      const cartItem = {
        sku: product.sku || "",
        name: product.name || "Product",
        price: product.price || 0,
        qty: 1,
        product_id: product.id,
        extension_attributes: {
          image_url: getProductImage(product),
        },
      };

      const response = await addItemToCart(cartItem);
      console.log("sdbsdhsd check toaster rezsosnn");
      console.log(response);
      if (response.success) {
        // Show success notification
        toast.success(`${product.name} added to cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);

      // Show error notification
      toast.error(`Failed to add ${product.name} to cart. Please try again.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setAddingToCartIds((prev) => prev.filter((id) => id !== product.id));
    }
  };

  // Helper function to get product URL
  const getProductUrl = (product) => {
    const urlKey = getCustomAttribute(product, "url_key");
    return urlKey ? `/product/${urlKey}` : "#";
  };

  // Helper function to get product image URL
  const getProductImage = (product) => {
    const imagePath = getCustomAttribute(product, "image");

    if (!imagePath) {
      return "/placeholder.jpg"; // Default placeholder image
    }

    // Construct full image URL
    return `${baseMediaUrl}/pub/media/catalog/product${imagePath}`;
  };

  if (
    !productsdata ||
    !Array.isArray(productsdata) ||
    productsdata.length === 0
  ) {
    return <div className="text-center p-4">No products available</div>;
  }

  return (
    <>
      {productsdata.map((product, index) => {
        if (!product) return null;

        const productUrl = getProductUrl(product);
        const imageUrl = getProductImage(product);
        const productId = product.id || `product-${index}`;

        return (
          <div
            key={productId}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            onMouseEnter={() => setHoveredProductId(productId)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <Link to={productUrl}>
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name || "Product image"}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                  style={{
                    transform:
                      hoveredProductId === productId
                        ? "scale(1.05)"
                        : "scale(1)",
                  }}
                />
              </div>
            </Link>
            <div className="p-4">
              <Link to={productUrl}>
                <h3 className="font-medium mb-1 hover:text-indigo-600">
                  {product.name || "Unnamed Product"}
                </h3>
              </Link>

              {/* Short description if available */}
              {getCustomAttribute(product, "short_description") && (
                <p
                  className="text-gray-500 text-sm mb-2"
                  dangerouslySetInnerHTML={{
                    __html: getCustomAttribute(product, "short_description"),
                  }}
                ></p>
              )}

              {/* Rating - if you have rating data */}
              {getCustomAttribute(product, "rating") && (
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {Array.from(
                      {
                        length:
                          parseInt(getCustomAttribute(product, "rating")) || 0,
                      },
                      (_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      )
                    )}
                  </div>
                  <span className="text-gray-500 text-sm ml-2">
                    ({getCustomAttribute(product, "review_count") || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-indigo-600 font-bold">
                  {formatPrice(product.price)}
                </span>
                <button
                  className={`text-indigo-600 hover:bg-indigo-50 p-2 rounded-full ${
                    addingToCartIds.includes(productId)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  aria-label="Add to cart"
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={addingToCartIds.includes(productId) || cartLoading}
                >
                  {addingToCartIds.includes(productId) ? (
                    <svg
                      className="animate-spin h-5 w-5"
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
                  ) : (
                    <i className="fas fa-shopping-cart"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <ToastContainer />
    </>
  );
}

export default ProductCard;
