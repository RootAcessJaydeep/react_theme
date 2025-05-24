import React, { useState, useEffect } from "react";
import Herobanner from "../utils/Herobanner";
import CategoryCard from "../components/category/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import Featurebox from "../utils/Featurebox";
import { useCategory } from "../context/CategoryContext";
import Loader from "../utils/Loader";
import { Link } from "react-router-dom";
import CategoryPage from "./CategoryPage";

function HomePage() {
  const { 
    categories, 
    loading, 
    error, 
    initialized,
    loadCategories 
  } = useCategory();

  // Local loading state for initial render
  const [localLoading, setLocalLoading] = useState(!initialized);

  useEffect(() => {
    // If data is not initialized yet, load it
    if (!initialized) {
      const fetchData = async () => {
        setLocalLoading(true);
        await loadCategories();
        setLocalLoading(false);
      };
      
      fetchData();
    }
  }, [initialized, loadCategories]);

  // Use either the global loading state or local loading state
  const isLoading = loading || localLoading;

  const banners = [
    {
      title: "Summer Collection 2023",
      subtitle: "Up to 40% off on selected items.",
      buttonText: "Shop Now",
      buttonLink: "category.html",
      image: "https://source.unsplash.com/1600x600/?summer,fashion",
      bg: "bg-gradient-to-r from-indigo-500 to-purple-600",
    },    
  ];

  const productsdata = [
    {
      id: 1,
      name: "Smart Watch",
      description: "Fitness Tracker",
      image: "https://via.placeholder.com/300x200",
      rating: 5,
      reviews: 78,
      price: 149.99,
      link: "product.html",
    },    
  ];

  const features = [
    {
      icon: "fas fa-truck",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      icon: "fas fa-undo",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: "fas fa-shield-alt",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Secure Payment",
      description: "100% secure checkout",
    },
    {
      icon: "fas fa-headset",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "24/7 Support",
      description: "Dedicated support",
    },
  ];

  return (
    <>
      <Herobanner banners={banners} />

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Shop by Category
          </h2>
          
          {isLoading ? (
          <Loader />
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <CategoryCard CategoryCardinfo={categories} />
          )}
        </div>
      </section>
      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCard productsdata={productsdata} />
          </div>
          <div className="text-center mt-8">
            <Link
              to={'/categorypage'}
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Featurebox features={features} />
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
