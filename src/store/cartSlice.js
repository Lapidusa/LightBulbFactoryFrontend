import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      if (!product || product.stockQty <= 0) return;
      const current = state.items.find((item) => item.product.id === product.id);
      if (current) {
        current.quantity = Math.min(current.quantity + 1, product.stockQty);
      } else {
        state.items.push({ product, quantity: 1 });
      }
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const current = state.items.find((item) => item.product.id === productId);
      if (!current) return;
      current.quantity = Math.max(1, Math.min(Number(quantity) || 1, current.product.stockQty));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const selectCartItems = (state) =>
  state.cart.items.map((item) => ({
    ...item,
    productId: item.product.id,
    lineTotal: item.product.price * item.quantity,
  }));
export const selectCartTotal = (state) =>
  selectCartItems(state).reduce((sum, item) => sum + item.lineTotal, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
