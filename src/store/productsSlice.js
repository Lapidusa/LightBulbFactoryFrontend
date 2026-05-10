import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, normalizeCategory, normalizeProduct } from '../api/client.js';

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  const response = await api.listCategories();
  return response.data.map(normalizeCategory);
});

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (query = {}) => {
  const response = await api.listProducts(query);
  return {
    items: response.data.map(normalizeProduct),
    meta: response.meta || { page: 1, page_size: response.data.length, total: response.data.length },
  };
});

export const fetchProduct = createAsyncThunk('products/fetchProduct', async (id) => {
  const response = await api.getProduct(id);
  return normalizeProduct(response.data);
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    selected: null,
    meta: { page: 1, page_size: 12, total: 0 },
    status: 'idle',
    categoriesStatus: 'idle',
    selectedStatus: 'idle',
    error: null,
  },
  reducers: {
    clearSelectedProduct(state) {
      state.selected = null;
      state.selectedStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.selectedStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
