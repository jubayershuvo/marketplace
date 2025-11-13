"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface SettingsData {
  _id?: string;
  bkash: string;
  nagad: string;
  withdraw_fee_percentage: number;
  min_withdraw_amount: number;
  min_fee: number;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    bkash: "",
    nagad: "",
    withdraw_fee_percentage: 0,
    min_withdraw_amount: 0,
    min_fee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        toast.success("Settings updated successfully");
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      const numValue = value === "" ? "" : parseFloat(value) || 0;
      setSettings((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getInputValue = (value: number): string => {
    return value === 0 ? "" : value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="text-lg font-semibold text-purple-300 animate-pulse">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-300 bg-clip-text text-transparent mb-2">
            System Settings
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your payment methods and withdrawal preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Payment Methods Card */}
          <div className="bg-gradient-to-br from-gray-800 to-blue-900/20 rounded-2xl shadow-xl border border-blue-800/30 p-6 transform hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Payment Methods
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* bKash Input */}
              <div className="space-y-2">
                <label htmlFor="bkash" className="block text-sm font-semibold text-gray-300 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mr-2"></div>
                  bKash Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="bkash"
                    name="bkash"
                    value={settings.bkash}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/80 border-2 border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">b</span>
                  </div>
                </div>
              </div>

              {/* Nagad Input */}
              <div className="space-y-2">
                <label htmlFor="nagad" className="block text-sm font-semibold text-gray-300 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mr-2"></div>
                  Nagad Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nagad"
                    name="nagad"
                    value={settings.nagad}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/80 border-2 border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Settings Card */}
          <div className="bg-gradient-to-br from-gray-800 to-purple-900/20 rounded-2xl shadow-xl border border-purple-800/30 p-6 transform hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent">
                Withdrawal Settings
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Withdrawal Fee */}
              <div className="space-y-2">
                <label htmlFor="withdraw_fee_percentage" className="block text-sm font-semibold text-gray-300 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full mr-2"></div>
                  Withdrawal Fee (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="withdraw_fee_percentage"
                    name="withdraw_fee_percentage"
                    value={getInputValue(settings.withdraw_fee_percentage)}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-700/80 border-2 border-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400 font-semibold">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Percentage fee charged on withdrawals
                </p>
              </div>

              {/* Minimum Withdrawal Amount */}
              <div className="space-y-2">
                <label htmlFor="min_withdraw_amount" className="block text-sm font-semibold text-gray-300 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2"></div>
                  Minimum Amount (৳)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="min_withdraw_amount"
                    name="min_withdraw_amount"
                    value={getInputValue(settings.min_withdraw_amount)}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 bg-gray-700/80 border-2 border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 font-semibold">
                    ৳
                  </div>
                </div>
              </div>

              {/* Minimum Fee */}
              <div className="space-y-2">
                <label htmlFor="min_fee" className="block text-sm font-semibold text-gray-300 flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-2"></div>
                  Minimum Fee (৳)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="min_fee"
                    name="min_fee"
                    value={getInputValue(settings.min_fee)}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 bg-gray-700/80 border-2 border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 font-semibold">
                    ৳
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Minimum fee charged
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center mx-auto min-w-[200px]"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}