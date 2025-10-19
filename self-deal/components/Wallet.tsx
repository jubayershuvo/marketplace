"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  CreditCard,
  Smartphone,
  Building2,
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

// Types
interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  date: string;
  orderId?: string;
  clientName?: string;
  method: "order_payment" | "withdrawal" | "refund" | "bonus" | "fee";
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  availableForWithdrawal: number;
}

interface WithdrawalRequest {
  amount: number;
  method: "bank" | "bkash" | "nagad";
  accountDetails?: string;
}

// API Service Functions
const walletAPI = {
  // Get wallet data
  async getWalletData(): Promise<WalletData> {
    const response = await fetch('/api/freelancer/wallet', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet data');
    }

    return response.json();
  },

  // Get transactions
  async getTransactions(params?: {
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/freelancer/transactions?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const data = await response.json();
    return data.transactions;
  },

  

  // Create withdrawal request
  async createWithdrawal(request: WithdrawalRequest): Promise<{ success: boolean; transaction: Transaction }> {
    const response = await fetch('/api/freelancer/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Withdrawal failed');
    }

    return response.json();
  },

  // Export transactions
  async exportTransactions(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`/api/freelancer/transactions/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

const FreelancerWallet = () => {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    availableForWithdrawal: 0,
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  console.log("Transactions:", transactions);
  const router = useRouter();

  const { user } = useAppSelector((state) => state.userAuth);

  useEffect(() => {
    if (!user.userType || user.userType !== "freelancer") {
      router.push("/");
      return;
    }
    // Load initial data
    loadWalletData();
    loadTransactions();
  }, [user, router]);

  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterType, setFilterType] = useState("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletAPI.getWalletData();
      setWalletData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletAPI.getTransactions({
        type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined,
      });
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([loadWalletData(), loadTransactions()]);
  };

  // Handle filter changes
  useEffect(() => {
    if (user.userType === "freelancer") {
      loadTransactions();
    }
  }, [filterType, searchTerm]);

  const formatBDT = (amount: number) =>
    `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      filterType === "all" || transaction.type === filterType;
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.clientName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    try {
      setLoading(true);
      setError(null);

      const withdrawalRequest: WithdrawalRequest = {
        amount: parseFloat(withdrawAmount),
        method: selectedMethod as "bank" | "bkash" | "nagad",
      };

      const result = await walletAPI.createWithdrawal(withdrawalRequest);
      
      // Update transactions list
      setTransactions((prev) => [result.transaction, ...prev]);
      
      // Update wallet data
      setWalletData((prev) => ({
        ...prev,
        balance: prev.balance - parseFloat(withdrawAmount),
        availableForWithdrawal: prev.availableForWithdrawal - parseFloat(withdrawAmount),
        totalWithdrawn: prev.totalWithdrawn + parseFloat(withdrawAmount),
      }));

      setShowWithdrawModal(false);
      setWithdrawAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
      console.error('Error processing withdrawal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      setLoading(true);
      const blob = await walletAPI.exportTransactions(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      console.error('Error exporting transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
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
              onClick={() => setShowWithdrawModal(true)}
              disabled={walletData.availableForWithdrawal < 500}
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
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
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
                    {showBalance ? formatBDT(walletData.pendingBalance) : "৳*****"}
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

              {/* Available for Withdrawal */}
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="all">All Transactions</option>
                          <option value="credit">Credits Only</option>
                          <option value="debit">Debits Only</option>
                        </select>
                        <button 
                          onClick={() => handleExport('csv')}
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
                          key={transaction.id}
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
                                <span>{formatDate(transaction.date)}</span>
                                {transaction.orderId && (
                                  <>
                                    <span>•</span>
                                    <span>Order: {transaction.orderId}</span>
                                  </>
                                )}
                                {transaction.clientName && (
                                  <>
                                    <span>•</span>
                                    <span>Client: {transaction.clientName}</span>
                                  </>
                                )}
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
                          Try adjusting your search or filter criteria
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
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Available for withdrawal
                </p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatBDT(walletData.availableForWithdrawal)}
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
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="500"
                    max={walletData.availableForWithdrawal}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum withdrawal amount: ৳500
                </p>
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
                      value="bank"
                      checked={selectedMethod === "bank"}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Bank Transfer
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="bkash"
                      checked={selectedMethod === "bkash"}
                      onChange={(e) => setSelectedMethod(e.target.value)}
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
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Nagad
                    </span>
                  </label>
                </div>
              </div>

              {/* Processing Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • Bank transfers take 1-3 business days • Mobile payments are
                  processed within 24 hours • Minimum withdrawal amount is ৳500
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) < 500 ||
                    parseFloat(withdrawAmount) >
                      walletData.availableForWithdrawal ||
                    loading
                  }
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
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