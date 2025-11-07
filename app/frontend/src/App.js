import React from 'react';
// Променено от "@/App.css" на относителния път "./App.css"
import "./App.css"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Всички импорти са коригирани да използват относителни пътища (../ или ./),
// тъй като всички тези файлове са в src/ или поддиректории на src/
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import ChatWidget from './components/ChatWidget';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<OrdersPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <ChatWidget />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
