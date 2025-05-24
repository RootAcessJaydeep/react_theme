import React from 'react';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../utils/Loader';

const ReviewSection = ({
  shippingAddress,
  billingAddress,
  selectedShippingMethod,
  selectedPaymentMethod,
  cartItems,
  orderSummary,
  sectionCompleted,
  sectionExpanded,
  toggleSection,
  placeOrder,
  sectionLoading
}) => {
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    const parts = [
      `${address.firstname} ${address.lastname}`,
      address.street[0],
      address.street[1],
      `${address.city}, ${address.region} ${address.postcode}`,
      address.country_id,
      address.telephone
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div 
        className={`p-4 border-b cursor-pointer flex justify-between items-center ${sectionCompleted.review ? 'bg-green-50' : ''}`}
        onClick={() => toggleSection('review')}
      >
        <h2 className="text-lg font-semibold">
          {sectionCompleted.review ? (
            <span className="text-green-600">✓ </span>
          ) : (
            <span className="text-gray-400">4. </span>
          )}
          Review & Place Order
        </h2>
        <svg 
          className={`h-5 w-5 transform ${sectionExpanded.review ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {sectionExpanded.review && (
        <div className="p-6">
          {sectionLoading.review ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Shipping Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Shipping Address</h4>
                      <p className="text-sm text-gray-600 mt-1">{formatAddress(shippingAddress)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Shipping Method</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedShippingMethod ? (
                          <>
                            {selectedShippingMethod.carrier_title} - {selectedShippingMethod.method_title}
                            <span className="block">{formatPrice(selectedShippingMethod.amount)}</span>
                          </>
                        ) : (
                          'No shipping method selected'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Billing Information */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Billing Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Billing Address</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {shippingAddress.same_as_billing 
                          ? formatAddress(shippingAddress) 
                          : formatAddress(billingAddress)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPaymentMethod ? selectedPaymentMethod.title : 'No payment method selected'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Order Items</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="divide-y divide-gray-200">
                    {cartItems.map(item => (
                      <div key={item.item_id} className="py-3 flex items-center">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                          {item.extension_attributes?.image_url ? (
                            <img 
                              src={item.extension_attributes.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                          <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              {orderSummary && (
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Order Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-medium">{formatPrice(orderSummary.subtotal)}</span>
                      </div>
                      
                      {orderSummary.discount_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Discount</span>
                          <span className="text-sm font-medium text-green-600">-{formatPrice(Math.abs(orderSummary.discount_amount))}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium">{formatPrice(orderSummary.shipping_amount)}</span>
                      </div>
                      
                      {orderSummary.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tax</span>
                          <span className="text-sm font-medium">{formatPrice(orderSummary.tax_amount)}</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold">{formatPrice(orderSummary.grand_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Terms and Conditions */}
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    By placing your order, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
              
              {/* Place Order Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={sectionLoading.review}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {sectionLoading.review ? 'Processing Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;