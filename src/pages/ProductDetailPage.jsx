import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";
import useProduct from "../hooks/useProduct";
import LoadingSpinner from "../utils/Loader";
import ErrorMessage from "../components/ui/ErrorMessage";
import { formatPrice } from "../utils/formatters";
import AddToCartButton from "../components/cart/AddToCartButton";


// SVG icons as components to replace Heroicons
const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const StarSolidIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const apibashurl =
  import.meta.env.VITE_BASE_URL || "https://m24umm.askjitendra.com/rest/V1";
const ProductDetailPage = () => {
  const { urlKey } = useParams();
  const { slug } = useParams();
  console.log("Slug", slug);
  console.log("Url key", urlKey);

  const { categories } = useCategory();
  const {
    product,
    relatedProducts,
    loading,
    error,
    getProductByUrlKey,
    getCustomAttribute,
    getProductImages,
    getPrice,
    isOnSale,
    getSpecialPrice,
  } = useProduct();

  const [productCategories, setProductCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Memoize the categories to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories, [categories]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!urlKey) return;

      const productData = await getProductByUrlKey(urlKey);

      // Set the first image as selected
      const imageAttribute = productData?.custom_attributes?.find(
        (attr) => attr.attribute_code === "image"
      );
      if (imageAttribute) {
        setSelectedImage(imageAttribute.value);
      }

      // Get product categories - using the categories from the context directly
      if (
        productData?.extension_attributes?.category_links &&
        memoizedCategories
      ) {
        const categoryItems = productData.extension_attributes.category_links
          .map((link) => {
            // Find the category in the context's categories array
            return memoizedCategories.find(
              (cat) => cat.id === link.category_id
            );
          })
          .filter(Boolean); // Filter out any undefined values

        setProductCategories(categoryItems);
      }
    };

    fetchProductData();
  }, [urlKey, getProductByUrlKey, memoizedCategories]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Implement add to cart functionality
    console.log(`Adding ${quantity} of ${product.sku} to cart`);
  };

  // Increment quantity
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={`Product "${urlKey}" not found`} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-indigo-600">
                Home
              </a>
              <svg
                className="fill-current w-3 h-3 mx-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
              >
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
              </svg>
            </li>
            {productCategories.map((category, index) => (
              <li key={category.id} className="flex items-center">
                <a
                  href={`/category/${category.url_key || category.id}`}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  {category.name}
                </a>
                {index < productCategories.length - 1 && (
                  <svg
                    className="fill-current w-3 h-3 mx-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                  </svg>
                )}
              </li>
            ))}
            <li className="text-indigo-600 font-medium">{product.name}</li>
          </ol>
        </nav>
      </div>

      {/* Product Main Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row -mx-4">
          {/* Product Gallery */}
          <div className="md:flex-1 px-4 mb-6 md:mb-0">
            {/* Main Preview Image */}
            <div className="h-64 md:h-80 rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
              <img
                src={`${apibashurl}/media/catalog/product${
                  selectedImage || getCustomAttribute("image")
                }`}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Image Thumbnails */}
            <div className="flex -mx-2 mb-4">
              {getProductImages()
                .filter((imageObj) => imageObj.isMain === false)
                .map((imageObj, index) => (
                  <div
                    key={index}
                    className={`w-1/4 px-2 ${
                      imageObj.url === selectedImage
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                    onClick={() => setSelectedImage(imageObj.url)}
                  >
                    <div className="h-24 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                      <img
                        src={`${apibashurl}/media/catalog/product${imageObj.url}`}
                        alt={`${product.name} - ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:flex-1 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {product.name}
            </h2>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) =>
                  i < 4 ? (
                    <span key={i} className="text-yellow-400">
                      <StarSolidIcon />
                    </span>
                  ) : (
                    <span key={i} className="text-yellow-400">
                      <StarIcon />
                    </span>
                  )
                )}
              </div>
              <span className="text-gray-500 ml-2">4.0 (24 reviews)</span>
            </div>

            <div className="flex items-center mb-4">
              <span className="font-bold text-gray-700 mr-2">SKU:</span>
              <span className="text-gray-600">{product.sku}</span>
            </div>

            <div className="mb-4">
              <span className="font-bold text-gray-700">Availability:</span>
              <span className="text-green-600 ml-2">In Stock</span>
            </div>

            <div className="mb-4">
              {isOnSale() ? (
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-indigo-600 mr-2">
                    {formatPrice(getSpecialPrice())}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(getPrice())}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                    SALE
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-indigo-600">
                  {formatPrice(getPrice())}
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-l"
                    onClick={decrementQuantity}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="qty"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="py-2 px-4 text-center w-16 border-none focus:outline-none focus:ring-0"
                  />
                  <button
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-r"
                    onClick={incrementQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <AddToCartButton
                  product={product}
                  quantity={quantity}
                  className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  buttonText="Add to Cart"
                  showQuantity={false}
                  onSuccess={(product, qty) => {
                    // Optional success callback
                    console.log(
                      `Successfully added ${qty} of ${product.name} to cart`
                    );
                  }}
                  onError={(error) => {
                    // Optional error callback
                    console.error("Failed to add to cart:", error);
                  }}
                />
                <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  <HeartIcon />
                  <span className="ml-2">Wishlist</span>
                </button>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Share:</span>
              <a href="#" className="text-gray-400 hover:text-blue-500">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "description"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "details"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "reviews"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>

        <div className="py-4">
          {activeTab === "description" && (
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: getCustomAttribute("description") || "",
              }}
            />
          )}

          {activeTab === "details" && (
            <div className="text-gray-600">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Brand</td>
                    <td className="py-2">
                      {getCustomAttribute("brand") || "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Weight</td>
                    <td className="py-2">
                      {getCustomAttribute("weight") || "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Dimensions</td>
                    <td className="py-2">N/A</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">Color</td>
                    <td className="py-2">
                      {getCustomAttribute("color") || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="text-gray-600">
              <p className="mb-4">Customer reviews will be displayed here.</p>
              <button className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Related Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group">
                  <a
                    href={`/product/${
                      relatedProduct.url_key || relatedProduct.sku
                    }`}
                    className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-64 bg-gray-100">
                      <img
                        src={`${apibashurl}/media/catalog/product${
                          relatedProduct.custom_attributes?.find(
                            (attr) => attr.attribute_code === "small_image"
                          )?.value || ""
                        }`}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain p-4"
                      />
                      {/* Quick view button that appears on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button className="bg-white text-gray-800 py-2 px-4 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) =>
                            i < 4 ? (
                              <span key={i} className="text-yellow-400">
                                <StarSolidIcon />
                              </span>
                            ) : (
                              <span key={i} className="text-yellow-400">
                                <StarIcon />
                              </span>
                            )
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">(12)</span>
                      </div>
                      <div className="font-bold text-indigo-600">
                        {formatPrice(relatedProduct.price)}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
