import React, { createContext, useContext, useMemo, useState } from 'react';
import { products } from '../data/products.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  const addToCart = (product, quantity = 1) => {
    if (product.stockQty <= 0) return;
    setCart((items) => {
      const current = items.find((item) => item.productId === product.id);
      if (current) {
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQty) }
            : item,
        );
      }
      return [...items, { productId: product.id, quantity: Math.min(quantity, product.stockQty) }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((item) => item.id === productId);
    const nextQuantity = Math.max(1, Math.min(Number(quantity) || 1, product?.stockQty || 1));
    setCart((items) =>
      items.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item)),
    );
  };

  const removeFromCart = (productId) => {
    setCart((items) => items.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...item, product, lineTotal: product.price * item.quantity } : null;
        })
        .filter(Boolean),
    [cart],
  );

  const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = (customer) => {
    const order = {
      orderNumber: `LBF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      customer,
      items: cartItems,
      total,
      status: 'created',
      createdAt: new Date().toISOString(),
    };
    setLastOrder(order);
    clearCart();
    return order;
  };

  const value = {
    cartItems,
    itemsCount,
    total,
    lastOrder,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    createOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
