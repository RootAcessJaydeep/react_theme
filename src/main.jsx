import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./context/CategoryContext";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from './hooks/useCart';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ProductProvider>
        <CartProvider>
          <AuthProvider>
            <CategoryProvider>
              <AppRoutes />
            </CategoryProvider>
          </AuthProvider>
        </CartProvider>
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>
);
