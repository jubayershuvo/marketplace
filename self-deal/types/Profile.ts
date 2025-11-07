// profileTypes.ts
import { ObjectId } from "mongodb";

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
 // Common fields
   _id: string ;
   firstName: string;
   lastName: string;
   email: string;
   phone?: string;
   username: string;
   password: string;
   userType: "freelancer" | "client";
   avatar?: string;
   isEmailVerified: boolean;
   isPhoneVerified: boolean;
   isBanned: boolean;
   isActive: boolean;
   loginAttempts: number;
   lockUntil?: Date;
   lastLogin?: Date;
   lastLoginIp?: string;
   createdAt: Date;
   updatedAt: Date;
   location?: string;
   responseTime?: string;
   lastSeen?: Date;
 
   // Freelancer fields
   withdrawableBalance?: number;
   balance: number;
   pendingBalance?: number;
 
   pendingOrders?: number;
   displayName?: string;
   description?: string;
   skills?: string[];
   languages?: string[];
   education?: string[];
   certifications?: string[];
   rating?: number;
   completedOrders: number;
   earnings?: number;
   lastDelivery?: string;
   reviews?: string[];
   reviewsCount?: number;
 
   // Client fields
   companyName?: string;
   companyDescription?: string;
   spent?: number;
 
   comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserState {
  isLoggedIn: boolean;
  token: string;
  refreshToken: string;
  user: User;
}
