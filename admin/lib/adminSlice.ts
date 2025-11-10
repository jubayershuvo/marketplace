import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAdminLoggedIn: false,
  refreshToken: "",
  accessToken: "",
  admin: {
    _id: "",
    name: "",
    email: "",
    password: "",
    role: "",
    createdAt: "",
    updatedAt: "",
    lockUntil: "",
    loginAttempts: 0,
    lastLogin: "",
    lastLoginIp: "",
  },
  customers: [],
};
const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {
    adminLogin: (state, action) => {
      state.isAdminLoggedIn = true;
      state.admin = action.payload.admin;
      state.refreshToken = action.payload.refreshToken;
      state.accessToken = action.payload.token;
    },
    adminUpdate: (state, action) => {
      state.admin = action.payload;

    },
    adminLogout: (state) => {
      state.isAdminLoggedIn = false;
      state.admin = initialState.admin;
      state.refreshToken = "";
      state.accessToken = "";
    },
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
  },
});
export const { adminLogin, adminLogout, setCustomers, adminUpdate } = adminSlice.actions;
export default adminSlice.reducer;
