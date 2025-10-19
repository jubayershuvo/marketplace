"use client";

import { useEffect, useState } from "react";
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface DeliverOrderProps {
  orderId: string;
}

export default function DeliverOrderPage({ orderId }: DeliverOrderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAppSelector((state) => state.userAuth);
  const router = useRouter();

  useEffect(() => {
    if (user && user.userType !== "freelancer") {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) return setError("Please upload a file before submitting.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("order", orderId);

    setLoading(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to deliver order");

      setSuccess(true);
      setFile(null);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {success ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your order has been delivered successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order ID: <span className="font-mono font-semibold dark:text-gray-200">{orderId}</span>
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setFile(null);
                setError("");
              }}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-medium transition duration-200 transform hover:scale-105"
            >
              Deliver Another Order
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Deliver Order
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Complete delivery for{" "}
                <span className="font-mono font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {orderId}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                } ${file ? "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20" : ""}`}
              >
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="*/*"
                />
                <div className="text-center">
                  <Upload
                    className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                      file ? "text-green-500" : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">
                    {file ? "File Selected" : "Drop your file here"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        📄 {file.name}
                      </span>
                    ) : (
                      "or click to browse"
                    )}
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                  loading || !file
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Deliver Order"
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Supports all file types. Max size depends on your server configuration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}