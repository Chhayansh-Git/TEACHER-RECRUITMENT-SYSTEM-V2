// src/app/authSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the organization object
interface OrganizationInfo {
    _id: string;
    name: string;
}

// Define the shape of the user info we'll store
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string; // Add this property
  isPhoneVerified?: boolean; // Add this property
  profileCompleted: boolean;
  profilePictureUrl?: string;
  organization?: OrganizationInfo;
}

// Define the shape of our authentication state
interface AuthState {
  userInfo: UserInfo | null;
  token: string | null;
}

// Check localStorage for existing user info
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
    // Action to set credentials on login
    setCredentials(state, action: PayloadAction<{ userInfo: UserInfo; token: string }>) {
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token;
      // Store credentials in localStorage
      localStorage.setItem('userInfo', JSON.stringify(action.payload.userInfo));
      localStorage.setItem('token', action.payload.token);
    },
    // Action to clear credentials on logout
    logout(state) {
      state.userInfo = null;
      state.token = null;
      // Clear credentials from localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;