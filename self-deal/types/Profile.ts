// profileTypes.ts

export interface Stats {
  completed: number;
  pending: number;
  canceled: number;
  gigs: number;
  responseTime: string;
  memberSince: string;
}

export interface Profile {
  name: string;
  title: string;
  img: string;
  location: string;
  rating: number;
  reviews: number;
  bio: string;
  skills: string[];
  stats: Stats;
}

export interface Gig {
  id: number;
  title: string;
  price: number; // BDT
  img: string;
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
  profile: Profile;
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
  lastLoginIp: string;
  portfolio: string[];
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