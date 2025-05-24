import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useCategory from '../hooks/useCategory';

function CategoryPage() {
  const { slug } = useParams();
  const {
    loading,
    error,
    currentCategory,
    categoryProducts,
    loadCategoryByUrlKey,
    loadCategoryProducts,
    getCategoryBreadcrumbs
  } = useCategory();
  
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [sortOption, setSortOption] = useState('position');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      
      try {
        // Load category details
        const category = await loadCategoryByUrlKey(slug);
        
        if (category) {
          // Load products for this category
          await loadCategoryProducts(slug, {
            pageSize,
            currentPage,
            sortField: sortOption,
            sortDirection: 'ASC'
          });
          
          // Get breadcrumbs
          const breadcrumbData = await getCategoryBreadcrumbs(category.id);
          setBreadcrumbs(breadcrumbData);
          
          // Get child categories if any
          if (category.children_data) {
            setChildCategories(category.children_data);
          }
        }
      } catch (err) {
        console.error('Error loading category data:', err);
      }
    };
    
    fetchCategoryData();
  }, [slug, currentPage, sortOption, loadCategoryByUrlKey, loadCategoryProducts, getCategoryBreadcrumbs, pageSize]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading && !currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && !currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <p className="mt-2">
            <Link to="/" className="text-indigo-600 hover:underline">
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Category not found.</p>
          <p className="mt-2">
            <Link to="/" className="text-indigo-600 hover:underline">
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil((categoryProducts.total_count || 0) / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex flex-wrap text-sm">
          <li className="flex items-center">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.id} className="flex items-center">
              {index === breadcrumbs.length - 1 ? (
                <span className="text-indigo-600">{crumb.name}</span>
              ) : (
                <>
                  <Link to={crumb.url} className="text-gray-600 hover:text-indigo-600">
                    {crumb.name}
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{currentCategory.name}</h1>
        {currentCategory.description && (
          <div 
            className="text-gray-600 mb-4"
            dangerouslySetInnerHTML={{ __html: currentCategory.description }}
          />
        )}
      </div>

      {/* Child Categories (if any) */}
      {childCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {childCategories.map(child => (
              <Link 
                key={child.id}
                to={`/category/${child.url_key || child.id}`}
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center transition"
              >
                <div className="font-medium">{child.name}</div>
                {child.product_count && (
                  <div className="text-sm text-gray-600 mt-1">
                    {child.product_count} products
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-600">
            Showing {categoryProducts.items?.length || 0} of {categoryProducts.total_count || 0} products
          </p>
        </div>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
          <select
            id="sort"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="position">Position</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="created_at">Newest</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading && currentCategory ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : categoryProducts.items?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.items.map(product => (
            <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <Link to={`/product/${product.url_key || product.id}`}>
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.media_gallery_entries && product.media_gallery_entries[0] ? (
                    <img
                      src={`${process.env.REACT_APP_MAGENTO_MEDIA_URL || '/media/catalog/product'}${product.media_gallery_entries[0].file}`}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-indigo-600 font-bold">
                    ${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 text-center rounded-lg">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Show limited page numbers with ellipsis
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === currentPage - 2 && currentPage > 3) ||
                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} className="mx-1">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;