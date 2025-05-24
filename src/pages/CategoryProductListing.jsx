import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCategory } from '../hooks/useCategory';
import { useProduct } from '../hooks/useProduct';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination';
import ProductFilter from '../components/product/ProductFilter';
import ProductSorting from '../components/product/ProductSorting';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

function CategoryProductListing() {
  // Prevent multiple renders with useRef
  const initialRenderDone = useRef(false);
  
  // Get URL parameters
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters once
  const queryParams = new URLSearchParams(location.search);
  console.log("URL slug:", slug);
  console.log("Full URL:", location.pathname + location.search);
  
  // Get current page from URL or default to 1
  const currentPage = parseInt(queryParams.get('page')) || 1;
  // Get sort option from URL or default to position
  const sortBy = queryParams.get('sort_by') || 'position';
  const sortDirection = queryParams.get('sort_dir') || 'asc';
  
  console.log("Current page:", currentPage);
  console.log("Sort by:", sortBy);
  console.log("Sort direction:", sortDirection);
  
  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Hooks for category and product data
  const { 
    loadCategoryByUrlKey, 
    currentCategory, 
    loading: categoryLoading, 
    error: categoryError,
    getCategoryBreadcrumbs
  } = useCategory();
  
  const { 
    getProductsByCategory, 
    loading: productsLoading, 
    error: productsError,
    getProductFilters,
    filters
  } = useProduct();
  
  const [breadcrumbs, setBreadcrumbs] = useState([
    { name: 'Home', url: '/' }
  ]);
  
  // Memoize the fetchCategory function to prevent recreation on each render
  const fetchCategory = useCallback(async () => {
     
    if (!slug) {
      console.error("No slug provided");
      setLoadError("Categohbhhhbbhbry not found");
      setIsLoading(false);
      return;
    }
      
    try {
      setIsLoading(true);
      setLoadError(null);  
      const category = await loadCategoryByUrlKey(slug);
     
       console.log(category);
      if (category && category.category_id) {
        console.log("Category loaded:", category);
        // Load breadcrumbs
        try {
          const categoryPath = await getCategoryBreadcrumbs(category.category_id);
          console.log("Category breadcrumbs:", categoryPath);
          setBreadcrumbs([
            { name: 'Home', url: '/' },
            ...categoryPath
          ]);
        } catch (breadcrumbError) {
          console.error("Error fetching breadcrumbs:", breadcrumbError);
        }
        
        // Load filters
        try {
          console.log("Fetching filters for category ID:", category.category_id);
          await getProductFilters(category.category_id);
        } catch (filterError) {
          console.error("Error fetching filters:", filterError);
        }
        
        // Load products
        try {
          console.log("Fetching products for category ID:", category.category_id);
          
          // Build search criteria
          const searchCriteria = {
            'searchCriteria[pageSize]': pageSize,
            'searchCriteria[currentPage]': currentPage,
            'searchCriteria[sortOrders][0][field]': sortBy,
            'searchCriteria[sortOrders][0][direction]': sortDirection,
          };
          
          // Add filters to search criteria
          let filterGroupIndex = 1; // Start from 1 because 0 is for category_id
          
          Object.entries(appliedFilters).forEach(([attribute, values]) => {
            if (values && values.length > 0) {
              values.forEach((value, valueIndex) => {
                searchCriteria[`searchCriteria[filterGroups][${filterGroupIndex}][filters][${valueIndex}][field]`] = attribute;
                searchCriteria[`searchCriteria[filterGroups][${filterGroupIndex}][filters][${valueIndex}][value]`] = value;
                searchCriteria[`searchCriteria[filterGroups][${filterGroupIndex}][filters][${valueIndex}][conditionType]`] = 'eq';
              });
              filterGroupIndex++;
            }
          });
          
          const result = await getProductsByCategory(category.category_id, searchCriteria);
          console.log("Products loaded:", result);
          
          if (result && result.items) {
            setProducts(result.items);
            setTotalCount(result.total_count || 0);
          } else {
            console.error("Invalid product result:", result);
            setProducts([]);
            setTotalCount(0);
          }
        } catch (productError) {
          console.error("Error fetching products:", productError);
          setLoadError(productError.message || "Failed to load products");
          setProducts([]);
          setTotalCount(0);
        }
      } else {
        console.error("Category not found or has no ID");
        setLoadError("Category not found");
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setLoadError(error.message || "Failed to load category");
    } finally {
      setIsLoading(false);
    }
  }, [
    slug, 
    loadCategoryByUrlKey, 
    getCategoryBreadcrumbs, 
    getProductFilters,
    getProductsByCategory,
    pageSize,
    currentPage,
    sortBy,
    sortDirection,
    appliedFilters
  ]);
  
  // Load all data in a single useEffect to prevent multiple fetches
  useEffect(() => {
    // Only fetch on first render or when URL params change
    if (!initialRenderDone.current || location.key) {
      initialRenderDone.current = true;
      fetchCategory();
    }
  }, [fetchCategory, location.key]);
  
  // Handle page change
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', page);
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  // Handle sort change
  const handleSortChange = (field, direction) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('sort_by', field);
    newParams.set('sort_dir', direction);
    newParams.delete('page'); // Reset to first page when sorting changes
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  // Handle filter change
  const handleFilterChange = (attribute, values) => {
    setAppliedFilters(prev => ({
      ...prev,
      [attribute]: values
    }));
    
    // Reset to first page when filters change
    const newParams = new URLSearchParams(location.search);
    newParams.delete('page');
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  // Error state
  if (categoryError || productsError || loadError) {
    const errorMessage = categoryError?.message || productsError?.message || loadError || "An error occurred while loading products.";
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }
  
  // No category found
  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Category not found." />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      {/* <Breadcrumb items={breadcrumbs} /> */}
      
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{currentCategory.name}</h1>
        {currentCategory.description && (
          <div 
            className="text-gray-600"
            dangerouslySetInnerHTML={{ __html: currentCategory.description }}
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Sidebar */}
        <div className="w-full md:w-1/4">
          <ProductFilter 
            filters={filters || []} 
            appliedFilters={appliedFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {/* Product Listing */}
        <div className="w-full md:w-3/4">
          {/* Sorting and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-gray-600 mb-4 sm:mb-0">
              Showing {products.length} of {totalCount} products
            </p>
            
            <ProductSorting 
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          </div>
          
          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded-lg">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">            
                <ProductCard productsdata={products} />             
            </div>
          )}
          
          
          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="mt-8">
              <Pagination 
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryProductListing;
