import { useState, useCallback, useRef } from "react";
import * as categoryApi from "../api/category";

/**
 * Custom hook for working with categories
 */
export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({
    items: [],
    total_count: 0,
  });
  const [productFilters, setProductFilters] = useState([]);

  // Use refs to store the latest state values without causing re-renders
  const stateRef = useRef({
    categories,
    categoryTree,
    loading,
    error,
    currentCategory,
    categoryProducts,
    productFilters,
  });

  // Update refs when state changes
  stateRef.current = {
    categories,
    categoryTree,
    loading,
    error,
    currentCategory,
    categoryProducts,
    productFilters,
  };

  /**
   * Load all categories
   */
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getAllCategories();
      const items = data.items || [];
      setCategories(items);
      return items;
    } catch (err) {
      setError(err.message || "Failed to load categories");
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to ensure stable reference

  /**
   * Load category tree
   * @param {number} rootCategoryId - Root category ID
   */
  const loadCategoryTree = useCallback(async (rootCategoryId = 2) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getCategoryTree(rootCategoryId);
      setCategoryTree(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to load category tree");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load category by ID
   * @param {number} categoryId - Category ID
   */
  const loadCategoryById = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getCategoryById(categoryId);
      setCurrentCategory(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load category ${categoryId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load category by URL key/slug
   * @param {string} urlKey - Category URL key or slug
   */
  const loadCategoryByUrlKey = useCallback(async (urlKey) => {
    setLoading(true);
    setError(null);  

    try {
      const data = await categoryApi.getCategoryByUrlKey(urlKey);      
      setCurrentCategory(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to load category ${urlKey}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load products for a category
   * @param {number|string} categoryIdentifier - Category ID or URL key
   * @param {Object} options - Search options
   */
  const loadCategoryProducts = useCallback(
    async (categoryIdentifier, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        let data;

        if (typeof categoryIdentifier === "number") {
          data = await categoryApi.getProductsByCategory(
            categoryIdentifier,
            options
          );
        } else {
          data = await categoryApi.getProductsByCategoryUrlKey(
            categoryIdentifier,
            options
          );
        }

        setCategoryProducts(data);
        return data;
      } catch (err) {
        setError(
          err.message ||
            `Failed to load products for category ${categoryIdentifier}`
        );
        return { items: [], total_count: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load child categories
   * @param {number} parentId - Parent category ID
   */
  const loadChildCategories = useCallback(async (parentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getChildCategories(parentId);
      return data.items || [];
    } catch (err) {
      setError(
        err.message || `Failed to load child categories for ${parentId}`
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load category filters
   * @param {number} categoryId - Category ID
   */
  const loadCategoryFilters = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getCategoryFilters(categoryId);
      setProductFilters(data);
      return data;
    } catch (err) {
      setError(
        err.message || `Failed to load filters for category ${categoryId}`
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load featured categories
   * @param {number} limit - Maximum number of categories
   */
  const loadFeaturedCategories = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.getFeaturedCategories(limit);
      return data.items || [];
    } catch (err) {
      setError(err.message || "Failed to load featured categories");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search categories
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum number of results
   */
  const searchCategoriesByName = useCallback(async (searchTerm, limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryApi.searchCategories(searchTerm, limit);
      return data.items || [];
    } catch (err) {
      setError(
        err.message || `Failed to search categories for "${searchTerm}"`
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get breadcrumbs for a category
   * @param {number} categoryId - Category ID
   */
  const getCategoryBreadcrumbs = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);

    try {
      const pathCategories = await categoryApi.getCategoryPath(categoryId);
      return pathCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        url: `/category/${cat.url_key || cat.id}`,
      }));
    } catch (err) {
      setError(
        err.message || `Failed to get breadcrumbs for category ${categoryId}`
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error utility function
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    categories,
    categoryTree,
    loading,
    error,
    currentCategory,
    categoryProducts,
    productFilters,

    // Methods
    loadCategories,
    loadCategoryTree,
    loadCategoryById,
    loadCategoryByUrlKey,
    loadCategoryProducts,
    loadChildCategories,
    loadCategoryFilters,
    loadFeaturedCategories,
    searchCategoriesByName,
    getCategoryBreadcrumbs,

    // Utilities
    clearError,
  };
};

// Also keep the default export for backward compatibility
export default useCategory;
