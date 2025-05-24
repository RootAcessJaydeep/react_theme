import React from 'react';
import LoadingSpinner from '../../utils/Loader';

const PaymentSection = ({
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  sectionCompleted,
  sectionExpanded,
  toggleSection,
  savePaymentMethod,
  sectionLoading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div 
        className={`p-4 border-b cursor-pointer flex justify-between items-center ${sectionCompleted.payment ? 'bg-green-50' : ''}`}
        onClick={() => toggleSection('payment')}
      >
        <h2 className="text-lg font-semibold">
          {sectionCompleted.payment ? (
            <span className="text-green-600">✓ </span>
          ) : (
            <span className="text-gray-400">3. </span>
          )}
          Payment Method
        </h2>
        <svg 
          className={`h-5 w-5 transform ${sectionExpanded.payment ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {sectionExpanded.payment && (
        <div className="p-6">
          {sectionLoading.payment ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {paymentMethods.length === 0 ? (
                <p className="text-gray-500 italic">
                  Please complete your shipping method to see available payment methods.
                </p>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div key={method.code} className="border rounded-md p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={method.code}
                          name="payment_method"
                          checked={selectedPaymentMethod && selectedPaymentMethod.code === method.code}
                          onChange={() => setSelectedPaymentMethod(method)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor={method.code} className="ml-3 flex flex-1">
                          <div>
                            <span className="block text-sm font-medium text-gray-700">{method.title}</span>
                            {method.description && (
                              <span className="block text-sm text-gray-500 mt-1">{method.description}</span>
                            )}
                          </div>
                        </label>
                      </div>
                      
                      {/* Credit Card Form (if selected and is credit card) */}
                      {selectedPaymentMethod && 
                       selectedPaymentMethod.code === method.code && 
                       method.code === 'checkmo' && (
                        <div className="mt-4 ml-7 text-sm text-gray-600">
                          <p>You will receive payment instructions after placing the order.</p>
                        </div>
                      )}
                      
                      {/* Credit Card Form (placeholder for integration with actual payment processors) */}
                      {selectedPaymentMethod && 
                       selectedPaymentMethod.code === method.code && 
                       method.code === 'braintree' && (
                        <div className="mt-4 ml-7">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label htmlFor="cc_number" className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="cc_number"
                                placeholder="•••• •••• •••• ••••"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="cc_exp" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiration Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="cc_exp"
                                placeholder="MM/YY"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="cc_cvc" className="block text-sm font-medium text-gray-700 mb-1">
                                CVC/CVV <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="cc_cvc"
                                placeholder="•••"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Continue Button */}
              {paymentMethods.length > 0 && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={savePaymentMethod}
                    disabled={sectionLoading.payment || !selectedPaymentMethod}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {sectionLoading.payment ? 'Processing...' : 'Review Order'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentSection;