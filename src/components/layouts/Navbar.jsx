import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCategory } from "../../context/CategoryContext";
import Loader from "../../utils/Loader";

function Navbar() {
  const [transformedCategories, setTransformedCategories] = useState([]);
  const { 
    categoryTree, 
    loading, 
    error, 
    initialized,
    loadCategoryTree 
  } = useCategory();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeLevels, setActiveLevels] = useState({});
  const navRef = useRef(null);
  // Transform categories into the required structure
  function transformCategories(categories, level = 1) {
    if (!categories) return [];
    
    return categories.map((category) => {
      const transformed = {
        id: category.id,
        name: category.name,
        slug: category.url_key,
      };
      const children = category.children_data;
      if (children && children.length > 0) {
        const childKey = getChildKey(level);
        transformed[childKey] = transformCategories(children, level + 1);
      }
      return transformed;
    });
  }
  function getChildKey(level) {
    if (level === 1) return "subcategories";
    if (level === 2) return "children";
    return "sub" + "sub".repeat(level - 3) + "children";
  }
  useEffect(() => {
    // If category tree is not loaded yet, load it
    if (!initialized) {
      loadCategoryTree();
    }
  }, [initialized, loadCategoryTree]);

  // Transform category tree when it changes
  useEffect(() => {
    if (categoryTree && categoryTree.children_data) {
      const transformed = transformCategories(categoryTree.children_data);
      setTransformedCategories(transformed);
    }
  }, [categoryTree]);

  // Get children based on level
  const getChildren = (item, level) => {
    if (level === 1) return item.subcategories || [];
    if (level === 2) return item.children || [];
    if (level === 3) return item.subchildren || [];
    if (level === 4) return item.subsubchildren || [];
    return [];
  };

  // Check if item has children based on level
  const hasChildren = (item, level) => {
    const children = getChildren(item, level);
    return children && children.length > 0;
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveLevels({});
        if (window.innerWidth < 768) {
          setMobileMenuOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Desktop handlers
  const handleMouseEnter = (level, id) => {
    if (window.innerWidth >= 768) {
      setActiveLevels((prev) => ({
        ...prev,
        [level]: id,
      }));
    }
  };

  const handleMouseLeave = (level) => {
    if (window.innerWidth >= 768) {
      setActiveLevels((prev) => {
        const newLevels = { ...prev };
        Object.keys(newLevels)
          .filter((key) => parseInt(key) >= level)
          .forEach((key) => delete newLevels[key]);
        return newLevels;
      });
    }
  };

  // Mobile handlers
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setExpandedCategories({});
  };

  const toggleCategory = (id, level) => {
    setExpandedCategories((prev) => {
      const newExpanded = { ...prev };

      // If this category is already expanded, collapse it
      if (newExpanded[`${level}-${id}`]) {
        delete newExpanded[`${level}-${id}`];

        // Also collapse all child categories
        Object.keys(newExpanded).forEach((key) => {
          if (key.startsWith(`${level + 1}-`)) {
            delete newExpanded[key];
          }
        });
      } else {
        // Expand this category
        newExpanded[`${level}-${id}`] = true;

        // Collapse sibling categories at the same level
        Object.keys(newExpanded).forEach((key) => {
          if (key.startsWith(`${level}-`) && key !== `${level}-${id}`) {
            delete newExpanded[key];
          }
        });
      }

      return newExpanded;
    });
  };

  // Desktop menu renderer
  const renderDesktopMenu = (items, level = 1, parentSlug = "") => {
    return (
      <ul className={`bg-white shadow-lg rounded-md py-2 px-3 min-w-[160px]`}>
        {items.map((item) => {
          const hasChild = hasChildren(item, level);
          const slugPath = `${item.slug}`;
          return (
            <li
              key={item.id}
              className="group relative"
              onMouseEnter={() => handleMouseEnter(level, item.id)}
              onMouseLeave={() => handleMouseLeave(level)}
            >
              <Link
                to={`/category/${slugPath}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 rounded-md"
              >
                {item.name}
                {hasChild && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-indigo-500">
                    ▶
                  </span>
                )}
              </Link>

              {/* Submenu */}
              {hasChild && activeLevels[level] === item.id && (
                <div className="absolute top-0 left-full ml-1 z-50">
                  {renderDesktopMenu(
                    getChildren(item, level),
                    level + 1,
                    slugPath
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Mobile menu renderer
  const renderMobileMenu = (items, level = 1, parentSlug = "") => {
    return (
      <ul
        className={`pl-${level * 4} ${
          level > 1 ? "border-l border-gray-200" : ""
        }`}
      >
        {items.map((item) => {
          const itemSlug = parentSlug
            ? `${parentSlug}/${item.slug || item.id}`
            : item.slug || item.id;

          const children = getChildren(item, level);
          const hasChildItems = hasChildren(item, level);
          const isExpanded = expandedCategories[`${level}-${item.id}`];

          return (
            <li key={item.id} className="py-1">
              <div className="flex items-center justify-between">
                <Link
                  to={`/category/${itemSlug}`}
                  className="block py-2 text-sm"
                  onClick={(e) => {
                    if (hasChildItems) {
                      e.preventDefault();
                      toggleCategory(item.id, level);
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                >
                  {item.name}
                </Link>
                {hasChildItems && (
                  <button
                    className="p-2 text-gray-500 focus:outline-none"
                    onClick={() => toggleCategory(item.id, level)}
                  >
                    {isExpanded ? "−" : "+"}
                  </button>
                )}
              </div>

              {hasChildItems && isExpanded && (
                <div className="ml-4 mt-1 mb-2">
                  {renderMobileMenu(children, level + 1, itemSlug)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <nav className="bg-gray-100 py-3" ref={navRef}>
      <div className="container mx-auto px-4">
        {/* Mobile menu button */}
        <div className="md:hidden flex justify-between items-center">
          <button
            className="text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <span className="font-semibold">Categories</span>
          <div className="w-6"></div> {/* Empty div for flex spacing */}
        </div>

        {/* Loading state */}
        {loading && (
         <Loader />
        )}

        {/* Error state */}
        {error && <div className="text-center py-4 text-red-600">{error}</div>}

        {/* Mobile menu */}
        {!loading && !error && mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
            {renderMobileMenu(transformedCategories, 1)}
          </div>
        )}

        {/* Desktop menu */}
        {!loading && !error && (
          <ul className="hidden md:flex justify-center space-x-8">
            {transformedCategories.map((cat) => (
              <li
                key={cat.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(1, cat.id)}
                onMouseLeave={() => handleMouseLeave(2)}
              >
                <Link
                  to={`/category/${cat.slug || cat.id}`}
                  className="hover:text-indigo-600 font-semibold"
                >
                  {cat.name}
                </Link>

                {hasChildren(cat, 1) && activeLevels[1] === cat.id && (
                  <div className="absolute top-full left-0 z-50">
                    {renderDesktopMenu(
                      cat.subcategories,
                      2,
                      cat.slug || cat.id
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
