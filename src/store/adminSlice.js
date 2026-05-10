import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, normalizeProduct, productToApi } from '../api/client.js';

export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { getState }) => {
  const response = await api.dashboard(getState().auth.token);
  return response.data;
});

export const fetchAdminProducts = createAsyncThunk('admin/fetchAdminProducts', async (query = {}, { getState }) => {
  const response = await api.adminProducts(getState().auth.token, query);
  return { items: response.data.map(normalizeProduct), meta: response.meta };
});

export const saveAdminProduct = createAsyncThunk('admin/saveAdminProduct', async (product, { getState, dispatch }) => {
  const token = getState().auth.token;
  if (product.id) {
    await api.patchProduct(token, product.id, productToApi(product));
  } else {
    await api.createProduct(token, productToApi(product));
  }
  return dispatch(fetchAdminProducts()).unwrap();
});

export const deleteAdminProduct = createAsyncThunk('admin/deleteAdminProduct', async (productId, { getState, dispatch }) => {
  await api.deleteProduct(getState().auth.token, productId);
  return dispatch(fetchAdminProducts()).unwrap();
});

export const fetchAdminOrders = createAsyncThunk('admin/fetchAdminOrders', async (query = {}, { getState }) => {
  const response = await api.adminOrders(getState().auth.token, query);
  return { items: response.data, meta: response.meta };
});

export const changeOrderStatus = createAsyncThunk('admin/changeOrderStatus', async ({ id, status }, { getState, dispatch }) => {
  await api.patchOrderStatus(getState().auth.token, id, { status });
  return dispatch(fetchAdminOrders()).unwrap();
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    dashboard: null,
    products: [],
    productMeta: null,
    orders: [],
    orderMeta: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    };
    builder
      .addCase(fetchDashboard.pending, pending)
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, rejected)
      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.items;
        state.productMeta = action.payload.meta;
      })
      .addCase(fetchAdminProducts.rejected, rejected)
      .addCase(fetchAdminOrders.pending, pending)
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.items;
        state.orderMeta = action.payload.meta;
      })
      .addCase(fetchAdminOrders.rejected, rejected);
  },
});

export default adminSlice.reducer;
