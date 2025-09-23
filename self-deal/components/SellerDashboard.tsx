"use client";
import React, { useState } from "react";
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
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  Users,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  CreditCard,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";

// Enhanced seller data with financial details (BDT currency)
const topSellers = [
  {
    id: 1001,
    name: "Rashid Ahmed",
    totalEarnings: 1375000,
    availableBalance: 253000,
    pendingClearance: 93500,
    withdrawnToDate: 1028500,
    rating: 4.9,
    totalOrders: 45,
    activeOrders: 3,
    lastOrder: "2 hours ago",
    newMessages: 5,
    avatar: "RA",
    revenueGrowth: 15.2,
    completedThisMonth: 8,
    monthlyEarnings: 352000,
  },
  {
    id: 1002,
    name: "Fatima Khan",
    totalEarnings: 1188000,
    availableBalance: 214500,
    pendingClearance: 66000,
    withdrawnToDate: 907500,
    rating: 4.8,
    totalOrders: 38,
    activeOrders: 2,
    lastOrder: "5 hours ago",
    newMessages: 2,
    avatar: "FK",
    revenueGrowth: 22.1,
    completedThisMonth: 6,
    monthlyEarnings: 308000,
  },
  {
    id: 1003,
    name: "Aminul Islam",
    totalEarnings: 1072500,
    availableBalance: 132000,
    pendingClearance: 121000,
    withdrawnToDate: 819500,
    rating: 4.7,
    totalOrders: 42,
    activeOrders: 4,
    lastOrder: "1 day ago",
    newMessages: 8,
    avatar: "AI",
    revenueGrowth: 8.7,
    completedThisMonth: 7,
    monthlyEarnings: 286000,
  },
  {
    id: 1004,
    name: "Salma Begum",
    totalEarnings: 979000,
    availableBalance: 184800,
    pendingClearance: 46200,
    withdrawnToDate: 748000,
    rating: 4.6,
    totalOrders: 35,
    activeOrders: 2,
    lastOrder: "3 hours ago",
    newMessages: 1,
    avatar: "SB",
    revenueGrowth: 11.9,
    completedThisMonth: 5,
    monthlyEarnings: 242000,
  },
  {
    id: 1005,
    name: "Karim Rahman",
    totalEarnings: 814000,
    availableBalance: 107800,
    pendingClearance: 35200,
    withdrawnToDate: 671000,
    rating: 4.5,
    totalOrders: 28,
    activeOrders: 2,
    lastOrder: "6 hours ago",
    newMessages: 3,
    avatar: "KR",
    revenueGrowth: 18.3,
    completedThisMonth: 4,
    monthlyEarnings: 198000,
  },
];

// Financial data (BDT currency)
const earningsData = [
  { month: "Jan", earnings: 1650000, withdrawals: 1320000, balance: 330000 },
  { month: "Feb", earnings: 1980000, withdrawals: 1595000, balance: 715000 },
  { month: "Mar", earnings: 2420000, withdrawals: 1980000, balance: 1155000 },
  { month: "Apr", earnings: 2750000, withdrawals: 2200000, balance: 1705000 },
  { month: "May", earnings: 3080000, withdrawals: 2530000, balance: 2255000 },
  { month: "Jun", earnings: 3520000, withdrawals: 2750000, balance: 3025000 },
];

const paymentMethods = [
  { method: "bKash", amount: 1716000, percentage: 45, color: "#E2136E" },
  {
    method: "Bank Transfer",
    amount: 1364000,
    percentage: 35,
    color: "#10B981",
  },
  { method: "Nagad", amount: 462000, percentage: 12, color: "#FF6B35" },
  { method: "Rocket", amount: 308000, percentage: 8, color: "#8B42C7" },
];

const recentTransactions = [
  {
    id: "TXN001",
    seller: "Rashid Ahmed",
    type: "earning",
    amount: 13750,
    status: "completed",
    date: "2024-01-15",
    description: "Logo Design Project",
  },
  {
    id: "TXN002",
    seller: "Fatima Khan",
    type: "withdrawal",
    amount: -55000,
    status: "pending",
    date: "2024-01-14",
    description: "bKash Withdrawal",
  },
  {
    id: "TXN003",
    seller: "Aminul Islam",
    type: "earning",
    amount: 22000,
    status: "pending",
    date: "2024-01-14",
    description: "Web Development",
  },
  {
    id: "TXN004",
    seller: "Salma Begum",
    type: "earning",
    amount: 8250,
    status: "completed",
    date: "2024-01-13",
    description: "Content Writing",
  },
  {
    id: "TXN005",
    seller: "Karim Rahman",
    type: "withdrawal",
    amount: -33000,
    status: "completed",
    date: "2024-01-12",
    description: "Bank Transfer",
  },
];

const SellerDashboard = () => {
  const [selectedSeller, setSelectedSeller] = useState(null);

  const totalPlatformEarnings = topSellers.reduce(
    (sum, seller) => sum + seller.totalEarnings,
    0
  );
  const totalAvailableBalance = topSellers.reduce(
    (sum, seller) => sum + seller.availableBalance,
    0
  );
  const totalPendingClearance = topSellers.reduce(
    (sum, seller) => sum + seller.pendingClearance,
    0
  );
  const totalWithdrawn = topSellers.reduce(
    (sum, seller) => sum + seller.withdrawnToDate,
    0
  );

  const stats = [
    {
      title: "Total Earnings",
      value: `৳${totalPlatformEarnings.toLocaleString()}`,
      change: "+15.8%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Available Balance",
      value: `৳${totalAvailableBalance.toLocaleString()}`,
      change: "+8.2%",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Clearance",
      value: `৳${totalPendingClearance.toLocaleString()}`,
      change: "+12.5%",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Withdrawn",
      value: `৳${totalWithdrawn.toLocaleString()}`,
      change: "+22.1%",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getTransactionIcon = (type, status) => {
    if (type === "earning") {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Seller Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive earnings and balance overview for all sellers
          </p>
        </div>

        {/* Financial Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}
                  >
                    <Icon
                      className={`h-6 w-6 ${stat.color} dark:text-opacity-90`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${stat.color} dark:text-opacity-90`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {stat.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings vs Withdrawals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Earnings vs Withdrawals
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`৳${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Earnings"
                />
                <Area
                  type="monotone"
                  dataKey="withdrawals"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Withdrawals"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Available Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Withdrawal Methods
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `৳${value.toLocaleString()}`,
                    "Amount",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seller Financial Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Seller Earnings & Balance Details
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Click on a seller to view detailed profile
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Seller
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Total Earnings
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Available Balance
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Pending Clearance
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Total Withdrawn
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Monthly Earnings
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Growth
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((seller, index) => (
                  <tr
                    key={seller.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {seller.avatar}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {seller.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: #{seller.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-green-600 font-bold text-lg">
                        ৳{seller.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Lifetime total
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-blue-600 font-semibold">
                        ৳{seller.availableBalance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Ready to withdraw
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-orange-600 font-semibold">
                        ৳{seller.pendingClearance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Processing
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-purple-600 font-semibold">
                        ৳{seller.withdrawnToDate.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total withdrawn
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ৳{seller.monthlyEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {seller.completedThisMonth} orders
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">
                          +{seller.revenueGrowth}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedSeller(seller)}
                        className="bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {getTransactionIcon(transaction.type, transaction.status)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {transaction.seller}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {transaction.id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold text-lg ${
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}৳
                    {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={getStatusBadge(transaction.status)}>
                      {transaction.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Seller Profile Modal-like Section */}
        {selectedSeller && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-700 mb-8 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedSeller.name} - Financial Profile
              </h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
                  ৳{selectedSeller.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Lifetime Earnings
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                  ৳{selectedSeller.availableBalance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Available to Withdraw
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-orange-600 dark:text-orange-400 text-2xl font-bold">
                  ৳{selectedSeller.pendingClearance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Pending Clearance
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-purple-600 dark:text-purple-400 text-2xl font-bold">
                  ৳{selectedSeller.withdrawnToDate.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Withdrawn
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Performance Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Earnings:</span>
                    <span className="font-semibold">
                      ৳{selectedSeller.monthlyEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Orders Completed This Month:
                    </span>
                    <span className="font-semibold">
                      {selectedSeller.completedThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Growth:</span>
                    <span className="font-semibold text-green-600">
                      +{selectedSeller.revenueGrowth}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average per Order:</span>
                    <span className="font-semibold">
                      ৳
                      {(
                        selectedSeller.totalEarnings /
                        selectedSeller.totalOrders
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Account Status
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Account Balance Status:
                    </span>
                    <span
                      className={`font-semibold ${
                        selectedSeller.availableBalance > 1000
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {selectedSeller.availableBalance > 1000
                        ? "Healthy"
                        : "Low Balance"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Earning:</span>
                    <span className="font-semibold">
                      {selectedSeller.lastOrder}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Orders:</span>
                    <span className="font-semibold">
                      {selectedSeller.activeOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller Rating:</span>
                    <span className="font-semibold flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {selectedSeller.rating}
                    </span>
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

export default SellerDashboard;
