"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Download,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

interface Delivery {
  _id: string;
  order: string;
  filePath: string;
  status: "pending" | "delivered";
  decision?: "accepted" | "rejected" | null;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryDownloadPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.userAuth);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);

        const deliveriesRes = await fetch(`/api/deliveries?orderId=${orderId}`);
        if (!deliveriesRes.ok) throw new Error("Failed to fetch deliveries");
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(deliveriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDeliveries();
    }
  }, [orderId]);

  const handleDownload = async (delivery: Delivery) => {
    try {
      setDownloadingId(delivery._id);

      // Extract filename from filePath or create a default one
      const fileName = delivery.filePath.split('/').pop() || `delivery-${delivery._id}.pdf`;
      
      // Create a temporary anchor tag for direct download
      const a = document.createElement('a');
      a.href = delivery.filePath;
      a.download = fileName;
      a.target = '_blank'; // Open in new tab for safety
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleAccept = async (deliveryId: string) => {
    try {
      setUpdatingId(deliveryId);
      setError(null);

      const res = await fetch(`/api/deliveries/accept?id=${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to accept delivery");
      }

      const updatedDelivery = await res.json();
      setDeliveries(updatedDelivery);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept delivery"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (deliveryId: string) => {
    try {
      setUpdatingId(deliveryId);
      setError(null);

      const res = await fetch(`/api/deliveries/reject?id=${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reject delivery");
      }

      const updatedDelivery = await res.json();
      setDeliveries(
        deliveries.map((d) => (d._id === deliveryId ? updatedDelivery : d))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject delivery"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getDecisionIcon = (decision: string | null | undefined) => {
    if (!decision) return null;
    if (decision === "accepted")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (decision === "rejected")
      return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Order ID: {orderId}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Deliveries List */}
        {deliveries.length > 0 ? (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(delivery.status)}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          Delivery #{delivery._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="capitalize">{delivery.status}</span>
                      </p>
                      {delivery.filePath && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          <span className="font-medium">File:</span> {delivery.filePath.split('/').pop()}
                        </p>
                      )}
                      {delivery.decision && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Decision:
                          </span>
                          <div className="flex items-center gap-1">
                            {getDecisionIcon(delivery.decision)}
                            <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                              {delivery.decision}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handleDownload(delivery)}
                      disabled={downloadingId === delivery._id || !delivery.filePath}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
                      title={!delivery.filePath ? "No file available" : "Download file"}
                    >
                      {downloadingId === delivery._id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </button>

                    {!delivery.decision && user?.userType === "client" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(delivery._id)}
                          disabled={updatingId === delivery._id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors text-sm"
                        >
                          {updatingId === delivery._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(delivery._id)}
                          disabled={updatingId === delivery._id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors text-sm"
                        >
                          {updatingId === delivery._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No deliveries found for this order</p>
          </div>
        )}
      </div>
    </div>
  );
}