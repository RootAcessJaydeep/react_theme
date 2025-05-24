import React, { useState } from 'react';

const ProductFilter = ({ filters, appliedFilters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle filter section expansion
  const toggleSection = (code) => {
    setExpandedSections(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Handle checkbox change
  const handleFilterChange = (attributeCode, value, checked) => {
    const currentValues = appliedFilters[attributeCode] || [];
    
    let newValues;
    if (checked) {
      // Add value if checked
      newValues = [...currentValues, value];
    } else {
      // Remove value if unchecked
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFilterChange(attributeCode, newValues);
  };

  // Check if a filter is applied
  const isFilterApplied = (attributeCode, value) => {
    return appliedFilters[attributeCode]?.includes(value) || false;
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange({});
  };

  // Clear specific filter
  const clearFilter = (attributeCode) => {
    onFilterChange(attributeCode, []);
  };

  // Count total applied filters
  const countAppliedFilters = () => {
    return Object.values(appliedFilters).reduce((count, values) => count + values.length, 0);
  };

  const totalAppliedFilters = countAppliedFilters();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {totalAppliedFilters > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear All
          </button>
        )}
      </div>

      {filters.length === 0 ? (
        <p className="text-gray-500 text-sm">No filters available</p>
      ) : (
        <div className="space-y-4">
          {filters.map(filter => {
            const isExpanded = expandedSections[filter.attribute_code] !== false; // Default to expanded
            const hasAppliedValues = appliedFilters[filter.attribute_code]?.length > 0;
            
            return (
              <div key={filter.attribute_code} className="border-b pb-3">
                <div 
                  className="flex justify-between items-center cursor-pointer py-2"
                  onClick={() => toggleSection(filter.attribute_code)}
                >
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-800">{filter.label}</h3>
                    {hasAppliedValues && (
                      <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {appliedFilters[filter.attribute_code].length}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {isExpanded ? '−' : '+'}
                  </span>
                </div>
                
                {isExpanded && (
                  <div className="mt-2 pl-2">
                    {hasAppliedValues && (
                      <div className="flex justify-end mb-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFilter(filter.attribute_code);
                          }}
                          className="text-xs text-gray-500 hover:text-indigo-600"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filter.options.map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${filter.attribute_code}-${option.value}`}
                            checked={isFilterApplied(filter.attribute_code, option.value)}
                            onChange={(e) => handleFilterChange(
                              filter.attribute_code, 
                              option.value, 
                              e.target.checked
                            )}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`${filter.attribute_code}-${option.value}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option.label} {option.count && `(${option.count})`}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductFilter;