import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

const tokenFromStorage = localStorage.getItem('adminToken');

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (credentials) => {
  const response = await api.login(credentials);
  localStorage.setItem('adminToken', response.data.access_token);
  return response.data;
});

export const fetchCurrentAdmin = createAsyncThunk('auth/fetchCurrentAdmin', async (_, { getState }) => {
  const response = await api.me(getState().auth.token);
  return response.data;
});

export const logoutAdmin = createAsyncThunk('auth/logoutAdmin', async (_, { getState }) => {
  const token = getState().auth.token;
  if (token) await api.logout(token).catch(() => null);
  localStorage.removeItem('adminToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: tokenFromStorage,
    admin: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.admin = action.payload;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.token = null;
        state.admin = null;
      });
  },
});

export default authSlice.reducer;
