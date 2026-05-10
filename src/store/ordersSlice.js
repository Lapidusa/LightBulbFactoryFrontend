import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client.js';
import { clearCart } from './cartSlice.js';

export const createOrder = createAsyncThunk('orders/createOrder', async ({ customer, items }, { dispatch }) => {
  const response = await api.createOrder({
    customer_name: customer.name,
    customer_phone: `+${customer.phone.replace(/\D/g, '')}`,
    customer_email: customer.email,
    city: customer.city,
    address: customer.address,
    delivery_type: customer.deliveryType,
    payment_type: customer.paymentType === 'on_receipt' ? 'cash_on_delivery' : customer.paymentType,
    comment: customer.comment,
    items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
  });
  dispatch(clearCart());
  return response.data;
});

export const fetchOrder = createAsyncThunk('orders/fetchOrder', async (orderNumber) => {
  const response = await api.getOrder(orderNumber);
  return response.data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    lastOrder: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.lastOrder = action.payload;
      });
  },
});

export default ordersSlice.reducer;
