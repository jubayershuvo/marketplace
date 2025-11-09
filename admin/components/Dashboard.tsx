'use client';
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Users, ShoppingCart, Briefcase, TrendingUp, DollarSign, Activity } from 'lucide-react';

// Type definitions
interface Payment {
  amount: number;
  type: 'deposit' | 'order';
  trxId: string;
  method?: string;
}

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalGigs: number;
  clientUser: number;
  freelancerUser: number;
  last24HoursNewUsers: unknown[];
  last24HoursNewOrders: unknown[];
  last7DaysActiveUsers: unknown[];
  payments: Payment[];
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change: string;
  subStats?: {
    label: string;
    value: number;
  }[];
}

// Recharts-compatible interfaces with index signature
interface ChartDataItem {
  [key: string]: string | number | undefined;
}

interface PieChartData extends ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface BarChartData extends ChartDataItem {
  name: string;
  value: number;
}

interface LineChartData extends ChartDataItem {
  name: string;
  amount: number;
}

// Custom tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: ChartDataItem;
    value?: number;
    name?: string;
    dataKey?: string;
  }>;
  label?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/dashboard');
      const result: DashboardData = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Color palette for charts
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const chartData = payload[0]?.payload;
      return (
        <div className="bg-slate-800 border border-purple-500 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{chartData && 'name' in chartData ? String(chartData.name) : label}</p>
          <p className="text-purple-300">
            Value: <span className="text-white">{payload[0]?.value}</span>
          </p>
          {chartData && 'fill' in chartData && chartData.fill && (
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: String(chartData.fill) }}
              />
              <span className="text-white text-sm">Color indicator</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      title: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `+${data.last24HoursNewUsers.length} today`,
      subStats: [
        { label: 'Clients', value: data.clientUser },
        { label: 'Freelancers', value: data.freelancerUser }
      ]
    },
    {
      title: 'Total Orders',
      value: data.totalOrders,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-500',
      change: `+${data.last24HoursNewOrders.length} today`,
    },
    {
      title: 'Total Gigs',
      value: data.totalGigs,
      icon: Briefcase,
      color: 'from-orange-500 to-red-500',
      change: 'Active listings',
    },
    {
      title: 'Active Users (7d)',
      value: data.last7DaysActiveUsers.length,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      change: 'Last week',
    },
  ];

  const totalRevenue = data.payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
  const depositCount = data.payments.filter((p: Payment) => p.type === 'deposit').length;
  const orderCount = data.payments.filter((p: Payment) => p.type === 'order').length;

  // Prepare chart data with Recharts-compatible format
  const userTypeData: PieChartData[] = [
    { name: 'Clients', value: data.clientUser, fill: '#3b82f6' },
    { name: 'Freelancers', value: data.freelancerUser, fill: '#10b981' },
  ];

  const paymentTypeData: PieChartData[] = [
    { name: 'Deposits', value: depositCount, fill: '#8b5cf6' },
    { name: 'Orders', value: orderCount, fill: '#ec4899' },
  ];

  const recentPayments: LineChartData[] = data.payments.slice(-7).map((payment: Payment, idx: number) => ({
    name: `Day ${idx + 1}`,
    amount: payment.amount,
  }));

  const methodData = data.payments.reduce((acc: Record<string, number>, payment: Payment) => {
    const method = payment.method || 'Unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentMethodData: BarChartData[] = Object.entries(methodData).map(([name, value]: [string, number]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Admin Dashboard
          </h1>
          <p className="text-purple-300">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat: StatCard, index: number) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-purple-300 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
              
              {stat.subStats && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-2">
                    {stat.subStats.map((subStat, idx: number) => (
                      <div key={idx} className="text-center">
                        <p className="text-purple-300 text-xs">{subStat.label}</p>
                        <p className="text-white font-bold text-lg">{subStat.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Total Revenue</h2>
          </div>
          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            	৳{totalRevenue.toLocaleString()}
          </p>
          <p className="text-purple-300 mt-2">From {data.payments.length} transactions</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Types Pie Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {userTypeData.map((entry: PieChartData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Types Pie Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Payment Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {paymentTypeData.map((entry: PieChartData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Bar Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#a78bfa" fontSize={12} />
                <YAxis stroke="#a78bfa" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments Line Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Payment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentPayments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#a78bfa" fontSize={12} />
              <YAxis stroke="#a78bfa" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#ec4899" 
                strokeWidth={3} 
                dot={{ fill: '#ec4899', r: 6 }} 
                activeDot={{ r: 8, fill: '#ec4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {data.payments.slice(-10).reverse().map((payment: Payment, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${payment.type === 'deposit' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                    <DollarSign className={`w-5 h-5 ${payment.type === 'deposit' ? 'text-green-400' : 'text-blue-400'}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold capitalize">{payment.type}</p>
                    <p className="text-purple-300 text-sm">TRX: {payment.trxId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">৳{payment.amount.toLocaleString()}</p>
                  <p className="text-purple-300 text-sm">{payment.method || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}