import { User, UserState } from "@/types/Profile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  isLoggedIn: false,
  token: "",
  refreshToken: "",
  user: {
    _id: "",
    firstName: "",
    companyName: "",
    lastName: "",
    displayName: "",
    username: "",
    email: "",
    userType: "guest",
    avatar: "",
    level: "",
    isEmailVerified: false,
    isPhoneVerified: false,
    isBanned: false,
    isActive: true,
    loginAttempts: 0,
    createdAt: "",
    updatedAt: "",
    __v: 1,
    certifications: [],
    completedOrders: 0,
    earnings: 0,
    education: [],
    languages: [],
    lastLogin: "",
    lastLoginIp: "",
    portfolio: [],
    rating: 0,
    skills: [],
    spent: 0,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userLogin: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
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
