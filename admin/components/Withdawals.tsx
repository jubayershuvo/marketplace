"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Smartphone,
  AlertTriangle,
  Zap,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";

// Type definitions
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Withdrawal {
  _id: string;
  user: User;
  transaction: string;
  amount: number;
  fee: number;
  method: string;
  number: string;
  currency: string;
  status: "pending" | "completed" | "rejected";
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  pending: number;
  completed: number;
  rejected: number;
  totalAmount: number;
}

const WithdrawManager = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWithdraw, setSelectedWithdraw] = useState<Withdrawal | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch all withdrawals on component mount
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/withdrawals");
      const data: Withdrawal[] = response.data.withdrawals;

      setWithdrawals(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      alert("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Withdrawal[]) => {
    const newStats: Stats = data.reduce(
      (acc, w) => {
        acc[w.status]++;
        if (w.status === "completed") {
          acc.totalAmount += w.amount;
        }
        return acc;
      },
      { pending: 0, completed: 0, rejected: 0, totalAmount: 0 }
    );
    setStats(newStats);
  };

  const handleAction = async (
    id: string,
    action: "completed" | "rejected",
    note = ""
  ) => {
    setActionLoading(id);
    try {
      const response = await axios.patch(`/api/withdrawals`, {
        status: action,
        note: note,
        ids: [id],
      });

      if (response.data.success) {
        // Update local state
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === id
              ? {
                  ...w,
                  status: action,
                  note: note || w.note,
                  updatedAt: new Date().toISOString(),
                }
              : w
          )
        );

        // Recalculate stats with updated data
        const updatedWithdrawals = withdrawals.map((w) =>
          w._id === id ? { ...w, status: action, note } : w
        );
        calculateStats(updatedWithdrawals);

        setSelectedWithdraw(null);
      } else {
        throw new Error(response.data.message || "Failed to update withdrawal");
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      alert("Failed to update withdrawal status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (
    ids: string[],
    action: "completed" | "rejected",
    note = ""
  ) => {
    setActionLoading("bulk");
    try {
      const response = await axios.patch("/api/withdrawals/bulk", {
        ids,
        status: action,
        note: note,
      });

      if (response.data.success) {
        // Update local state
        setWithdrawals((prev) =>
          prev.map((w) =>
            ids.includes(w._id)
              ? {
                  ...w,
                  status: action,
                  note: note || w.note,
                  updatedAt: new Date().toISOString(),
                }
              : w
          )
        );

        // Recalculate stats with updated data
        const updatedWithdrawals = withdrawals.map((w) =>
          ids.includes(w._id) ? { ...w, status: action, note } : w
        );
        calculateStats(updatedWithdrawals);

        alert(`Successfully updated ${ids.length} withdrawals`);
      } else {
        throw new Error(
          response.data.message || "Failed to update withdrawals"
        );
      }
    } catch (error) {
      console.error("Error bulk updating withdrawals:", error);
      alert("Failed to update withdrawals");
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await axios.get("/api/withdrawals/export", {
        params: { filter, searchTerm },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `withdrawals-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting withdrawals:", error);
      alert("Failed to export withdrawals");
    }
  };

  // Filter withdrawals based on search term and status filter
  const filteredWithdrawals = withdrawals.filter((w) => {
    // Search filter
    const matchesSearch =
      (w.user.firstName + " " + w.user.lastName)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      w.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.number.includes(searchTerm) ||
      w.transaction
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = filter === "all" || w.status === filter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "completed":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "rejected":
        return "bg-gradient-to-r from-red-400 to-rose-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-800 shadow-lg"
          >
            <Menu className="w-6 h-6 text-purple-400" />
          </button>
          <h1 className="text-xl font-bold text-white">
            Withdrawals
          </h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Header with animated background */}
        <div className="mb-6 lg:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl lg:rounded-3xl opacity-20 blur-3xl"></div>
          <div className="relative bg-gray-800/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-lg">
                <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-4xl font-black text-white mb-1 tracking-tight truncate">
                  Withdrawal Control Center
                </h1>
                <p className="text-purple-200 text-sm lg:text-lg truncate">
                  Manage and process user withdrawal requests with ease
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl lg:rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gray-800/10 backdrop-blur-xl p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-yellow-200 mb-1 font-semibold truncate">
                    Pending
                  </p>
                  <p className="text-xl lg:text-3xl font-black text-white truncate">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg flex-shrink-0">
                  <Clock className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl lg:rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gray-800/10 backdrop-blur-xl p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-green-200 mb-1 font-semibold truncate">
                    Completed
                  </p>
                  <p className="text-xl lg:text-3xl font-black text-white truncate">
                    {stats.completed}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl lg:rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gray-800/10 backdrop-blur-xl p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-red-200 mb-1 font-semibold truncate">
                    Rejected
                  </p>
                  <p className="text-xl lg:text-3xl font-black text-white truncate">
                    {stats.rejected}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-rose-500 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg flex-shrink-0">
                  <XCircle className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl lg:rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gray-800/10 backdrop-blur-xl p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-blue-200 mb-1 font-semibold truncate">
                    Total Paid
                  </p>
                  <p className="text-lg lg:text-2xl font-black text-white truncate">
                    {stats.totalAmount.toLocaleString()}{" "}
                    <span className="text-sm lg:text-lg">BDT</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/10 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-white/20 shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex gap-2 lg:gap-3 flex-wrap">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "completed"
                      | "rejected"
                  )
                }
                className="flex-1 lg:flex-none px-3 lg:px-5 py-2 lg:py-3 bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white backdrop-blur-sm font-semibold text-sm lg:text-base min-w-[120px]"
              >
                <option value="all" className="bg-slate-900">
                  All Status
                </option>
                <option value="pending" className="bg-slate-900">
                  Pending
                </option>
                <option value="completed" className="bg-slate-900">
                  Completed
                </option>
                <option value="rejected" className="bg-slate-900">
                  Rejected
                </option>
              </select>
              <button
                onClick={fetchWithdrawals}
                disabled={loading}
                className="px-3 lg:px-5 py-2 lg:py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/30 flex items-center gap-2 font-semibold hover:scale-105 disabled:opacity-50 text-sm lg:text-base flex-1 lg:flex-none justify-center"
              >
                <RefreshCw
                  className={`w-4 h-4 lg:w-5 lg:h-5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden lg:inline">Refresh</span>
                <span className="lg:hidden">Ref</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 lg:px-5 py-2 lg:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-bold hover:scale-105 text-sm lg:text-base flex-1 lg:flex-none justify-center"
              >
                <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden lg:inline">Export</span>
                <span className="lg:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-gray-800/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 lg:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-purple-200 font-semibold text-sm lg:text-lg">
                Loading withdrawals...
              </p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <p className="text-purple-200 text-sm lg:text-lg">
                No withdrawals found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider hidden sm:table-cell">
                      Transaction
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider hidden md:table-cell">
                      Method
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal._id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedWithdraw(withdrawal)}
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate max-w-[120px] lg:max-w-none">
                            {withdrawal.user.firstName +
                              " " +
                              withdrawal.user.lastName}
                          </div>
                          <div className="text-xs text-purple-300 truncate max-w-[120px] lg:max-w-none">
                            {withdrawal.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs lg:text-sm font-mono font-bold text-cyan-300 truncate max-w-[100px] lg:max-w-none">
                          {withdrawal.transaction}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white">
                            {withdrawal.amount.toLocaleString()} BDT
                          </div>
                          <div className="text-xs text-purple-300 hidden sm:block">
                            Fee: {withdrawal.fee} BDT
                          </div>
                          <div className="text-xs text-green-400 font-bold">
                            Pay:{" "}
                            {(
                              withdrawal.amount
                            ).toLocaleString()}{" "}
                            BDT
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-3 h-3 lg:w-4 lg:h-4 text-purple-300 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs lg:text-sm font-bold text-white uppercase truncate">
                              {withdrawal.method}
                            </div>
                            <div className="text-xs text-purple-300 truncate">
                              {withdrawal.number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-bold shadow-lg ${getStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {getStatusIcon(withdrawal.status)}
                          <span className="hidden xs:inline">
                            {withdrawal.status.charAt(0).toUpperCase() +
                              withdrawal.status.slice(1)}
                          </span>
                          <span className="xs:hidden">
                            {withdrawal.status.charAt(0).toUpperCase()}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-purple-300 font-medium hidden lg:table-cell">
                        {formatDate(withdrawal.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 lg:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl max-w-full w-full max-h-[95vh] overflow-y-auto border-2 border-purple-500/30 shadow-2xl m-2">
            {/* Header */}
            <div className="relative p-6 lg:p-8 border-b border-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-t-2xl lg:rounded-t-3xl"></div>
              <div className="relative flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                      <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <h2 className="text-xl lg:text-3xl font-black text-white truncate">
                      Withdrawal Details
                    </h2>
                  </div>
                  <p className="text-purple-300 font-mono font-semibold text-sm lg:text-base truncate">
                    Transaction: {selectedWithdraw.transaction}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWithdraw(null)}
                  className="text-purple-300 hover:text-white transition-colors hover:rotate-90 duration-300 flex-shrink-0 ml-2"
                >
                  <XCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                </button>
              </div>
            </div>

            <div className="p-4 lg:p-8 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-lg lg:text-xl font-black text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 lg:h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  User Information
                </h3>
                <div className="bg-white/5 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Name:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-lg text-right truncate ml-2">
                      {selectedWithdraw.user.firstName}{" "}
                      {selectedWithdraw.user.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Email:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-base text-right truncate ml-2">
                      {selectedWithdraw.user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg lg:text-xl font-black text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 lg:h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  Payment Information
                </h3>
                <div className="bg-white/5 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Method:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-base uppercase flex items-center gap-2">
                      <Smartphone className="w-4 h-4 lg:w-5 lg:h-5" />
                      {selectedWithdraw.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Number:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 text-sm lg:text-lg text-right">
                      {selectedWithdraw.number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Amount:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-lg text-right">
                      {selectedWithdraw.amount.toLocaleString()}{" "}
                      {selectedWithdraw.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Fee:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-base text-right">
                      {selectedWithdraw.fee} {selectedWithdraw.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/20">
                    <span className="text-white font-bold text-base lg:text-lg">
                      Net Amount:
                    </span>
                    <span className="font-black text-xl lg:text-3xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent text-right">
                      {(
                        selectedWithdraw.amount + selectedWithdraw.fee
                      ).toLocaleString()}{" "}
                      {selectedWithdraw.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div>
                <h3 className="text-lg lg:text-xl font-black text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 lg:h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  Status Information
                </h3>
                <div className="bg-white/5 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Current Status:
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-xs lg:text-sm font-bold shadow-lg ${getStatusColor(
                        selectedWithdraw.status
                      )}`}
                    >
                      {getStatusIcon(selectedWithdraw.status)}
                      {selectedWithdraw.status.charAt(0).toUpperCase() +
                        selectedWithdraw.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Created:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-base text-right">
                      {formatDate(selectedWithdraw.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold text-sm lg:text-base">
                      Last Updated:
                    </span>
                    <span className="font-bold text-white text-sm lg:text-base text-right">
                      {formatDate(selectedWithdraw.updatedAt)}
                    </span>
                  </div>
                  {selectedWithdraw.note && (
                    <div className="pt-3 border-t border-white/20">
                      <span className="text-purple-300 block mb-2 font-semibold text-sm lg:text-base">
                        Note:
                      </span>
                      <p className="text-xs lg:text-sm text-white bg-white/10 p-3 lg:p-4 rounded-xl border border-white/20 font-medium">
                        {selectedWithdraw.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedWithdraw.status === "pending" && (
                <div>
                  <h3 className="text-lg lg:text-xl font-black text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 lg:h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    Payment Actions
                  </h3>
                  <div className="space-y-4">
                    {/* Manual Payment Confirmation Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 border-2 border-cyan-500/50 rounded-2xl p-4 lg:p-6 space-y-4 lg:space-y-5 shadow-2xl backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>

                      <div className="relative flex items-start gap-3 lg:gap-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-xl animate-pulse flex-shrink-0">
                          <Zap className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white mb-2 text-lg lg:text-2xl flex items-center gap-2 flex-wrap">
                            Manual Payment Required
                            <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400 animate-bounce flex-shrink-0" />
                          </h4>
                          <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-3 lg:p-5 space-y-2 lg:space-y-3 mb-3 lg:mb-4 border border-white/30 shadow-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-cyan-200 font-bold text-xs lg:text-sm">
                                Send To:
                              </span>
                              <span className="font-black text-lg lg:text-2xl text-white tracking-wide text-right break-all ml-2">
                                {selectedWithdraw.number}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-cyan-200 font-bold text-xs lg:text-sm">
                                Method:
                              </span>
                              <span className="font-black text-white uppercase flex items-center gap-2 text-sm lg:text-base">
                                <Smartphone className="w-4 h-4 lg:w-5 lg:h-5" />
                                {selectedWithdraw.method}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 lg:pt-3 border-t-2 border-cyan-400/50">
                              <span className="text-cyan-200 font-bold text-xs lg:text-sm">
                                Amount to Send:
                              </span>
                              <span className="font-black text-2xl lg:text-4xl bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-pulse text-right">
                                {(
                                  selectedWithdraw.amount - selectedWithdraw.fee
                                ).toLocaleString()}{" "}
                                BDT
                              </span>
                            </div>
                          </div>
                          <div className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-l-4 border-yellow-400 p-3 lg:p-4 rounded-xl backdrop-blur-sm">
                            <div className="absolute inset-0 bg-yellow-400/5 animate-pulse rounded-xl"></div>
                            <p className="relative text-xs lg:text-sm text-yellow-100 font-bold flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 mt-0.5" />
                              Send the money manually via{" "}
                              {selectedWithdraw.method.toUpperCase()} app before
                              confirming below
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative space-y-3 lg:space-y-4">
                        <label className="block">
                          <span className="text-sm font-black text-white flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Transaction ID / Reference Number
                            <span className="text-red-500">*</span>
                          </span>
                          <input
                            type="text"
                            id="transactionRef"
                            placeholder="Enter the transaction ID from bKash/Nagad"
                            className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-white/10 border-2 border-cyan-500/50 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 font-bold text-white placeholder-purple-300 backdrop-blur-sm transition-all text-sm lg:text-base"
                            required
                          />
                          <p className="text-xs text-cyan-300 mt-2 font-semibold">
                            📋 This will be saved for audit trail
                          </p>
                        </label>

                        <label className="block">
                          <span className="text-sm font-black text-white mb-2 block">
                            Additional Notes (Optional)
                          </span>
                          <textarea
                            id="approvalNote"
                            placeholder="Any additional information about the transaction..."
                            rows={2}
                            className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-white/10 border-2 border-purple-500/50 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 resize-none text-white placeholder-purple-300 backdrop-blur-sm font-medium transition-all text-sm lg:text-base"
                          />
                        </label>

                        <label className="flex items-start gap-3 lg:gap-4 p-3 lg:p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border-2 border-green-400/50 cursor-pointer hover:from-green-500/30 hover:to-emerald-500/30 transition-all hover:scale-[1.02] backdrop-blur-sm group">
                          <input
                            type="checkbox"
                            id="confirmPayment"
                            className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 border-2 border-green-400 rounded-lg focus:ring-4 focus:ring-green-500/50 mt-0.5 cursor-pointer transition-all flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-black text-white block mb-1 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                              I confirm that I have successfully sent the
                              payment
                            </span>
                            <span className="text-xs text-green-200 font-semibold leading-relaxed">
                              By checking this box, I verify that{" "}
                              <span className="font-black text-green-300">
                                {(
                                  selectedWithdraw.amount - selectedWithdraw.fee
                                ).toLocaleString()}{" "}
                                BDT
                              </span>{" "}
                              has been manually transferred to{" "}
                              <span className="font-black text-green-300">
                                {selectedWithdraw.number}
                              </span>{" "}
                              via{" "}
                              <span className="font-black text-green-300">
                                {selectedWithdraw.method.toUpperCase()}
                              </span>
                            </span>
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          const checkbox = document.getElementById(
                            "confirmPayment"
                          ) as HTMLInputElement;
                          const transactionRef = (
                            document.getElementById(
                              "transactionRef"
                            ) as HTMLInputElement
                          ).value.trim();
                          const approvalNote = (
                            document.getElementById(
                              "approvalNote"
                            ) as HTMLTextAreaElement
                          ).value.trim();

                          if (!checkbox.checked) {
                            alert(
                              "⚠️ Please confirm that you have sent the payment by checking the confirmation box"
                            );
                            return;
                          }

                          if (!transactionRef) {
                            alert(
                              "⚠️ Please enter the Transaction ID / Reference Number"
                            );
                            (
                              document.getElementById(
                                "transactionRef"
                              ) as HTMLInputElement
                            ).focus();
                            return;
                          }

                          let note = `Payment manually sent and confirmed. Transaction Ref: ${transactionRef}`;
                          if (approvalNote) {
                            note += `. Admin Note: ${approvalNote}`;
                          }

                          if (
                            confirm(
                              `🚀 Are you sure you want to approve this withdrawal?\n\n💰 Amount: ${(
                                selectedWithdraw.amount - selectedWithdraw.fee
                              ).toLocaleString()} BDT\n📱 To: ${
                                selectedWithdraw.number
                              }\n🔖 Ref: ${transactionRef}`
                            )
                          ) {
                            handleAction(
                              selectedWithdraw._id,
                              "completed",
                              note
                            );
                          }
                        }}
                        disabled={actionLoading === selectedWithdraw._id}
                        className="relative w-full py-4 lg:py-5 px-4 lg:px-6 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white rounded-xl hover:from-green-500 hover:via-emerald-500 hover:to-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 font-black text-base lg:text-lg shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] border-2 border-green-400/50 overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        {actionLoading === selectedWithdraw._id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 lg:h-7 lg:w-7 border-4 border-white border-t-transparent"></div>
                            <span className="relative text-sm lg:text-base">
                              Processing Payment...
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 lg:w-7 lg:h-7 relative" />
                            <span className="relative text-sm lg:text-base">
                              Confirm Payment & Approve
                            </span>
                            <Zap className="w-4 h-4 lg:w-6 lg:h-6 relative animate-pulse" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Rejection Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-900/40 via-rose-900/40 to-pink-900/40 border-2 border-red-500/50 rounded-2xl p-4 lg:p-6 space-y-3 lg:space-y-4 shadow-2xl backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10"></div>

                      <div className="relative flex items-start gap-3 lg:gap-4">
                        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-xl flex-shrink-0">
                          <XCircle className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white mb-1 text-lg lg:text-2xl">
                            Reject Withdrawal
                          </h4>
                          <p className="text-xs lg:text-sm text-red-200 font-semibold">
                            Provide a clear reason for rejection to maintain
                            transparency
                          </p>
                        </div>
                      </div>

                      <div className="relative space-y-3">
                        <textarea
                          placeholder="Enter detailed reason for rejection (required)..."
                          id="rejectReason"
                          rows={3}
                          className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-white/10 border-2 border-red-500/50 rounded-xl focus:ring-4 focus:ring-red-500/50 focus:border-red-400 resize-none text-white placeholder-red-300 backdrop-blur-sm font-medium transition-all text-sm lg:text-base"
                        />
                        <button
                          onClick={() => {
                            const reason = (
                              document.getElementById(
                                "rejectReason"
                              ) as HTMLTextAreaElement
                            ).value;
                            if (reason.trim()) {
                              if (
                                confirm(
                                  `❌ Are you sure you want to reject this withdrawal?\n\nThis action cannot be undone.`
                                )
                              ) {
                                handleAction(
                                  selectedWithdraw._id,
                                  "rejected",
                                  reason
                                );
                              }
                            } else {
                              alert("⚠️ Please provide a reason for rejection");
                            }
                          }}
                          disabled={actionLoading === selectedWithdraw._id}
                          className="relative w-full py-4 lg:py-5 px-4 lg:px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white rounded-xl hover:from-red-500 hover:via-rose-500 hover:to-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 font-black text-base lg:text-lg shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] border-2 border-red-400/50 overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          {actionLoading === selectedWithdraw._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 lg:h-7 lg:w-7 border-4 border-white border-t-transparent"></div>
                              <span className="relative text-sm lg:text-base">
                                Processing Rejection...
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 lg:w-7 lg:h-7 relative" />
                              <span className="relative text-sm lg:text-base">
                                Reject Withdrawal Request
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawManager;