// src/app/authSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted: boolean; // Add this property
  profilePictureUrl?: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  token: string | null;
}

const storedUserInfo = localStorage.getItem('userInfo');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
  token: storedToken ? storedToken : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ userInfo: UserInfo; token: string }>) {
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token;
      localStorage.setItem('userInfo', JSON.stringify(action.payload.userInfo));
      localStorage.setItem('token', action.payload.token);
    },
    logout(state) {
      state.userInfo = null;
      state.token = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;