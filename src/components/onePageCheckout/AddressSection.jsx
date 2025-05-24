import React from 'react';

const AddressSection = ({
  shippingAddress,
  billingAddress,
  handleShippingAddressChange,
  handleBillingAddressChange,
  toggleSameAsBilling,
  countries,
  sectionCompleted,
  sectionExpanded,
  toggleSection,
  saveShippingAddress,
  sectionLoading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div 
        className={`p-4 border-b cursor-pointer flex justify-between items-center ${sectionCompleted.address ? 'bg-green-50' : ''}`}
        onClick={() => toggleSection('address')}
      >
        <h2 className="text-lg font-semibold">
          {sectionCompleted.address ? (
            <span className="text-green-600">✓ </span>
          ) : (
            <span className="text-gray-400">1. </span>
          )}
          Shipping Address
        </h2>
        <svg 
          className={`h-5 w-5 transform ${sectionExpanded.address ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {sectionExpanded.address && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstname"
                value={shippingAddress.firstname}
                onChange={(e) => handleShippingAddressChange('firstname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastname"
                value={shippingAddress.lastname}
                onChange={(e) => handleShippingAddressChange('lastname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Street Address Line 1 */}
            <div className="md:col-span-2">
              <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="street1"
                value={shippingAddress.street[0]}
                onChange={(e) => handleShippingAddressChange('street[0]', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address, P.O. box, company name"
                required
              />
            </div>
            
            {/* Street Address Line 2 */}
            <div className="md:col-span-2">
              <input
                type="text"
                id="street2"
                value={shippingAddress.street[1]}
                onChange={(e) => handleShippingAddressChange('street[1]', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={shippingAddress.city}
                onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* State/Province */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="region"
                value={shippingAddress.region}
                onChange={(e) => handleShippingAddressChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Zip/Postal Code */}
            <div>
              <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip/Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postcode"
                value={shippingAddress.postcode}
                onChange={(e) => handleShippingAddressChange('postcode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Country */}
            <div>
              <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country_id"
                value={shippingAddress.country_id}
                onChange={(e) => handleShippingAddressChange('country_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.full_name_english}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Phone Number */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telephone"
                value={shippingAddress.telephone}
                onChange={(e) => handleShippingAddressChange('telephone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={shippingAddress.email}
                onChange={(e) => handleShippingAddressChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Same as Billing Checkbox */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={shippingAddress.same_as_billing}
                onChange={toggleSameAsBilling}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Billing address same as shipping address</span>
            </label>
          </div>
          
          {/* Billing Address Form (if different from shipping) */}
          {!shippingAddress.same_as_billing && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Billing Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="billing_firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_firstname"
                    value={billingAddress.firstname}
                    onChange={(e) => handleBillingAddressChange('firstname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="billing_lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_lastname"
                    value={billingAddress.lastname}
                    onChange={(e) => handleBillingAddressChange('lastname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Street Address Line 1 */}
                <div className="md:col-span-2">
                  <label htmlFor="billing_street1" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_street1"
                    value={billingAddress.street[0]}
                    onChange={(e) => handleBillingAddressChange('street[0]', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street address, P.O. box, company name"
                    required
                  />
                </div>
                
                {/* Street Address Line 2 */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    id="billing_street2"
                    value={billingAddress.street[1]}
                    onChange={(e) => handleBillingAddressChange('street[1]', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
                
                {/* City */}
                <div>
                  <label htmlFor="billing_city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_city"
                    value={billingAddress.city}
                    onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* State/Province */}
                <div>
                  <label htmlFor="billing_region" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_region"
                    value={billingAddress.region}
                    onChange={(e) => handleBillingAddressChange('region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Zip/Postal Code */}
                <div>
                  <label htmlFor="billing_postcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billing_postcode"
                    value={billingAddress.postcode}
                    onChange={(e) => handleBillingAddressChange('postcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Country */}
                <div>
                  <label htmlFor="billing_country_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="billing_country_id"
                    value={billingAddress.country_id}
                    onChange={(e) => handleBillingAddressChange('country_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.full_name_english}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Phone Number */}
                <div>
                  <label htmlFor="billing_telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="billing_telephone"
                    value={billingAddress.telephone}
                    onChange={(e) => handleBillingAddressChange('telephone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="billing_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="billing_email"
                    value={billingAddress.email}
                    onChange={(e) => handleBillingAddressChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Continue Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={saveShippingAddress}
              disabled={sectionLoading.address}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {sectionLoading.address ? 'Processing...' : 'Continue to Shipping Method'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;