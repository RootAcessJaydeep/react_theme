import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const OrderSummary = ({ cartItems, orderSummary, selectedShippingMethod }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Items ({cartItems.length})</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cartItems.map(item => (
            <div key={item.item_id} className="flex items-center">
              <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded border border-gray-200">
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
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.qty}</p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatPrice(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Totals */}
      {orderSummary && (
        <div className="border-t pt-4 space-y-2">
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
          
          {selectedShippingMethod && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Shipping ({selectedShippingMethod.method_title})</span>
              <span className="text-sm font-medium">{formatPrice(orderSummary.shipping_amount)}</span>
            </div>
          )}
          
          {orderSummary.tax_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium">{formatPrice(orderSummary.tax_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatPrice(orderSummary.grand_total)}</span>
          </div>
        </div>
      )}
      
      {/* Back to Cart */}
      <div className="mt-6">
        <Link to="/cart" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Cart
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary;