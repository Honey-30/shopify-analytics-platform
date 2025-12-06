"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Demo data
const demoData = {
  totalRevenue: 247890.50,
  totalOrders: 1456,
  totalCustomers: 892,
  avgOrderValue: 170.25,
  ordersOverTime: [
    { date: '2024-11-07', orders: 45, revenue: 7650 },
    { date: '2024-11-08', orders: 52, revenue: 8840 },
    { date: '2024-11-09', orders: 38, revenue: 6460 },
    { date: '2024-11-10', orders: 61, revenue: 10370 },
    { date: '2024-11-11', orders: 48, revenue: 8160 },
    { date: '2024-11-12', orders: 55, revenue: 9350 },
    { date: '2024-11-13', orders: 42, revenue: 7140 },
    { date: '2024-11-14', orders: 58, revenue: 9860 },
    { date: '2024-11-15', orders: 67, revenue: 11390 },
    { date: '2024-11-16', orders: 53, revenue: 9010 },
    { date: '2024-11-17', orders: 49, revenue: 8330 },
    { date: '2024-11-18', orders: 71, revenue: 12070 },
    { date: '2024-11-19', orders: 44, revenue: 7480 },
    { date: '2024-11-20', orders: 62, revenue: 10540 },
    { date: '2024-11-21', orders: 56, revenue: 9520 },
    { date: '2024-11-22', orders: 48, revenue: 8160 },
    { date: '2024-11-23', orders: 73, revenue: 12410 },
    { date: '2024-11-24', orders: 59, revenue: 10030 },
    { date: '2024-11-25', orders: 51, revenue: 8670 },
    { date: '2024-11-26', orders: 64, revenue: 10880 },
    { date: '2024-11-27', orders: 47, revenue: 7990 },
    { date: '2024-11-28', orders: 69, revenue: 11730 },
    { date: '2024-11-29', orders: 54, revenue: 9180 },
    { date: '2024-11-30', orders: 58, revenue: 9860 },
    { date: '2024-12-01', orders: 63, revenue: 10710 },
    { date: '2024-12-02', orders: 76, revenue: 12920 },
    { date: '2024-12-03', orders: 68, revenue: 11560 },
    { date: '2024-12-04', orders: 55, revenue: 9350 },
    { date: '2024-12-05', orders: 72, revenue: 12240 },
    { date: '2024-12-06', orders: 65, revenue: 11050 },
  ],
  topCustomers: [
    { id: 1, email: 'sarah.johnson@example.com', firstName: 'Sarah', lastName: 'Johnson', totalSpent: 12450.00, ordersCount: 28 },
    { id: 2, email: 'michael.chen@example.com', firstName: 'Michael', lastName: 'Chen', totalSpent: 10890.50, ordersCount: 24 },
    { id: 3, email: 'emma.williams@example.com', firstName: 'Emma', lastName: 'Williams', totalSpent: 9750.25, ordersCount: 21 },
    { id: 4, email: 'james.rodriguez@example.com', firstName: 'James', lastName: 'Rodriguez', totalSpent: 8920.00, ordersCount: 19 },
    { id: 5, email: 'olivia.martinez@example.com', firstName: 'Olivia', lastName: 'Martinez', totalSpent: 8340.75, ordersCount: 17 },
  ],
  recentOrders: [
    { id: 1, orderNumber: '10234', totalPrice: 299.99, orderDate: '2024-12-06T10:30:00Z', financialStatus: 'paid', customerEmail: 'sarah.johnson@example.com' },
    { id: 2, orderNumber: '10233', totalPrice: 189.50, orderDate: '2024-12-06T09:15:00Z', financialStatus: 'paid', customerEmail: 'michael.chen@example.com' },
    { id: 3, orderNumber: '10232', totalPrice: 450.00, orderDate: '2024-12-05T16:45:00Z', financialStatus: 'paid', customerEmail: 'emma.williams@example.com' },
    { id: 4, orderNumber: '10231', totalPrice: 125.75, orderDate: '2024-12-05T14:20:00Z', financialStatus: 'pending', customerEmail: 'james.rodriguez@example.com' },
    { id: 5, orderNumber: '10230', totalPrice: 675.00, orderDate: '2024-12-05T11:30:00Z', financialStatus: 'paid', customerEmail: 'olivia.martinez@example.com' },
    { id: 6, orderNumber: '10229', totalPrice: 234.50, orderDate: '2024-12-04T18:00:00Z', financialStatus: 'paid', customerEmail: 'david.brown@example.com' },
    { id: 7, orderNumber: '10228', totalPrice: 399.99, orderDate: '2024-12-04T15:15:00Z', financialStatus: 'paid', customerEmail: 'sophia.garcia@example.com' },
    { id: 8, orderNumber: '10227', totalPrice: 156.25, orderDate: '2024-12-04T12:45:00Z', financialStatus: 'paid', customerEmail: 'daniel.lee@example.com' },
  ]
}

export default function DemoPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${demoData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-5 h-5" />,
      change: '+12.5%',
      positive: true,
    },
    {
      title: 'Total Orders',
      value: demoData.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      change: '+8.2%',
      positive: true,
    },
    {
      title: 'Total Customers',
      value: demoData.totalCustomers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      change: '+5.7%',
      positive: true,
    },
    {
      title: 'Avg. Order Value',
      value: `$${demoData.avgOrderValue.toFixed(2)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: '+3.1%',
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Demo Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              ShopifyPro <span className="text-sm font-normal text-gray-500 ml-2">Demo</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Interactive Demo Dashboard</h2>
              <p className="text-blue-100">
                Explore ShopifyPro with sample data. Sign up to connect your real store!
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your store today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demoData.ordersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#000000" 
                      strokeWidth={2}
                      dot={{ fill: '#000000', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>By total spent</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demoData.topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis 
                      dataKey="email" 
                      className="text-xs"
                      tickFormatter={(email) => email.split('@')[0].substring(0, 8)}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar 
                      dataKey="totalSpent" 
                      fill="#000000"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Order</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.recentOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {order.customerEmail}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-right text-gray-900 dark:text-white">
                          ${Number(order.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.financialStatus === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {order.financialStatus}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 bg-gray-900 dark:bg-gray-800 rounded-lg p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect your Shopify store and get real-time insights, powerful analytics, and actionable data to grow your business.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, change, positive }: any) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <p className={`text-sm font-medium ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  )
}
