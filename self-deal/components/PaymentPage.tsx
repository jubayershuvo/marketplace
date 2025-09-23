"use client";
import React, { useEffect, useState } from "react";
import {
  Copy,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Phone,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface PaymentPageProps {
  amount?: number;
}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const [selectedMethod, setSelectedMethod] = useState<"nagad" | "bkash" | "">(
    ""
  );
  const [trxId, setTrxId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | "">(
    ""
  );
  const [amount, setAmount] = useState<number>(0);
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  useEffect(() => {
    if (!id) {
      router.push("/");
    }
  }, []);

  // Payment numbers with proper typing
  const paymentNumbers: Record<"nagad" | "bkash", string> = {
    nagad: "01712345678",
    bkash: "01987654321",
  };

  const copyToClipboard = (number: string, method: "nagad" | "bkash"): void => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(method);
    setTimeout(() => setCopiedNumber(""), 2000);
  };

  const onPaymentError = (message: string): void => {
    setPaymentStatus("error");
    setIsLoading(false);
    alert(message);
  };

  const onPaymentSuccess = (): void => {
    setPaymentStatus("success");
    setIsLoading(false);
  };

  const handlePaymentSubmit = async (): Promise<void> => {
    if (!selectedMethod || !trxId || !amount || amount <= 0) {
      setPaymentStatus("error");
      onPaymentError?.("সব তথ্য পূরণ করুন এবং সঠিক পরিমাণ নিশ্চিত করুন");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          transactionId: trxId,
          amount: amount,
          phoneNumber: paymentNumbers[selectedMethod],
        }),
      });

      if (response.ok) {
        setPaymentStatus("success");
        setTrxId("");
        onPaymentSuccess?.();
      } else {
        setPaymentStatus("error");
        const errorData = await response.json().catch(() => ({}));
        onPaymentError?.(
          errorData.message || "পেমেন্ট যাচাই করতে সমস্যা হয়েছে"
        );
      }
    } catch (error) {
      setPaymentStatus("error");
      onPaymentError?.("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            পেমেন্ট করুন
          </h1>
          <p className="text-gray-600">
            নিচের নির্দেশনা অনুসরণ করে পেমেন্ট সম্পূর্ণ করুন
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            পেমেন্ট করুন: ৳{(amount || 0).toLocaleString("en-US")}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* bKash Option */}
            <button
              onClick={() => setSelectedMethod("bkash")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === "bkash"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              <div className="text-center">
                <div className="bg-pink-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">bKash</span>
                </div>
                <p className="text-sm font-medium text-gray-800">বিকাশ</p>
              </div>
            </button>

            {/* Nagad Option */}
            <button
              onClick={() => setSelectedMethod("nagad")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === "nagad"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="text-center">
                <div className="bg-orange-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">নগদ</span>
                </div>
                <p className="text-sm font-medium text-gray-800">নগদ</p>
              </div>
            </button>
          </div>

          {/* Payment Instructions */}
          {selectedMethod && (
            <div
              className={`border-2 rounded-xl p-4 mb-6 ${
                selectedMethod === "bkash"
                  ? "border-pink-200 bg-pink-50"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                পেমেন্ট নির্দেশনা
              </h3>

              <div className="space-y-3 text-sm text-gray-700">
                <p>১. নিচের নম্বরটি কপি করুন</p>

                {/* Copy Number Section */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-semibold">
                      {paymentNumbers[selectedMethod]}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          paymentNumbers[selectedMethod],
                          selectedMethod
                        )
                      }
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        copiedNumber === selectedMethod
                          ? "bg-green-100 text-green-700"
                          : selectedMethod === "bkash"
                          ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      }`}
                    >
                      {copiedNumber === selectedMethod ? (
                        <>
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          কপি হয়েছে
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 inline mr-1" />
                          কপি করুন
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p>
                    ২. আপনার {selectedMethod === "bkash" ? "বিকাশ" : "নগদ"}{" "}
                    অ্যাপ খুলুন
                  </p>
                  <p>৩. &quot;Send Money&quot; অপশনে ক্লিক করুন</p>
                  <p>৪. কপি করা নম্বরটি পেস্ট করুন</p>
                  <p>৫. টাকার পরিমাণ লিখুন এবং পেমেন্ট সম্পূর্ণ করুন</p>
                  <p>৬. ট্রানজেকশন আইডি (TrxID) নিচের ফর্মে দিন</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {selectedMethod && (
            <div className="space-y-4">
              {/* Amount Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পেমেন্ট করবেন
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-lg font-semibold text-gray-800">
                  ৳{(amount || 0).toLocaleString("en-US")} টাকা
                </div>
              </div>

              <div>
                <label
                  htmlFor="trxId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ট্রানজেকশন আইডি (TrxID)
                </label>
                <input
                  type="text"
                  id="trxId"
                  value={trxId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTrxId(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="যেমনঃ 8N5A7X9D2C"
                />
                <p className="text-xs text-gray-500 mt-1">
                  পেমেন্ট সম্পূর্ণ করার পর যে আইডি পাবেন তা এখানে লিখুন
                </p>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={isLoading || !selectedMethod || !trxId}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                  isLoading || !selectedMethod || !trxId
                    ? "bg-gray-400 cursor-not-allowed"
                    : selectedMethod === "bkash"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "bg-orange-600 hover:bg-orange-700"
                } focus:ring-4 focus:ring-opacity-50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    যাচাই করা হচ্ছে...
                  </div>
                ) : (
                  "পেমেন্ট যাচাই করুন"
                )}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {paymentStatus === "success" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  পেমেন্ট সফল হয়েছে! ধন্যবাদ।
                </span>
              </div>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">
                  পেমেন্ট যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            গুরুত্বপূর্ণ তথ্য:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• পেমেন্ট করার আগে টাকার পরিমাণ ভালো করে দেখে নিন</li>
            <li>• ট্রানজেকশন আইডি সঠিকভাবে দিন</li>
            <li>• কোনো সমস্যা হলে সাপোর্ট টিমের সাথে যোগাযোগ করুন</li>
            <li>• পেমেন্ট যাচাই হতে ২-৩ মিনিট সময় লাগতে পারে</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
