import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductContext } from '../../context/ProductContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import RelatedProducts from './RelatedProducts';
import AddToCartButton from '../cart/AddToCartButton';
import ProductGallery from './ProductGallery';
import ProductAttributes from './ProductAttributes';
import ProductReviews from './ProductReviews';

const ProductDetail = () => {
  const { slug } = useParams();
  const { 
    getProductByUrlKey, 
    getRelatedProducts,
    loading, 
    error, 
    product,
    relatedProducts
  } = useProductContext();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      const productData = await getProductByUrlKey(slug);
      
      if (productData && productData.sku) {
        // Load related products
        getRelatedProducts(productData.sku);
      }
    };
    
    loadProduct();
  }, [slug, getProductByUrlKey, getRelatedProducts]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" />;
  }

  const {
    name,
    sku,
    price,
    special_price,
    description,
    short_description,
    media_gallery_entries = [],
    custom_attributes = []
  } = product;

  // Find specific attributes
  const findAttribute = (attributeCode) => {
    const attribute = custom_attributes.find(attr => attr.attribute_code === attributeCode);
    return attribute ? attribute.value : null;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <ProductGallery images={media_gallery_entries} productName={name} />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          <p className="text-gray-600 mb-4">SKU: {sku}</p>
          
          {/* Price */}
          <div className="mb-6">
            {special_price ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600 mr-2">
                  {formatPrice(special_price)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
            )}
          </div>
          
          {/* Short Description */}
          {short_description && (
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: short_description.html }} />
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          {/* Add to Cart Button */}
          <div className="mb-8">
            <AddToCartButton product={product} quantity={quantity} />
          </div>
          
          {/* Product Attributes */}
          <ProductAttributes attributes={custom_attributes} />
        </div>
      </div>
      
      {/* Full Description */}
      {description && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description.html }} />
        </div>
      )}
      
      {/* Product Reviews */}
      <ProductReviews productSku={sku} />
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDetail;