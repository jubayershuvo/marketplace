import { User, UserState } from "@/types/Profile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  isLoggedIn: false,
  token: "",
  refreshToken: "",
  user: {
   _id: '',
  firstName: '',
  lastName: '',
  displayName: '',
  companyName: '',
  username: '',
  email: '',
  userType: "guest",
  avatar: '',
  level: 0,
  phone: '',
  phoneCountry: '',
  isEmailVerified: false,
  isPhoneVerified: false,
  isBanned: false,
  isActive: false,
  loginAttempts: 0,
  createdAt: '',
  updatedAt: '',
  certifications: [],
  completedOrders: 0,
  earnings: 0,
  education: [],
  languages: [],
  lastLogin: '',
  lastSeen: '',
  lastLoginIp: '',
  location: '',
  memberSince: '',
  ordersCount: 0,
  pendingBalance: 0,
  pendingOrders: 0,
  responseTime: '',
  reviewsCount: 0,
  rating: 0,
  skills: [],
  spent: 0,
  // Added to satisfy User type
  password: '',
  balance: 0,
  // Dummy implementation to satisfy User type
  comparePassword: async (_candidatePassword: string) => false,
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userLogin: (
      state,
      action: PayloadAction<{
        user: User;
        token: string,
        refreshToken: string,
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isLoggedIn = true;
    },
    userLogout: () => ({ ...initialState }), // fresh state reset
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { userLogin, userLogout, updateUser } = userSlice.actions;
export default userSlice.reducer;
