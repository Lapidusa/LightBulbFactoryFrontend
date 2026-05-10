import React, { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Factory, LayoutDashboard, ShoppingCart, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import AuthModal from './components/AuthModal.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { selectCartCount } from './store/cartSlice.js';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function Header({ onAuthOpen }) {
  const itemsCount = useSelector(selectCartCount);
  const token = useSelector((state) => state.auth.token);
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
        {token && (
          <NavLink to="/admin" className="cart-link">
            <LayoutDashboard size={18} />
            <span>Админка</span>
          </NavLink>
        )}
        <button type="button" className="login-button" onClick={onAuthOpen}>
          <User size={18} />
          <span>{token ? 'Профиль' : 'Войти'}</span>
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
          <Route path="/admin" element={<ProtectedAdmin><AdminPage /></ProtectedAdmin>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function ProtectedAdmin({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return <AppRoutes />;
}
