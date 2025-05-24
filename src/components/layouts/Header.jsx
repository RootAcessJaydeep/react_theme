import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { isAuthenticated } from "../../api/auth";
import { useCart } from "../../hooks/useCart";

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
  const { getCartItemCount } = useCart();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        {/* Top bar - hide on small screens */}
        <div className="bg-indigo-600 text-white py-2 hidden sm:block">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="text-sm">Free shipping on orders over $50</p>
            <div className="flex space-x-4">
              <Link to="/contact" className="text-sm hover:underline">
                Contact
              </Link>
              <Link to="/help" className="text-sm hover:underline">
                Help
              </Link>
              <Link to="/track-order" className="text-sm hover:underline">
                Track Order
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              EcoShop
            </Link>

            {/* Desktop Search and Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
              </div>
              <Link to={isAuthenticated?"/account":"/login"} className="p-2 hover:text-indigo-600">
                <i className="fas fa-user"></i>
              </Link>
              <Link to="/wishlist" className="p-2 hover:text-indigo-600">
                <i className="fas fa-heart"></i>
              </Link>
             <Link to="/cart" className="p-2 hover:text-indigo-600 relative">
              <i className="fas fa-shopping-cart"></i>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {getCartItemCount()}
                </span>
              )}
            </Link>
            </div>

            {/* Mobile Icons */}
            <div className="flex md:hidden items-center space-x-3">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:text-indigo-600"
              >
                <i className="fas fa-search"></i>
              </button>
              <Link to="/login" className="p-2 hover:text-indigo-600">
                <i className="fas fa-user"></i>
              </Link>
              <Link to="/wishlist" className="p-2 hover:text-indigo-600">
                <i className="fas fa-heart"></i>
              </Link>
                <Link to="/cart" className="p-2 hover:text-indigo-600 relative">
                <i className="fas fa-shopping-cart"></i>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search - Expandable */}
          {searchOpen && (
            <div className="mt-4 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  autoFocus
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                <button 
                  className="absolute right-3 top-2.5 text-gray-400"
                  onClick={() => setSearchOpen(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <Navbar />
      </header>
    </>
  );
}

export default Header;
