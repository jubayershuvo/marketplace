"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  CreditCard,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { User } from "@/types/Profile";
import axios from "axios";

// Types
interface Transaction {
  _id: string;
  user: User;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  date: Date;
  order?: string;
  payment?: string;
  client?: string;
  method: "order_payment" | "withdrawal" | "refund" | "bonus" | "fee";
  createdAt: string;
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  availableForWithdrawal: number;
  pendingWithdrawals: number;
}

interface WithdrawalRequest {
  amount: number;
  method: "bank" | "bkash" | "nagad";
  number: string;
}

// Constants
const WITHDRAWAL_CONSTANTS = {
  MIN_WITHDRAWAL_AMOUNT: 500,
  WITHDRAWAL_FEE_PERCENTAGE: 5, // 5% fee
  MIN_WITHDRAWAL_FEE: 10, // Minimum fee amount
};

// API Service Functions
const walletAPI = {
  // Get wallet data
  async getWalletData(): Promise<WalletData> {
    const response = await fetch("/api/freelancer/wallet", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wallet data");
    }

    return response.json();
  },

  // Get all transactions (without filters)
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await fetch("/api/freelancer/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    const data = await response.json();
    return data.transactions;
  },

  // Create withdrawal request
  async createWithdrawal(
    request: WithdrawalRequest
  ): Promise<{ success: boolean; transaction: Transaction }> {
    try {
      const response = await axios.post("/api/freelancer/withdraw", request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Withdrawal failed";
        throw new Error(errorMessage);
      }
      throw new Error("Withdrawal failed");
    }
  },

  // Export transactions
  async exportTransactions(format: "csv" | "pdf" = "csv"): Promise<Blob> {
    const response = await fetch(
      `/api/freelancer/transactions/export?format=${format}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  },
};

const FreelancerWallet = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.userAuth);

  // State management
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    availableForWithdrawal: 0,
    pendingWithdrawals: 0,
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterType, setFilterType] = useState("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [accountDetails, setAccountDetails] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Client-side filtering using useMemo for performance
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchTerm) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        transaction.method.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allTransactions, filterType, searchTerm]);

  // Calculate withdrawal fee
  const calculateWithdrawalFee = (amount: number): number => {
    const fee = Math.ceil(
      amount / WITHDRAWAL_CONSTANTS.WITHDRAWAL_FEE_PERCENTAGE
    );
    return fee
  };

  // Calculate total withdrawal amount (requested amount + fee)
  const calculateTotalWithdrawalAmount = (amount: number): number => {
    return amount + calculateWithdrawalFee(amount);
  };

  // Check if balance is sufficient including fees
  const isBalanceSufficient = (amount: number): boolean => {
    const totalAmount = calculateTotalWithdrawalAmount(amount);
    return totalAmount <= walletData.balance;
  };

  // Get current withdrawal fee for display
  const currentWithdrawalFee = withdrawAmount
    ? calculateWithdrawalFee(parseFloat(withdrawAmount) || 0)
    : 0;

  // Get total withdrawal amount for display
  const totalWithdrawalAmount = withdrawAmount
    ? calculateTotalWithdrawalAmount(parseFloat(withdrawAmount) || 0)
    : 0;

  // Initial data load - only once on mount
  useEffect(() => {
    if (!user.userType || user.userType !== "freelancer") {
      router.push("/");
      return;
    }
    loadWalletData();
    loadAllTransactions();
  }, []);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletAPI.getWalletData();
      setWalletData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      console.error("Error loading wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load all transactions (without filters)
  const loadAllTransactions = async () => {
    try {
      setError(null);
      const data = await walletAPI.getAllTransactions();
      setAllTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
      console.error("Error loading transactions:", err);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([loadWalletData(), loadAllTransactions()]);
  };

  // Format currency
  const formatBDT = (amount: number) =>
    `৳${amount?.toLocaleString("en-BD")}`;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get method icon
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "order_payment":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      case "refund":
        return <ArrowDownLeft className="w-4 h-4 text-orange-500" />;
      case "bonus":
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case "fee":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    const amount = parseFloat(withdrawAmount);
    const fee = calculateWithdrawalFee(amount);
    const totalAmount = amount + fee;

    // Validate minimum amount
    if (amount < WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
      setWithdrawError(
        `Minimum withdrawal amount is ${formatBDT(
          WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT
        )}`
      );
      return;
    }

    // Validate balance including fees
    if (!isBalanceSufficient(amount)) {
      setWithdrawError(
        `Insufficient balance. You need ${formatBDT(
          totalAmount
        )} including fees.`
      );
      return;
    }

    // Validate account details for mobile methods
    if (
      (selectedMethod === "bkash" || selectedMethod === "nagad") &&
      !accountDetails
    ) {
      setWithdrawError("Please enter your phone number");
      return;
    }

    // Validate phone number format for Bangladesh
    if (
      (selectedMethod === "bkash" || selectedMethod === "nagad") &&
      accountDetails
    ) {
      const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
      if (!phoneRegex.test(accountDetails.replace(/\s/g, ""))) {
        setWithdrawError("Please enter a valid Bangladesh phone number (01XXXXXXXXX)");
        return;
      }
    }

    try {
      setWithdrawLoading(true);
      setWithdrawError(null);

      const withdrawalRequest: WithdrawalRequest = {
        amount: amount,
        method: selectedMethod as "bank" | "bkash" | "nagad",
        number: accountDetails,
      };

       await walletAPI.createWithdrawal(withdrawalRequest);

      // Refresh all data to get the latest from server
      await refreshData();

      // Close modal and reset form
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setAccountDetails("");
      setWithdrawError(null);
      
      // Show success message
      setError("Withdrawal request submitted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Withdrawal failed";
      setWithdrawError(errorMessage);
      console.error("Error processing withdrawal:", err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Handle export - export all transactions, not filtered ones
  const handleExport = async (format: "csv" | "pdf" = "csv") => {
    try {
      setLoading(true);
      const blob = await walletAPI.exportTransactions(format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      console.error("Error exporting transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes - no API calls, just state updates
  const handleFilterChange = (newFilterType: string) => {
    setFilterType(newFilterType);
  };

  // Handle search - no API calls, just state updates
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  // Reset withdrawal modal when opened/closed
  const handleWithdrawModalToggle = (show: boolean) => {
    setShowWithdrawModal(show);
    if (!show) {
      // Reset form when closing modal
      setWithdrawAmount("");
      setAccountDetails("");
      setWithdrawError(null);
      setSelectedMethod("bkash");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Message */}
        {error && (
          <div className={`p-4 rounded-lg ${
            error.includes("success") 
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}>
            <div className={`flex items-center gap-2 ${
              error.includes("success") 
                ? "text-green-700 dark:text-green-400" 
                : "text-red-700 dark:text-red-400"
            }`}>
              {error.includes("success") ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className={`ml-auto ${
                  error.includes("success") 
                    ? "text-green-500 hover:text-green-700" 
                    : "text-red-500 hover:text-red-700"
                }`}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Wallet className="w-8 h-8 text-green-600" />
              My Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your earnings and withdrawals
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => handleWithdrawModalToggle(true)}
              disabled={
                !isBalanceSufficient(WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT)
              }
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balance Cards */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Available Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showBalance ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? formatBDT(walletData.balance) : "৳*****"}
                  </p>
                </div>
              </div>

              {/* Pending Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Pending Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatBDT(walletData.pendingBalance)
                      : "৳*****"}
                  </p>
                </div>
              </div>

              {/* Total Earned */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Total Earned
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? formatBDT(walletData.totalEarned) : "৳*****"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Pending Withdrawals
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatBDT(walletData.pendingWithdrawals)
                      : "৳*****"}
                  </p>
                </div>
              </div>

              {/* Total Withdrawn */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <ArrowUpRight className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Total Withdrawn
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatBDT(walletData.totalWithdrawn)
                      : "৳*****"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    {
                      id: "overview",
                      label: "Transaction History",
                      icon: Calendar,
                    },
                    { id: "analytics", label: "Analytics", icon: TrendingUp },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={filterType}
                          onChange={(e) => handleFilterChange(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="all">All Transactions</option>
                          <option value="credit">Credits Only</option>
                          <option value="debit">Debits Only</option>
                        </select>
                        <button
                          onClick={() => handleExport("csv")}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                              {getMethodIcon(transaction.method)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {transaction.description}
                                </p>
                                {getStatusIcon(transaction.status)}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>{formatDate(transaction.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-lg ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatBDT(transaction.amount)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-12">
                        <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          No transactions found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                          {allTransactions.length === 0 
                            ? "You don't have any transactions yet"
                            : "Try adjusting your search or filter criteria"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Monthly Earnings Chart Placeholder */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Monthly Earnings Chart
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Coming soon
                          </p>
                        </div>
                      </div>

                      {/* Transaction Categories */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Transaction Categories
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Withdraw Funds
              </h3>
              <button
                onClick={() => handleWithdrawModalToggle(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Withdrawal Error Message */}
              {withdrawError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{withdrawError}</span>
                  </div>
                </div>
              )}

              {/* Available Balance */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Available for withdrawal
                </p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatBDT(walletData.balance)}
                </p>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setWithdrawError(null); // Clear error when user types
                    }}
                    placeholder="0.00"
                    min={WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT}
                    max={walletData.balance}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum withdrawal amount:{" "}
                  {formatBDT(WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT)}
                </p>

                {/* Fee and Total Calculation */}
                {withdrawAmount &&
                  parseFloat(withdrawAmount) >=
                    WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT && (
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Withdrawal Amount:
                        </span>
                        <span className="font-medium">
                          {formatBDT(parseFloat(withdrawAmount))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Fee ({WITHDRAWAL_CONSTANTS.WITHDRAWAL_FEE_PERCENTAGE}
                          %):
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatBDT(currentWithdrawalFee)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span className="text-gray-700 dark:text-gray-300">
                          Total Deducted:
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatBDT(totalWithdrawalAmount)}
                        </span>
                      </div>
                      {!isBalanceSufficient(parseFloat(withdrawAmount)) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Insufficient balance for this withdrawal including
                          fees
                        </p>
                      )}
                    </div>
                  )}
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Withdrawal Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="bkash"
                      checked={selectedMethod === "bkash"}
                      onChange={(e) => {
                        setSelectedMethod(e.target.value);
                        setAccountDetails("");
                        setWithdrawError(null);
                      }}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      bKash
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="nagad"
                      checked={selectedMethod === "nagad"}
                      onChange={(e) => {
                        setSelectedMethod(e.target.value);
                        setAccountDetails("");
                        setWithdrawError(null);
                      }}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Nagad
                    </span>
                  </label>
                </div>
              </div>

              {/* Account Details Input */}
              {(selectedMethod === "bkash" || selectedMethod === "nagad") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {selectedMethod === "bkash" ? "bKash" : "Nagad"} Phone
                    Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +88
                    </span>
                    <input
                      type="tel"
                      value={accountDetails}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        setAccountDetails(value);
                        setWithdrawError(null);
                      }}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 11-digit phone number (01XXXXXXXXX)
                  </p>
                </div>
              )}

              {selectedMethod === "bank" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Account Details (Optional)
                  </label>
                  <textarea
                    value={accountDetails}
                    onChange={(e) => {
                      setAccountDetails(e.target.value);
                      setWithdrawError(null);
                    }}
                    placeholder="Bank name, account number, branch..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide your bank details or use saved account
                  </p>
                </div>
              )}

              {/* Processing Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • Bank transfers take 1-3 business days
                  <br />
                  • Mobile payments are processed within 24 hours
                  <br />• Minimum withdrawal amount is{" "}
                  {formatBDT(WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT)}
                  <br />• Withdrawal fee:{" "}
                  {WITHDRAWAL_CONSTANTS.WITHDRAWAL_FEE_PERCENTAGE}% (min{" "}
                  {formatBDT(WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_FEE)})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleWithdrawModalToggle(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <
                      WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL_AMOUNT ||
                    !isBalanceSufficient(parseFloat(withdrawAmount)) ||
                    ((selectedMethod === "bkash" ||
                      selectedMethod === "nagad") &&
                      !accountDetails) ||
                    withdrawLoading
                  }
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {withdrawLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      Withdraw{" "}
                      {withdrawAmount && formatBDT(parseFloat(withdrawAmount))}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerWallet;