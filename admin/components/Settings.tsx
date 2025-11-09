"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast"; // or your preferred toast library

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
      // Use empty string for empty input, otherwise parse the number
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

  // Helper function to convert number to string for input values
  const getInputValue = (value: number): string => {
    return value === 0 ? "" : value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg dark:text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">System Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 dark:text-white dark:border-gray-600">Payment Methods</h2>
          
          <div>
            <label htmlFor="bkash" className="block text-sm font-medium mb-1 dark:text-gray-300">
              bKash Number
            </label>
            <input
              type="text"
              id="bkash"
              name="bkash"
              value={settings.bkash}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="nagad" className="block text-sm font-medium mb-1 dark:text-gray-300">
              Nagad Number
            </label>
            <input
              type="text"
              id="nagad"
              name="nagad"
              value={settings.nagad}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 dark:text-white dark:border-gray-600">Withdrawal Settings</h2>
          
          <div>
            <label htmlFor="withdraw_fee_percentage" className="block text-sm font-medium mb-1 dark:text-gray-300">
              Withdrawal Fee (%)
            </label>
            <input
              type="number"
              id="withdraw_fee_percentage"
              name="withdraw_fee_percentage"
              value={getInputValue(settings.withdraw_fee_percentage)}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Percentage fee charged on withdrawals
            </p>
          </div>

          <div>
            <label htmlFor="min_withdraw_amount" className="block text-sm font-medium mb-1 dark:text-gray-300">
              Minimum Withdrawal Amount (৳)
            </label>
            <input
              type="number"
              id="min_withdraw_amount"
              name="min_withdraw_amount"
              value={getInputValue(settings.min_withdraw_amount)}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="min_fee" className="block text-sm font-medium mb-1 dark:text-gray-300">
              Minimum Fee Amount (৳)
            </label>
            <input
              type="number"
              id="min_fee"
              name="min_fee"
              value={getInputValue(settings.min_fee)}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum fee charged even if percentage fee is lower
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}