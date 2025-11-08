"use client";
import React, { use, useEffect, useState } from "react";
import {
  Plus,
  Star,
  DollarSign,
  Eye,
  Search,
  TrendingUp,
  BarChart3,
  Package,
  Activity,
  Award,
  Target,
  Zap,
  Bell,
} from "lucide-react";
import Loading from "./Loading";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface IReview {
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface IFAQ {
  question: string;
  answer: string;
}

interface IGig {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  badge?: string;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: string;
  category: string;
  subcategory: string;
  tags: string[];
  freelancer: string;
  reviews: IReview[];
  faq: IFAQ[];
  createdAt: string;
  updatedAt: string;
}

interface GigWithAnalytics extends IGig {
  impressions: number;
  clicks: number;
  conversions: number;
  orders: number;
  revenue: number;
  avgRating: number;
}

const MyGigManager = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [gigs, setGigs] = useState<GigWithAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const {user} = useAppSelector((state) => state.userAuth);
  const router = useRouter();

  useEffect(() => {
    if(user && user.userType !== 'freelancer'){
      router.push('/');
      return;
    }
    async function fetchGigs() {
      try {
        setLoading(true);
        const response = await fetch("/api/my-gigs");
        const data = await response.json();
        setGigs(data.gigs);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching gigs:", error);
      }
    }

    fetchGigs();
  }, [user, router]);
  
  if (loading) {
    return <Loading />;
  }

  const analytics = {
    totalRevenue: gigs.reduce((sum, gig) => sum + gig.revenue, 0),
    totalOrders: gigs.reduce((sum, gig) => sum + gig.orders, 0),
    avgRating: (
      gigs.reduce((sum, gig) => sum + gig.avgRating, 0) / gigs.length
    ).toFixed(1),
    activeGigs: gigs.length,
    totalImpressions: gigs.reduce((sum, gig) => sum + gig.impressions, 0),
    totalClicks: gigs.reduce((sum, gig) => sum + gig.clicks, 0),
    conversionRate: (
      (gigs.reduce((sum, gig) => sum + gig.conversions, 0) /
        (gigs.reduce((sum, gig) => sum + gig.clicks, 0) || 1)) *
      100
    ).toFixed(1),
    avgOrderValue: (
      gigs.reduce((sum, gig) => sum + gig.revenue, 0) /
      (gigs.reduce((sum, gig) => sum + gig.orders, 0) || 1)
    ).toFixed(0),
  };

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterCategory === "all" || gig.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleViewGig = (id: string) => {
    window.location.href = `/gig/${id}`;
  };

  const handleCreateNewGig = () => {
    window.location.href = "/new/gig";
  };

  const categories = [
    "all",
    ...Array.from(new Set(gigs.map((g) => g.category))),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Gigs
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Earnings
                </div>
                <div className="font-semibold text-green-600 dark:text-green-400">
                  ${analytics.totalRevenue.toLocaleString()}
                </div>
              </div>
              <button
                onClick={handleCreateNewGig}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Gig
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "gigs", label: "My Gigs", icon: Package },
              { id: "analytics", label: "Performance", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${analytics.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +12% from last month
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalOrders}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      +8% from last month
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.avgRating}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Excellent rating
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Gigs
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.activeGigs}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      All gigs active
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conversion Rate
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analytics.conversionRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Order Value
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${analytics.avgOrderValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Views
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analytics.totalImpressions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performing Gigs
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {gigs
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((gig) => (
                      <div
                        key={gig._id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <img
                          src={gig.images[0]}
                          alt={gig.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-white">
                            {gig.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-700 dark:text-white">
                              {gig.avgRating}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({gig.reviews.length})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${gig.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {gig.orders} orders
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gigs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-gray-900"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-gray-900"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                {filteredGigs.length} gig{filteredGigs.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      src={gig.images[0]}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                    {gig.badge && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {gig.badge}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {gig.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                      {gig.title}
                    </h3>

                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {gig.avgRating}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({gig.reviews.length})
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {gig.orders} orders
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          FROM ${gig.price}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${gig.revenue.toLocaleString()} earned
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {gig.impressions.toLocaleString()} views
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {gig.clicks} clicks
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {gig.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {gig.tags.length > 3 && (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                            +{gig.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewGig(gig._id)}
                        className="flex-1 py-2 px-3 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Gig
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGigs.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No gigs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                  }}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Impressions
                  </h3>
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.totalImpressions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total views this month
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">
                    +15% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Clicks
                  </h3>
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics.totalClicks.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Gig clicks this month
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">
                    +8% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Conversion Rate
                  </h3>
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.conversionRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Click to order rate
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">
                    +3% from last month
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gig Performance Analytics
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Gig
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CTR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {gigs.map((gig) => {
                      const ctr = (
                        (gig.clicks / (gig.impressions || 1)) *
                        100
                      ).toFixed(1);
                      return (
                        <tr
                          key={gig._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={gig.images[0]}
                                alt={gig.title}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                  {gig.title}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {gig.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {gig.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {gig.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {ctr}%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {gig.orders}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                            ${gig.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {gig.avgRating}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({gig.reviews.length})
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Category Performance
                </h3>
                <div className="space-y-4">
                  {Array.from(new Set(gigs.map((g) => g.category))).map(
                    (category) => {
                      const categoryGigs = gigs.filter(
                        (g) => g.category === category
                      );
                      const categoryRevenue = categoryGigs.reduce(
                        (sum, g) => sum + g.revenue,
                        0
                      );
                      const categoryOrders = categoryGigs.reduce(
                        (sum, g) => sum + g.orders,
                        0
                      );

                      return (
                        <div
                          key={category}
                          className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category}
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              ${categoryRevenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {categoryGigs.length} gig
                              {categoryGigs.length !== 1 ? "s" : ""}
                            </span>
                            <span>{categoryOrders} orders</span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        High impression rate
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your gigs received{" "}
                        {analytics.totalImpressions.toLocaleString()} views
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Conversion improving
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your conversion rate is {analytics.conversionRate}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Great ratings
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Maintaining {analytics.avgRating} average rating
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Top performer
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Best gig earned $
                        {Math.max(
                          ...gigs.map((g) => g.revenue)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigManager;