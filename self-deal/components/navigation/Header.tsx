"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  Bell,
  MessageSquare,
  Plus,
  Star,
  User,
  Settings,
  LogOut,
  Globe,
  Briefcase,
  LucideIcon,
  DollarSign,
  Package,
  Wallet,
} from "lucide-react";
import ThemeToggle from "../ThemeMod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateUser, userLogout } from "@/lib/userSlice";
import { useRouter } from "next/navigation";
import axios from "axios";

// TypeScript Interfaces
interface NavItem {
  label: string;
  href: string;
  isPrimary?: boolean;
  isAction?: boolean;
  action?: string;
}

interface UserNavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  isNotification?: boolean;
  userTypes: ("freelancer" | "client")[];
}

interface UserMenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  isAction?: boolean;
  action?: string;
  userTypes: ("freelancer" | "client")[];
}

interface MobileItem {
  label: string;
  href?: string;
  isPrimary?: boolean;
  isAction?: boolean;
  userTypes: ("freelancer" | "client")[];
}

interface User {
  level: string;
  rating: number;
  userType: "guest" | "freelancer" | "client";
  avatar: string;
  firstName: string;
}

interface Notification {
  _id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  href?: string;
}

// Enhanced Navigation Configuration
const navData: {
  guestNavItems: NavItem[];
  userNavItems: UserNavItem[];
  userMenuItems: UserMenuItem[];
  mobileGuestItems: NavItem[];
  mobileUserItems: MobileItem[];
} = {
  // Guest Navigation (not logged in)
  guestNavItems: [
    { label: "Become a Seller", href: "/signup" },
    { label: "Sign in", href: "/login" },
    { label: "Join", href: "/signup" },
  ],

  // User Navigation Items (Desktop Icons) - NO HARDCODED COUNTS
  userNavItems: [
    // Freelancer-specific items
    {
      icon: Plus,
      label: "Create Gig",
      href: "/new/gig",
      userTypes: ["freelancer"],
    },
    {
      icon: Wallet,
      label: "Earnings",
      href: "/wallet",
      userTypes: ["freelancer"],
    },

    // Common items for both user types
    {
      icon: Package,
      label: "Orders",
      href: "/orders",
      userTypes: ["freelancer", "client"],
    },
    {
      icon: Bell,
      label: "Notifications",
      isNotification: true,
      userTypes: ["freelancer", "client"],
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/inbox",
      userTypes: ["freelancer", "client"],
    },
  ],

  // User Menu Items (Dropdown Menu)
  userMenuItems: [
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      userTypes: ["freelancer", "client"],
    },
    {
      icon: Briefcase,
      label: "Gigs",
      href: "/manage-gigs",
      userTypes: ["freelancer"],
    },
    {
      icon: DollarSign,
      label: "Earnings",
      href: "/wallet",
      userTypes: ["freelancer"],
    },
    {
      icon: Package,
      label: "Orders",
      href: "/orders",
      userTypes: ["client", "freelancer"],
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      userTypes: ["freelancer", "client"],
    },
    {
      icon: LogOut,
      label: "Logout",
      isAction: true,
      action: "logout",
      userTypes: ["freelancer", "client"],
    },
  ],

  // Mobile Guest Items
  mobileGuestItems: [
    { label: "Join WorkHub", href: "/signup", isPrimary: true },
    { label: "Sign In", href: "/login" },
    { label: "Become a Seller", href: "/signup" },
  ],

  // Mobile User Items
  mobileUserItems: [
    {
      label: "Create New Gig",
      href: "/new/gig",
      userTypes: ["freelancer"],
    },
    {
      label: "My Gigs",
      href: "/manage-gigs",
      userTypes: ["freelancer"],
    },
    {
      label: "Earnings",
      href: "/wallet",
      userTypes: ["freelancer"],
    },
    {
      label: "My Orders",
      href: "/orders",
      userTypes: ["client", "freelancer"],
    },
    {
      label: "Messages",
      href: "/inbox",
      userTypes: ["freelancer", "client"],
    },
    {
      label: "Notifications",
      // isAction: true,
      userTypes: ["freelancer", "client"],
      href:"/notifications"
    },
  ],
};

// Helper function to filter items by user type
const filterByUserType = <T extends { userTypes: ("freelancer" | "client")[] }>(
  items: T[],
  userType: "freelancer" | "client"
): T[] => {
  return items.filter((item) => item.userTypes.includes(userType));
};

// Reusable Components
interface NavItemProps {
  item: NavItem;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, onClick }) => {
  const baseClasses =
    "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors";
  const primaryClasses =
    "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors";

  if (item.isAction && onClick) {
    return (
      <button onClick={onClick} className={baseClasses} type="button">
        {item.label}
      </button>
    );
  }

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      className={item.isPrimary ? primaryClasses : baseClasses}
    >
      <div className={item.isPrimary ? primaryClasses : baseClasses}>
        {item.label}
      </div>
    </Link>
  );
};

interface IconButtonProps {
  item: UserNavItem;
  onClick?: () => void;
  showNotifications?: boolean;
  notifications?: Notification[];
  unReadCount: number;
  unreadedMessagesCount: number;
  ordersCount: number;
  toggleNotifications: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({
  item,
  onClick,
  showNotifications = false,
  notifications = [],
  unReadCount,
  unreadedMessagesCount,
  ordersCount,
  toggleNotifications,
}) => {
  const Icon = item.icon;
  const router = useRouter();

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Determine which count to show based on item label
  const getItemCount = (): number => {
    if (item.label === "Messages") {
      return unreadedMessagesCount;
    }
    if (item.label === "Orders") {
      return ordersCount;
    }
    if (item.label === "Notifications") {
      return unReadCount;
    }
    return 0;
  };

  const itemCount = getItemCount();

  if (item.isNotification) {
    return (
      <div className="relative notification-menu">
        <button
          onClick={onClick}
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          type="button"
          aria-label={item.label}
        >
          <Icon size={20} />
          {unReadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unReadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 border-l-green-500 cursor-pointer"
                    onClick={() => {
                      router.push(notif.href || "/");
                      toggleNotifications();
                    }}
                  >
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!item.href) return null;

  return (
    <Link href={item.href}>
      <div
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        aria-label={item.label}
      >
        <Icon size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
    </Link>
  );
};

// User Type Badge Component
const UserTypeBadge: React.FC<{ userType: "freelancer" | "client" }> = ({
  userType,
}) => {
  const badgeStyles = {
    freelancer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    client:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  const badgeLabels = {
    freelancer: "Seller",
    client: "Buyer",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${badgeStyles[userType]}`}
    >
      {badgeLabels[userType]}
    </span>
  );
};

// Main Header Component
const FiverrHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get user state from Redux
  const { isLoggedIn, user } = useAppSelector((state) => state.userAuth);

  // State for API counts
  const [mockNotifications, setMockNotifications] = useState<Notification[]>();
  const [unReadCount, setUnReadCount] = useState<number>(0);
  const [unreadedMessagesCount, setUnreadedMessagesCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user profile and counts
  useEffect(() => {
    async function fetchData() {
      if (isLoggedIn && user._id) {
        try {
          const response = await axios.get(`/api/get-profile`, {
            withCredentials: true,
          });
          dispatch(updateUser(response.data.user));
          
          // Set all counts from API
          setUnreadedMessagesCount(response.data.unreadedMessagesCount || 0);
          setOrdersCount(response.data.ordersCount || 0);
          
          if (user.isEmailVerified === false) {
            router.push(`/verify-email?email=${user.email}`);
          } else if (!user.displayName && !user.companyName) {
            router.push(`/complete-profile`);
          }
        } catch (error: unknown) {
          if (
            typeof error === "object" &&
            error !== null &&
            "response" in error
          ) {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 401) {
              handleLogout();
            }
          } else if (error instanceof Error) {
            console.error("Error fetching profile:", error.message);
          } else if (typeof error === "object" && error !== null) {
            console.error(
              "Error fetching profile:",
              JSON.stringify(error)
            );
          } else {
            console.error("Error fetching profile:", String(error));
          }
        }
      }
    }

    fetchData();
  }, [isLoggedIn]);

  // Fetch notifications
  useEffect(() => {
    if (isLoggedIn) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(`/api/notifications`, {
            withCredentials: true,
          });
          setMockNotifications(response.data.notifications);
          setUnReadCount(response.data.unreadCount || 0);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // Determine user type based on login state and user data
  const getUserType = (): "guest" | "freelancer" | "client" => {
    if (!isLoggedIn || !user) {
      return "guest";
    }
    if (user.userType === "freelancer") {
      return "freelancer";
    }
    return "client";
  };

  const userType = getUserType();
  const isGuest = userType === "guest";

  // Filter navigation items based on user type
  const filteredUserNavItems = !isGuest
    ? filterByUserType(navData.userNavItems, userType)
    : [];
  const filteredUserMenuItems = !isGuest
    ? filterByUserType(navData.userMenuItems, userType)
    : [];
  const filteredMobileUserItems = !isGuest
    ? filterByUserType(navData.mobileUserItems, userType)
    : [];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (
        !target.closest(".user-menu") &&
        !target.closest(".notification-menu")
      ) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
      if (isMobileMenuOpen && !target.closest("header")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout");
      dispatch(userLogout());
      setIsMobileMenuOpen(false);
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleUserMenu = (): void => {
    setShowUserMenu((prev) => !prev);
  };

  const toggleNotifications = (): void => {
    setShowNotifications((prev) => !prev);
  };

  const handleSearch = (): void => {
    if (!query) return;
    setIsMobileMenuOpen(false);
    router.push(`/search?q=${query}`);
    setQuery("");
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 h-16">
        {/* Empty header during SSR */}
      </header>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
            : "bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex-shrink-0">
                <span className="text-2xl font-bold">
                  <span className="text-gray-900 dark:text-white">Work</span>
                  <span className="text-green-600">Hub</span>
                  <span className="text-green-500">.</span>
                </span>
              </Link>

              {/* Desktop Search Bar */}
              <div className="hidden lg:block flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for gigs..."
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition-colors"
                    type="button"
                    aria-label="Search"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {isGuest ? (
                // Guest Navigation
                <>
                  {navData.guestNavItems.slice(0, -2).map((item, index) => (
                    <NavItem key={`guest-${index}`} item={item} />
                  ))}
                  <Globe
                    size={20}
                    className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  />
                  {navData.guestNavItems.slice(-2).map((item, index) => (
                    <NavItem key={`guest-action-${index}`} item={item} />
                  ))}
                </>
              ) : (
                // Logged in User Navigation
                <>
                  {filteredUserNavItems.map((item, index) => (
                    <IconButton
                      key={`user-nav-${index}`}
                      item={item}
                      onClick={
                        item.isNotification ? toggleNotifications : undefined
                      }
                      showNotifications={showNotifications}
                      notifications={mockNotifications}
                      unReadCount={unReadCount}
                      unreadedMessagesCount={unreadedMessagesCount}
                      ordersCount={ordersCount}
                      toggleNotifications={toggleNotifications}
                    />
                  ))}

                  {/* User Menu Dropdown */}
                  <div className="relative user-menu">
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
                      type="button"
                      aria-label="User menu"
                    >
                      <img
                        src={
                          user?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.firstName || "User"
                          )}&background=10b981&color=fff`
                        }
                        alt={user?.firstName || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.firstName || "User"
                          )}&background=10b981&color=fff`;
                        }}
                      />
                      <ChevronDown
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                user?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user?.firstName || "User"
                                )}&background=10b981&color=fff`
                              }
                              alt={user?.firstName || "User"}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user?.firstName || "User"
                                )}&background=10b981&color=fff`;
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {user?.firstName || "User"}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <UserTypeBadge
                                  userType={userType as "freelancer" | "client"}
                                />
                              </div>
                              {userType === "freelancer" && (
                                <>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {user?.level || "New Seller"}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    <Star
                                      size={12}
                                      className="text-yellow-400 fill-current"
                                    />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {user?.rating || "5.0"} (127)
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {filteredUserMenuItems.map((item, index) => {
                            const Icon = item.icon;
                            return item.isAction ? (
                              <button
                                key={`user-menu-${index}`}
                                onClick={handleLogout}
                                className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                type="button"
                              >
                                <Icon size={16} />
                                <span>{item.label}</span>
                              </button>
                            ) : (
                              <Link
                                key={`user-menu-${index}`}
                                href={item.href || "#"}
                                onClick={() => setShowUserMenu(false)}
                              >
                                <div className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  <Icon size={16} />
                                  <span>{item.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <ThemeToggle />
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              {!isGuest && user && (
                <div className="flex items-center space-x-2">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.firstName || "User"
                      )}&background=10b981&color=fff`
                    }
                    alt={user.firstName || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.firstName || "User"
                      )}&background=10b981&color=fff`;
                    }}
                  />
                  <UserTypeBadge
                    userType={userType as "freelancer" | "client"}
                  />
                </div>
              )}
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                type="button"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                type="button"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
            {isGuest ? (
              // Mobile Guest Menu
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to WorkHub
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Join thousands of freelancers and clients
                  </p>
                </div>
                {navData.mobileGuestItems.map((item, index) => (
                  <Link key={`mobile-guest-${index}`} href={item.href || "#"}>
                    <div
                      className={
                        item.isPrimary
                          ? "block py-3 px-4 bg-green-500 text-white text-center rounded-lg font-medium hover:bg-green-600 transition-colors"
                          : "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // Mobile User Menu
              <div className="space-y-4">
                {/* User Info Header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.firstName || "User"
                      )}&background=10b981&color=fff`
                    }
                    alt={user?.firstName || "User"}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.firstName || "User"
                      )}&background=10b981&color=fff`;
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {user?.firstName || "User"}
                    </p>
                    <UserTypeBadge
                      userType={userType as "freelancer" | "client"}
                    />
                    {userType === "freelancer" && (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user?.level || "New Seller"}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star
                            size={12}
                            className="text-yellow-400 fill-current"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.rating || "5.0"} (127)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* User Type Specific Menu Items */}
                <div className="space-y-2">
                  {filteredMobileUserItems.map((item, index) =>
                    item.isAction ? (
                      <button
                        key={`mobile-user-${index}`}
                        className="flex items-center justify-between py-3 text-gray-900 dark:text-gray-100 w-full hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors"
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="font-medium">{item.label}</span>
                        {unReadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unReadCount}
                          </span>
                        )}
                      </button>
                    ) : (
                      <Link
                        key={`mobile-user-${index}`}
                        href={item.href || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors">
                          <span className="font-medium">{item.label}</span>
                          {item.label === "Messages" && unreadedMessagesCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadedMessagesCount}
                            </span>
                          )}
                          {item.label === "My Orders" && ordersCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {ordersCount}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Account
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors">
                      <User size={18} />
                      <span>Profile</span>
                    </div>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors">
                      <Settings size={18} />
                      <span>Settings</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleLogout()}
                    className="flex items-center space-x-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 transition-colors w-full text-left"
                    type="button"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default FiverrHeader;