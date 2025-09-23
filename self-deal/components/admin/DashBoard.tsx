import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
  Eye,
  MessageSquare,
  Award,
} from "lucide-react";

// Mock JSON data
const revenueData = [
  { month: "Jan", revenue: 15000, orders: 120, users: 850 },
  { month: "Feb", revenue: 18000, orders: 145, users: 920 },
  { month: "Mar", revenue: 22000, orders: 180, users: 1100 },
  { month: "Apr", revenue: 25000, orders: 200, users: 1250 },
  { month: "May", revenue: 28000, orders: 225, users: 1400 },
  { month: "Jun", revenue: 32000, orders: 260, users: 1600 },
];

const categoryData = [
  { name: "Web Development", value: 35, color: "#3B82F6" },
  { name: "Graphic Design", value: 25, color: "#10B981" },
  { name: "Digital Marketing", value: 20, color: "#F59E0B" },
  { name: "Writing & Translation", value: 12, color: "#EF4444" },
  { name: "Video & Animation", value: 8, color: "#8B5CF6" },
];

const topSellers = [
  { name: "John Doe", revenue: 8500, rating: 4.9, orders: 45 },
  { name: "Sarah Wilson", revenue: 7200, rating: 4.8, orders: 38 },
  { name: "Mike Chen", revenue: 6800, rating: 4.7, orders: 42 },
  { name: "Emma Davis", revenue: 5900, rating: 4.6, orders: 35 },
  { name: "Alex Johnson", revenue: 5200, rating: 4.5, orders: 28 },
];

const performanceData = [
  { name: "Mon", views: 1200, clicks: 180, conversions: 25 },
  { name: "Tue", views: 1400, clicks: 220, conversions: 32 },
  { name: "Wed", views: 1600, clicks: 240, conversions: 38 },
  { name: "Thu", views: 1800, clicks: 280, conversions: 45 },
  { name: "Fri", views: 2200, clicks: 350, conversions: 58 },
  { name: "Sat", views: 2600, clicks: 420, conversions: 72 },
  { name: "Sun", views: 2000, clicks: 300, conversions: 48 },
];

const Dashboard = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$140,000",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Users",
      value: "8,420",
      change: "+8.2%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: "1,130",
      change: "+15.3%",
      icon: ShoppingBag,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      change: "+0.2%",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your marketplace performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.color}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: string) => [`$${value}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Service Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance and Orders Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#ffc658"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Orders & Users
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3B82F6" />
                <Bar dataKey="users" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sellers Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Sellers
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Seller
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Orders
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((seller, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {seller.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        {seller.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      ${seller.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{seller.orders}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {seller.rating}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Page Views</h4>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">45,678</p>
            <p className="text-sm text-green-600">+18.5% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Messages</h4>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">2,847</p>
            <p className="text-sm text-blue-600">+24.3% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Completion Rate</h4>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">94.2%</p>
            <p className="text-sm text-purple-600">+2.1% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
