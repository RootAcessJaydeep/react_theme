import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import Swal from "sweetalert2";

function Loginforms() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { fetchCartData, mergeWithUserCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      Swal.fire(
        "Invalid Email",
        "Please enter a valid email address.",
        "error"
      );
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      Swal.fire(
        "Weak Password",
        "Password must be at least 6 characters.",
        "error"
      );
      return;
    }

    try {
      clearError(); // Clear any previous errors
      const token = await login(email, password);
      console.log("token: " + token);

      if (token) {
        // Fetch the user's cart from the API
          const userCartData = await fetchCartData();
       
      // Merge any items that were in the guest cart
      if (userCartData && userCartData.items) {
        await mergeWithUserCart(userCartData.items);
      }
        Swal.fire(
          "Login Successful",
          "Redirecting to your account...",
          "success"
        ).then(() => {
          navigate("/account");
        });
      } else {
        setFormError("Invalid email or password.");
        Swal.fire("Login Failed", "Invalid email or password.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);

      let message = "Something went wrong. Please try again.";
      if (error.response && error.response.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      setFormError(message);
      Swal.fire("Error", message, "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-4 shadow-md rounded bg-white"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {formError && (
        <div className="mb-4 text-red-600 text-sm font-medium">{formError}</div>
      )}

      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}

export default Loginforms;
