import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, normalizeProduct, productToApi } from '../api/client.js';

const queryKey = (query) => JSON.stringify(query);

export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { getState }) => {
    const response = await api.dashboard(getState().auth.token);
    return response.data;
  },
  {
    condition: (_, { getState }) => getState().admin.dashboardStatus !== 'loading',
  },
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (query = {}, { getState }) => {
    const response = await api.adminProducts(getState().auth.token, query);
    return { items: response.data.map(normalizeProduct), meta: response.meta };
  },
  {
    condition: (query = {}, { getState }) => {
      const admin = getState().admin;
      return admin.productsStatus !== 'loading' || admin.pendingProductsQueryKey !== queryKey(query);
    },
  },
);

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

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (query = {}, { getState }) => {
    const response = await api.adminOrders(getState().auth.token, query);
    return { items: response.data, meta: response.meta };
  },
  {
    condition: (query = {}, { getState }) => {
      const admin = getState().admin;
      return admin.ordersStatus !== 'loading' || admin.pendingOrdersQueryKey !== queryKey(query);
    },
  },
);

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
    dashboardStatus: 'idle',
    productsStatus: 'idle',
    pendingProductsQueryKey: null,
    ordersStatus: 'idle',
    pendingOrdersQueryKey: null,
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
      .addCase(fetchDashboard.pending, (state) => {
        pending(state);
        state.dashboardStatus = 'loading';
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboardStatus = 'succeeded';
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        rejected(state, action);
        state.dashboardStatus = 'failed';
      })
      .addCase(fetchAdminProducts.pending, (state, action) => {
        pending(state);
        state.productsStatus = 'loading';
        state.pendingProductsQueryKey = queryKey(action.meta.arg || {});
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.productsStatus = 'succeeded';
        state.pendingProductsQueryKey = null;
        state.products = action.payload.items;
        state.productMeta = action.payload.meta;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        rejected(state, action);
        state.productsStatus = 'failed';
        state.pendingProductsQueryKey = null;
      })
      .addCase(fetchAdminOrders.pending, (state, action) => {
        pending(state);
        state.ordersStatus = 'loading';
        state.pendingOrdersQueryKey = queryKey(action.meta.arg || {});
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ordersStatus = 'succeeded';
        state.pendingOrdersQueryKey = null;
        state.orders = action.payload.items;
        state.orderMeta = action.payload.meta;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        rejected(state, action);
        state.ordersStatus = 'failed';
        state.pendingOrdersQueryKey = null;
      });
  },
});

export default adminSlice.reducer;
