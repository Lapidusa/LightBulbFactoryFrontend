import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice.js';
import cartReducer from './cartSlice.js';
import ordersReducer from './ordersSlice.js';
import authReducer from './authSlice.js';
import adminReducer from './adminSlice.js';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    auth: authReducer,
    admin: adminReducer,
  },
});
