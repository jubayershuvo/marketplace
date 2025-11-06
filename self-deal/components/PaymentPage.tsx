"use client";
import React, { useEffect, useState } from "react";
import {
  Copy,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "./Loading";

interface PaymentPageProps {
  id: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({id}:{id:string}) => {
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push("/");
    }
  }, []);
  useEffect(() => {
    async function getGigInfo() {
      if (id) {
        setLoading(true);
        try {
          const res = await axios.get(`/api/gig?id=${id}`);
          setAmount(res.data.gig.price);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    }

    getGigInfo();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

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
      onPaymentError?.("সল তথ্য পূরণ সরুন এলং সঠিনাণ নিশ্চিফ সরুন");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/create-order",
        {
          paymentMethod: selectedMethod,
          transactionId: trxId,
          amount: amount,
          paymentNumber: paymentNumbers[selectedMethod],
          gigId: id,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setPaymentStatus("success");
        setTrxId("");
        onPaymentSuccess?.();
        router.back();
      } else {
        setPaymentStatus("error");
        onPaymentError?.(
          response.data.message || "পেমেন্ট যাচাই সরতে সমস্যা হয়েছে"
        );
      }
    } catch (error) {
      setPaymentStatus("error");
      onPaymentError?.("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            পেমেন্ট করুন
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            নিচের নির্দেশনা অনুসরণ করে পেমেন্ট সম্পূর্ণ করুন
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            পেমেন্ট করুন: ৳{(amount || 0).toLocaleString("en-US")}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* bKash Option */}
            <button
              onClick={() => setSelectedMethod("bkash")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === "bkash"
                  ? "border-pink-500 dark:border-pink-400 bg-pink-50 dark:bg-pink-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-500"
              }`}
            >
              <div className="text-center">
                <div className="bg-pink-600 dark:bg-pink-500 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">bKash</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  বিকাশ
                </p>
              </div>
            </button>

            {/* Nagad Option */}
            <button
              onClick={() => setSelectedMethod("nagad")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === "nagad"
                  ? "border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500"
              }`}
            >
              <div className="text-center">
                <div className="bg-orange-600 dark:bg-orange-500 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">নগদ</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  নগদ
                </p>
              </div>
            </button>
          </div>

          {/* Payment Instructions */}
          {selectedMethod && (
            <div
              className={`border-2 rounded-xl p-4 mb-6 ${
                selectedMethod === "bkash"
                  ? "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/10"
                  : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10"
              }`}
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                পেমেন্ট নির্দেশনা
              </h3>

              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>১. নিচের নম্বরটি কপি করুন</p>

                {/* Copy Number Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-semibold dark:text-white">
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
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : selectedMethod === "bkash"
                          ? "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800"
                          : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  পেমেন্ট করবেন
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-lg font-semibold text-gray-800 dark:text-white">
                  ৳{(amount || 0).toLocaleString("en-US")} টাকা
                </div>
              </div>

              <div>
                <label
                  htmlFor="trxId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="যেমনঃ 8N5A7X9D2C"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  পেমেন্ট সম্পূর্ণ করার পর যে আইডি পাবেন তা এখানে লিখুন
                </p>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={isLoading || !selectedMethod || !trxId}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                  isLoading || !selectedMethod || !trxId
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : selectedMethod === "bkash"
                    ? "bg-pink-600 dark:bg-pink-700 hover:bg-pink-700 dark:hover:bg-pink-800"
                    : "bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800"
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
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-300 font-medium">
                  পেমেন্ট সফল হয়েছে! ধন্যবাদ।
                </span>
              </div>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-300 font-medium">
                  পেমেন্ট যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            গুরুত্বপূর্ণ তথ্য:
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
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
