import React, { useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Factory, ShoppingCart, User } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function Header({ onAuthOpen }) {
  const { itemsCount } = useCart();
  const location = useLocation();

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <Factory size={24} />
        <span>Завод лампочек</span>
      </Link>
      <nav className="main-nav" aria-label="Основная навигация">
        <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className="cart-link">
          <ShoppingCart size={18} />
          <span>Корзина</span>
          {itemsCount > 0 && <b>{itemsCount}</b>}
        </NavLink>
        <button type="button" className="login-button" onClick={onAuthOpen}>
          <User size={18} />
          <span>Войти</span>
        </button>
      </nav>
    </header>
  );
}

function AppRoutes() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header onAuthOpen={() => setAuthOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
