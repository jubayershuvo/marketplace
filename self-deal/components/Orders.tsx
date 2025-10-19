"use client";
import React, { use, useEffect, useState } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  Eye,
  X,
  DollarSign,
  Package,
  Search,
} from "lucide-react";
import axios from "axios";
import { useAppSelector } from "@/lib/hooks";
import { User } from "@/types/Profile";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import { set } from "mongoose";

// Type definitions

interface OrderUser {
  _id: string;
  username: string;
  userType: "freelancer" | "client";
  firstName: string;
  lastName: string;
  avatar: string;
}

interface Gig {
  _id: string;
  title: string;
}

interface Order {
  _id: string; // Changed from number to string
  client: OrderUser;
  freelancer: OrderUser;
  gig: Gig;
  totalAmount: number;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "delivered"
    | "completed"
    | "cancelled";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderModalProps {
  order: Order | null;
  show: boolean;
  onClose: () => void;
  user: User;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void; // Changed orderId to string
}

const OrderManagement = () => {
  const { user } = useAppSelector((state) => state.userAuth);

  const [activeTab, setActiveTab] = useState<string>("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/get-orders");
        setOrders(response.data.orders);
        setLoading(false);
        console.log("Orders:", response.data.orders);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);
  if (!mounted) {
    return null;
  }
  if (loading) {
    return <Loading />;
  }

  const getStatusColor = (status: Order["status"]): string => {
    const colors: Record<Order["status"], string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      processing:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      delivered:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `৳${amount.toLocaleString("en-BD")}`;
  };

  const getFilteredOrders = (): Order[] => {
    let filtered = orders;

    if (activeTab === "active") {
      filtered = filtered.filter((order) =>
        ["pending", "paid", "processing", "delivered"].includes(order.status)
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter((order) => order.status === "completed");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((order) => order.status === "cancelled");
    }

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.gig.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleStatusChange = (
    orderId: string, // Changed from number to string
    newStatus: Order["status"]
  ): void => {
    console.log("Status change:", orderId, newStatus);
    // In a real app, you would update the state or make an API call here
  };

  const OrderModal: React.FC<OrderModalProps> = ({
    order,
    show,
    onClose,
    user,
    onStatusChange,
  }) => {
    if (!show || !order) return null;

    

    const client = order.client;
    const otherUser =
      user.userType === "freelancer" ? client : order.freelancer;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {order.gig.title}
                </h2>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Order #{order._id}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={otherUser.avatar}
                  alt={otherUser.firstName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {otherUser.username}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.userType === "freelancer" ? "Client" : "Freelancer"}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Order Notes
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Order Date:
                  </span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Updated:
                  </span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(order.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>

                {user.userType === "freelancer" &&
                  order.status === "paid" && (
                    <button
                      onClick={() => {
                        router.push(`/delivery/${order._id}`);
                        onClose();
                      }}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Deliver Work
                    </button>
                  )}

                {user.userType === "client" && order.status === "delivered" && (
                  <button
                    onClick={() => {
                      router.push(`/orders/deliveries/${order._id}`);
                      onClose();
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Deliveries
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Orders
              </h1>
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400">
                {user.userType === "freelancer" ? "Freelancer" : "Client"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar}
                  alt={
                    user.userType === "freelancer"
                      ? user.companyName || user.username
                      : user.displayName || user.username
                  }
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.userType === "freelancer"
                    ? user.companyName || user.username
                    : user.displayName || user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {
                    orders.filter((o) =>
                      ["pending", "paid", "processing", "delivered"].includes(
                        o.status
                      )
                    ).length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.userType === "freelancer"
                    ? "Total Earnings"
                    : "Total Spent"}
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(
                    orders
                      .filter((o) => o.status === "completed")
                      .reduce((sum, o) => sum + o.totalAmount, 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-8 border-b dark:border-gray-700">
            {[
              { id: "active", label: "Active Orders" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          {getFilteredOrders().length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {getFilteredOrders().map((order) => {
                const otherUser =
                  user.userType === "freelancer"
                    ? order.client
                    : order.freelancer;

                return (
                  <div
                    key={order._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.firstName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {order.gig.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {otherUser.firstName + " " + otherUser.lastName} •{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white min-w-[80px] text-right">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No orders match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <OrderModal
        order={selectedOrder}
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        user={user}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default OrderManagement;
