import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import AccountPage from "../pages/AccountPage";
import "../styles/App.css";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Page404 from "../Page404";
import { isAuthenticated } from "../api/auth";
import ProductDetailPage from "../pages/ProductDetailPage";
import FeaturedProducts from "../pages/FeaturedProducts";
// import ProductDetailPage from "../pages/ProductDetailPage";
import CategoryProductListing from "../pages/CategoryProductListing";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Dashboard from '../components/account/Dashboard';
import Orders from '../components/account/Orders';
import OrderDetail from '../components/account/OrderDetail';

// Placeholder components for account sections
// These should be replaced with actual component imports when created
const AccountAddresses = () => <div className="p-6 text-lg">My Addresses Page Content - Placeholder</div>;
const AccountEdit = () => <div className="p-6 text-lg">Account Information Edit Page Content - Placeholder</div>;
const AccountWishlist = () => <div className="p-6 text-lg">My Wishlist Page Content - Placeholder</div>;
const AccountReviews = () => <div className="p-6 text-lg">My Reviews Page Content - Placeholder</div>;
const AccountNewsletter = () => <div className="p-6 text-lg">Newsletter Subscriptions Page Content - Placeholder</div>;
const AccountChangePassword = () => <div className="p-6 text-lg">Change Password Page Content - Placeholder</div>;

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categorypage" element={<FeaturedProducts />} />
        <Route path="/category">
          <Route path=":slug" element={<CategoryProductListing />} />
        </Route>
        <Route path="/product">
          <Route path=":urlKey" element={<ProductDetailPage />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
         <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders">
            <Route index element={<Orders />} />
            <Route path=":orderId" element={<OrderDetail />} />
          </Route>
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="edit" element={<AccountEdit />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="reviews" element={<AccountReviews />} />
          <Route path="newsletter" element={<AccountNewsletter />} />
          <Route path="change-password" element={<AccountChangePassword />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Routes>
      <Footer />
    </>
  );
}

export default AppRoutes;
