// profileTypes.ts

export interface Stats {
  completed: number;
  pending: number;
  canceled: number;
  gigs: number;
  responseTime: string;
  memberSince: string;
}

export interface Gig {
  _id: string;
  title: string;
  price: number; // BDT
  images: string[];
  freelancer: User;
  
}

export interface PortfolioItem {
  id: number;
  title: string;
  img: string;
}

export interface Review {
  id: number;
  client: string;
  img: string;
  rating: number; // 1–5 stars
  text: string;
}

export interface ProfileData {
  profile: User;
  gigs: Gig[];
  portfolio: PortfolioItem[];
  reviews: Review[];
}
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  companyName: string;
  username: string;
  email: string;
  userType: "guest" | "client" | "freelancer";
  avatar: string;
  level: string;
  phone: string;
  phoneCountry: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  loginAttempts: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  certifications: string[];
  completedOrders: number;
  earnings: number;
  education: string[];
  languages: string[];
  lastLogin: string;
  lastSeen: string;
  lastLoginIp: string;
  location: string;
  memberSince: string;
  ordersCount: number;
  pendingBalance: number;
  pendingOrders: number;
  responseTime: string;
  reviewsCount: number;
  rating: number;
  skills: string[];
  spent: number;
}

export interface UserState {
  isLoggedIn: boolean;
  token: string;
  refreshToken: string;
  user: User;
}
