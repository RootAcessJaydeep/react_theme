import React from 'react';
import OnePageCheckout from '../components/onePageCheckout/OnePageCheckout';

const Checkout = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <OnePageCheckout />
    </div>
  );
};

export default Checkout;





// import React, { useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useCheckout } from '../hooks/useCheckout';
// import { formatPrice } from '../utils/formatters';
// import LoadingSpinner from '../utils/Loader';

// // Step components
// import ShippingStep from '../components/checkout/ShippingStep';
// import PaymentStep from '../components/checkout/PaymentStep';
// import ReviewStep from '../components/checkout/ReviewStep';
// import ConfirmationStep from '../components/checkout/ConfirmationStep';

// const Checkout = () => {
//   const {
//     loading,
//     error,
//     step,
//     shippingAddress,
//     billingAddress,
//     shippingMethods,
//     selectedShippingMethod,
//     paymentMethods,
//     selectedPaymentMethod,
//     countries,
//     orderSummary,
//     orderId,
//     cartItems,
    
//     setShippingAddress,
//     setBillingAddress,
//     setSelectedShippingMethod,
//     setSelectedPaymentMethod,
//     handleShippingAddressChange,
//     handleBillingAddressChange,
//     toggleSameAsBilling,
//     estimateShippingMethods,
//     saveShippingInformation,
//     placeOrder,
//     nextStep,
//     prevStep,
//     setError
//   } = useCheckout();

//   // Estimate shipping methods when country or postcode changes
//   useEffect(() => {
//     if (shippingAddress.country_id && shippingAddress.postcode) {
//       estimateShippingMethods();
//     }
//   }, [shippingAddress.country_id, shippingAddress.postcode]);

//   // Render loading state
//   if (loading && !cartItems.length) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-center items-center h-64">
//           <LoadingSpinner size="lg" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
//       {/* Checkout Steps */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center">
//           <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
//               <span className="text-lg font-semibold">1</span>
//             </div>
//             <span className="mt-2 text-sm">Shipping</span>
//           </div>
          
//           <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
//           <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
//               <span className="text-lg font-semibold">2</span>
//             </div>
//             <span className="mt-2 text-sm">Payment</span>
//           </div>
          
//           <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
//           <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
//               <span className="text-lg font-semibold">3</span>
//             </div>
//             <span className="mt-2 text-sm">Review</span>
//           </div>
          
//           <div className={`flex-1 h-1 mx-4 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
//           <div className={`flex flex-col items-center ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
//               <span className="text-lg font-semibold">4</span>
//             </div>
//             <span className="mt-2 text-sm">Confirmation</span>
//           </div>
//         </div>
//       </div>
      
//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           <p>{error}</p>
//         </div>
//       )}
      
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Main Checkout Form */}
//         <div className="lg:w-2/3">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             {/* Step 1: Shipping */}
//             {step === 1 && (
//               <ShippingStep 
//                 shippingAddress={shippingAddress}
//                 billingAddress={billingAddress}
//                 handleShippingAddressChange={handleShippingAddressChange}
//                 handleBillingAddressChange={handleBillingAddressChange}
//                 toggleSameAsBilling={toggleSameAsBilling}
//                 countries={countries}
//                 shippingMethods={shippingMethods}
//                 selectedShippingMethod={selectedShippingMethod}
//                 setSelectedShippingMethod={setSelectedShippingMethod}
//                 onContinue={saveShippingInformation}
//                 loading={loading}
//               />
//             )}
            
//             {/* Step 2: Payment */}
//             {step === 2 && (
//               <PaymentStep 
//                 paymentMethods={paymentMethods}
//                 selectedPaymentMethod={selectedPaymentMethod}
//                 setSelectedPaymentMethod={setSelectedPaymentMethod}
//                 onContinue={nextStep}
//                 onBack={prevStep}
//                 loading={loading}
//               />
//             )}
            
//             {/* Step 3: Review */}
//             {step === 3 && (
//               <ReviewStep 
//                 shippingAddress={shippingAddress}
//                 billingAddress={billingAddress}
//                 selectedShippingMethod={selectedShippingMethod}
//                 selectedPaymentMethod={selectedPaymentMethod}
//                 cartItems={cartItems}
//                 orderSummary={orderSummary}
//                 onPlaceOrder={placeOrder}
//                 onBack={prevStep}
//                 loading={loading}
//               />
//             )}
            
//             {/* Step 4: Confirmation */}
//             {step === 4 && (
//               <ConfirmationStep 
//                 orderId={orderId}
//               />
//             )}
//           </div>
//         </div>
        
//         {/* Order Summary */}
//         {step < 4 && (
//           <div className="lg:w-1/3">
//             <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
//               <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
//               {/* Cart Items */}
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium text-gray-700 mb-2">Items ({cartItems.length})</h3>
//                 <div className="space-y-3 max-h-60 overflow-y-auto">
//                   {cartItems.map(item => (
//                     <div key={item.item_id} className="flex items-center">
//                       <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded border border-gray-200">
//                         {item.extension_attributes?.image_url ? (
//                           <img 
//                             src={item.extension_attributes.image_url} 
//                             alt={item.name} 
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full bg-gray-100 flex items-center justify-center">
//                             <span className="text-xs text-gray-500">No image</span>
//                           </div>
//                         )}
//                       </div>
//                       <div className="ml-3 flex-1">
//                         <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
//                         <p className="text-xs text-gray-500">Qty: {item.qty}</p>
//                       </div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {formatPrice(item.price * item.qty)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               {/* Totals */}
//               {orderSummary && (
//                 <div className="border-t pt-4 space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">Subtotal</span>
//                     <span className="text-sm font-medium">{formatPrice(orderSummary.subtotal)}</span>
//                   </div>
                  
//                   {orderSummary.discount_amount > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Discount</span>
//                       <span className="text-sm font-medium text-green-600">-{formatPrice(Math.abs(orderSummary.discount_amount))}</span>
//                     </div>
//                   )}
                  
//                   {step >= 2 && selectedShippingMethod && (
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Shipping ({selectedShippingMethod.method_title})</span>
//                       <span className="text-sm font-medium">{formatPrice(orderSummary.shipping_amount)}</span>
//                     </div>
//                   )}
                  
//                   {orderSummary.tax_amount > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Tax</span>
//                       <span className="text-sm font-medium">{formatPrice(orderSummary.tax_amount)}</span>
//                     </div>
//                   )}
                  
//                   <div className="flex justify-between border-t pt-2 mt-2">
//                     <span className="font-semibold">Total</span>
//                     <span className="font-bold text-lg">{formatPrice(orderSummary.grand_total)}</span>
//                   </div>
//                 </div>
//               )}
              
//               {/* Back to Cart */}
//               <div className="mt-6">
//                 <Link to="/cart" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//                   </svg>
//                   Back to Cart
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Checkout;